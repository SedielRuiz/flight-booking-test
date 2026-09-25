import type {
  FlightEntity,
  FlightWithSeats,
  PaginatedResult,
} from '@flights/domain/entities/flight.entity.js';
import { FlightStatusEnum } from '@flights/domain/enums/flight-status.enum.js';
import type { FlightSearchCriteria } from '@flights/domain/interfaces/flight-search-criteria.interface.js';
import type { FlightRepository } from '@flights/domain/repositories/flight.repository.js';
import { FLIGHT_REPOSITORY } from '@flights/domain/repositories/flight.repository.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { RedisService } from '@common/redis/redis.service.js';
import { PrismaService } from '@prisma/prisma.service.js';

@Injectable()
export class FlightsService {
  constructor(
    @Inject(FLIGHT_REPOSITORY)
    private readonly flightRepository: FlightRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<FlightEntity>> {
    return this.flightRepository.findAll(page, limit);
  }

  async findById(id: string): Promise<FlightWithSeats | null> {
    const flight = await this.flightRepository.findById(id);
    if (!flight) {
      throw new NotFoundException(`Flight with id "${id}" not found`);
    }

    const keys = await this.redisService
      .getClient()
      .keys(`flight:${id}:seat:*:lock`);
    const lockedSeatIds = keys.map((key) => key.split(':')[3]);

    flight.seats = flight.seats.map((seat) => {
      if (lockedSeatIds.includes(seat.id)) {
        return { ...seat, isAvailable: false };
      }
      return seat;
    });

    return flight;
  }

  async search(
    criteria: FlightSearchCriteria,
  ): Promise<PaginatedResult<FlightEntity>> {
    const searchCriteria = { ...criteria };

    if (!searchCriteria.startDate) {
      searchCriteria.startDate = new Date();
    }

    if (!searchCriteria.endDate) {
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 7);
      searchCriteria.endDate = defaultEndDate;
    }

    return this.flightRepository.search(searchCriteria);
  }

  async updateStatus(
    id: string,
    status: FlightStatusEnum,
  ): Promise<FlightEntity | null> {
    const flight = await this.flightRepository.updateStatus(id, status);
    
    if (!flight) {
      throw new NotFoundException(`Flight with id "${id}" not found`);
    }
    
    this.eventEmitter.emit('app.events', {
      type: 'FLIGHT_STATUS_UPDATED',
      payload: {
        flightId: flight.id,
        status: flight.status,
      },
    });

    return flight;
  }

  async lockSeat(
    flightId: string,
    seatId: string,
    userId: string = 'mock-user-123',
  ): Promise<void> {
    const lockKey = `flight:${flightId}:seat:${seatId}:lock`;
    const isLocked = await this.redisService.acquireLock(lockKey, 600); // 10 minutes

    if (!isLocked) {
      throw new NotFoundException(`Seat with id "${seatId}" is already locked or unavailable`);
    }

    this.eventEmitter.emit('app.events', {
      type: 'SEAT_LOCKED',
      payload: {
        flightId,
        seatId,
        userId,
        expiresAt: new Date(Date.now() + 600000),
      },
    });
  }

  async unlockSeat(flightId: string, seatId: string): Promise<void> {
    const lockKey = `flight:${flightId}:seat:${seatId}:lock`;
    await this.redisService.releaseLock(lockKey);

    this.eventEmitter.emit('app.events', {
      type: 'SEAT_UNLOCKED',
      payload: {
        flightId,
        seatId,
      },
    });
  }

  async getMetrics(): Promise<any[]> {
    const flights = await this.prisma.flight.findMany({
      include: {
        origin: true,
        destination: true,
        seats: true,
      },
      orderBy: { departureTime: 'asc' }
    });

    const keys = await this.redisService.getClient().keys(`flight:*:seat:*:lock`);
    const lockedSeatIds = new Set(keys.map((key) => key.split(':')[3]));

    return flights.map(f => {
      let available = 0;
      let reserved = 0;
      let locked = 0;

      f.seats.forEach(s => {
        if (s.status === 'RESERVED') {
          reserved++;
        } else if (lockedSeatIds.has(s.id)) {
          locked++;
        } else {
          available++;
        }
      });

      return {
        id: f.id,
        flightNumber: f.flightNumber,
        origin: f.origin.code,
        destination: f.destination.code,
        status: f.status,
        metrics: {
          total: f.seats.length,
          available,
          locked,
          reserved
        }
      };
    });
  }

  async getReservationByCode(code: string) {
    const reservation = await this.prisma.reservation.findFirst({
      where: { paymentCode: code },
      include: {
        flight: true,
        tickets: {
          include: { seat: true }
        },
        payment: true
      }
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with code "${code}" not found`);
    }

    const ticket = reservation.tickets[0];
    const payment = reservation.payment;

    return {
      bookingCode: reservation.paymentCode,
      seatNumber: ticket?.seat?.seatNumber,
      flightNumber: reservation.flight.flightNumber,
      passengerName: ticket?.passengerName,
      amount: payment?.amount
    };
  }
}
