export const ROUTES = {
  HEALTH: 'api/health',
  EVENTS: 'api/events',
  CITIES: {
    BASE: 'api/cities',
  },
  FLIGHTS: {
    BASE: 'api/flights',
    BY_ID: ':id',
    UPDATE_STATUS: ':id/status',
    SEATS: {
      LOCK: ':id/seats/:seatId/lock',
      UNLOCK: ':id/seats/:seatId/unlock',
    },
  },
  CRYPTO: {
    BASE: 'api/crypto',
    PUBLIC_KEY: 'public-key',
  },
  PAYMENTS: {
    BASE: 'api/payments',
  },
} as const;
