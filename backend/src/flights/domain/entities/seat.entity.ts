import { FlightStatusEnum, SeatStatusEnum } from '@domain/index.js';

export interface SeatEntity {
  id: string;
  seatNumber: string;
  status: SeatStatusEnum;
  flightId: string;
  createdAt: Date;
  updatedAt: Date;
}
