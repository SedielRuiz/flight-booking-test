import { SeatStatusEnum } from '@flights/domain/enums/seat-status.enum.js';

export interface SeatEntity {
  id: string;
  seatNumber: string;
  status: SeatStatusEnum;
  flightId: string;
  createdAt: Date;
  updatedAt: Date;
}
