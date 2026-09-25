// Mirrors backend enums — keep in sync with Prisma schema

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  LOCKED = 'LOCKED',
  BOOKED = 'BOOKED',
  RESERVED = 'RESERVED',
}

export enum FlightStatus {
  SCHEDULED = 'SCHEDULED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
  SOLD_OUT = 'SOLD_OUT',
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
