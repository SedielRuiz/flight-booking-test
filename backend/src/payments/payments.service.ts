import { CryptoService } from '@common/crypto/crypto.service.js';
import { RedisService } from '@common/redis/redis.service.js';
import { FlightStatusEnum, SeatStatusEnum } from '@domain/index.js';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@prisma/prisma.service.js';
import type { ProcessPaymentDto } from './dtos/process-payment.dto.js';

export interface BookingResult {
  bookingCode: string;
  seatNumber: string;
  flightNumber: string;
  passengerName: string;
  amount: number;
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async processPayment(dto: ProcessPaymentDto): Promise<BookingResult> {
    // 1. Decrypt RSA payload — card data is never persisted in plain text
    let paymentData: {
      cardName: string;
      cardNumber: string;
      expiryDate: string;
      cvv: string;
      flightId: string;
      seatId: string;
    };

    try {
      const decryptedString = this.cryptoService.decryptRSA(
        dto.encryptedPayload,
      );
      paymentData = JSON.parse(decryptedString);
    } catch {
      throw new BadRequestException('Invalid encrypted payload');
    }

    // Use flightId/seatId from the body (validated by DTO) — the encrypted payload also contains
    // them as an integrity check, but we trust the validated DTO fields
    const { flightId, seatId } = dto;

    // 2. Verify the seat still has a Redis lock (user's reservation window is active)
    const lockKey = `flight:${flightId}:seat:${seatId}:lock`;
    const lockExists = await this.redisService.getClient().exists(lockKey);
    if (!lockExists) {
      throw new BadRequestException(
        'The seat reservation window has expired. Please select a new seat.',
      );
    }

    // 3. Verify seat and flight exist and seat is not already RESERVED
    const seat = await this.prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat) throw new NotFoundException('Seat not found');
    if (seat.status === SeatStatusEnum.RESERVED) {
      throw new BadRequestException('This seat has already been booked');
    }

    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      include: { origin: true, destination: true },
    });
    if (!flight) throw new NotFoundException('Flight not found');

    // 4. Simulate PCI DSS — log only masked card data, never store raw numbers
    console.log('--- DECRYPTED PAYMENT DATA (PCI DSS SIMULATION) ---');
    console.log(
      `Card Number: **** **** **** ${paymentData.cardNumber.slice(-4)}`,
    );
    console.log(`Card Holder: ${paymentData.cardName}`);
    console.log(`Expiry: ${paymentData.expiryDate}`);
    console.log('----------------------------------------------------');

    // 5. Run the full booking in a single Prisma transaction
    const bookingCode = `DV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedSeatCount = await tx.seat.updateMany({
        where: { id: seatId, status: SeatStatusEnum.AVAILABLE },
        data: { status: SeatStatusEnum.RESERVED },
      });

      if (updatedSeatCount.count === 0) {
        throw new BadRequestException(
          'Seat was just booked by another transaction',
        );
      }

      // 5b. Create the Reservation
      const reservation = await tx.reservation.create({
        data: {
          paymentCode: bookingCode,
          status: 'CONFIRMED',
          flightId,
        },
      });

      // 5c. Create the Ticket linked to seat and reservation
      await tx.ticket.create({
        data: {
          passengerName: paymentData.cardName,
          passengerTypeDocument: 'CC',
          passengerDocument: '000000000',
          reservationId: reservation.id,
          seatId,
        },
      });

      // 5d. Record the payment (masked card number only — no raw PAN storage)
      await tx.payment.create({
        data: {
          amount: flight.price,
          currency: 'COP',
          cardNumberMasked: `**** **** **** ${paymentData.cardNumber.slice(-4)}`,
          status: 'SUCCESS',
          reservationId: reservation.id,
        },
      });

      // 5e. Check if there are any available seats left
      const availableSeatsCount = await tx.seat.count({
        where: { flightId, status: SeatStatusEnum.AVAILABLE },
      });

      let isSoldOut = false;
      if (availableSeatsCount === 0) {
        await tx.flight.update({
          where: { id: flightId },
          data: { status: FlightStatusEnum.SOLD_OUT },
        });
        isSoldOut = true;
      }

      return { reservation, isSoldOut };
    });

    // 6. Remove the Redis lock — seat is now permanently booked in DB
    await this.redisService.releaseLock(lockKey);

    // 7. Broadcast SSE event so all connected clients update the seat map in real time
    this.eventEmitter.emit('app.events', {
      type: 'SEAT_BOOKED',
      payload: {
        flightId,
        seatId,
        seatNumber: seat.seatNumber,
        bookingCode,
      },
    });

    if (result.isSoldOut) {
      this.eventEmitter.emit('app.events', {
        type: 'FLIGHT_SOLD_OUT',
        payload: { flightId },
      });
    }

    return {
      bookingCode,
      seatNumber: seat.seatNumber,
      flightNumber: flight.flightNumber,
      passengerName: paymentData.cardName,
      amount: flight.price,
    };
  }
}
