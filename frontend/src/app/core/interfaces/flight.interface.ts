import { City } from './city.interface';
import { SeatStatus } from '@core/enums/domain.enums';

export interface Flight {
  id: string;
  flightNumber: string;
  originId: string;
  destinationId: string;
  origin?: City;
  destination?: City;
  departureTime: string;
  arrivalTime: string;
  price: number;
  status: string;
  seats?: Seat[];
}

export interface Seat {
  id: string;
  flightId: string;
  seatNumber: string;
  status: SeatStatus;
  price?: number;
  isAvailable?: boolean;
}
