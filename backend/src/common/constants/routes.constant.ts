export const ROUTES = {
  HEALTH: 'api/health',
  CITIES: {
    BASE: 'api/cities',
  },
  FLIGHTS: {
    BASE: 'api/flights',
    BY_ID: ':id',
    SEATS: {
      LOCK: ':id/seats/:seatId/lock',
    },
  },
} as const;
