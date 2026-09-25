import {
  FlightEntity,
  FlightWithSeats,
} from '@flights/domain/entities/flight.entity.js';
import { FlightStatusEnum, SeatStatusEnum } from '@domain/index.js';
import { City, Flight, Seat } from '@prisma/client';

type PrismaFlight = Flight & {
  origin?: City | null;
  destination?: City | null;
  seats?: Seat[];
};

export class FlightMapper {
  static toDomain(prismaFlight: PrismaFlight): FlightEntity {
    return {
      id: prismaFlight.id,
      flightNumber: prismaFlight.flightNumber,
      originId: prismaFlight.originId,
      destinationId: prismaFlight.destinationId,
      origin: prismaFlight.origin
        ? {
            name: prismaFlight.origin.name,
            code: prismaFlight.origin.code,
          }
        : undefined,
      destination: prismaFlight.destination
        ? {
            name: prismaFlight.destination.name,
            code: prismaFlight.destination.code,
          }
        : undefined,
      departureTime: prismaFlight.departureTime,
      arrivalTime: prismaFlight.arrivalTime,
      price: prismaFlight.price,
      status:
        FlightStatusEnum[prismaFlight.status as keyof typeof FlightStatusEnum],
      createdAt: prismaFlight.createdAt,
      updatedAt: prismaFlight.updatedAt,
    };
  }

  static toDomainWithSeats(prismaFlight: PrismaFlight): FlightWithSeats {
    const flight = this.toDomain(prismaFlight);
    return {
      ...flight,
      seats: prismaFlight.seats
        ? prismaFlight.seats.map((seat) => ({
            id: seat.id,
            seatNumber: seat.seatNumber,
            status: SeatStatusEnum[seat.status as keyof typeof SeatStatusEnum],
          }))
        : [],
    };
  }
}
