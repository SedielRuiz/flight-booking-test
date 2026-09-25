import type { CityEntity } from '@cities/domain/entities/city.entity.js';
import type { SeatEntity } from '@flights/domain/entities/seat.entity.js';
import { FlightStatusEnum, SeatStatusEnum } from '@domain/index.js';

export interface FlightEntity {
  id: string;
  flightNumber: string;
  originId: string;
  destinationId: string;
  origin?: Pick<CityEntity, 'name' | 'code'>;
  destination?: Pick<CityEntity, 'name' | 'code'>;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  status: FlightStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlightWithSeats extends FlightEntity {
  seats: Omit<SeatEntity, 'createdAt' | 'updatedAt' | 'flightId'>[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
