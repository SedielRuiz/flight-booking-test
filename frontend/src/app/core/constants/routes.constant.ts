export const APP_ROUTES = {
  HOME: '/',
  FLIGHTS: '/flights',
  RESERVATIONS: '/reservations',
  SEAT_SELECTION: (flightId: string) => `/flights/${flightId}/seats`,
  CHECKOUT: '/checkout',
  BOOKING_CONFIRMATION: '/booking-confirmation',
} as const;
