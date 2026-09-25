export enum FlightStatusEnum {
  SCHEDULED = 'SCHEDULED',
  BOARDING = 'BOARDING',
  DEPARTED = 'DEPARTED',
  ARRIVED = 'ARRIVED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED',
  SOLD_OUT = 'SOLD_OUT',
}

export enum SeatStatusEnum {
  AVAILABLE = 'AVAILABLE',
  LOCKED = 'LOCKED',
  BOOKED = 'BOOKED',
  RESERVED = 'RESERVED',
}

export enum ReservationStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

// Aliases for Frontend compatibility without breaking changes
export const FlightStatus = FlightStatusEnum;
export type FlightStatus = FlightStatusEnum;

export const SeatStatus = SeatStatusEnum;
export type SeatStatus = SeatStatusEnum;

export const ReservationStatus = ReservationStatusEnum;
export type ReservationStatus = ReservationStatusEnum;

export const PaymentStatus = PaymentStatusEnum;
export type PaymentStatus = PaymentStatusEnum;
