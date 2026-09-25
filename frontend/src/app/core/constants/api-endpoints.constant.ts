export const API_ENDPOINTS = {
  FLIGHTS: {
    SEARCH: '/flights',
    BY_ID: (id: string) => `/flights/${id}`,
    LOCK_SEAT: (flightId: string, seatId: string) =>
      `/flights/${flightId}/seats/${seatId}/lock`,
    UNLOCK_SEAT: (flightId: string, seatId: string) =>
      `/flights/${flightId}/seats/${seatId}/unlock`,
  },
  PAYMENTS: {
    PROCESS: '/payments',
  },
  CRYPTO: {
    PUBLIC_KEY: '/crypto/public-key',
  },
  CITIES: {
    GET_ALL: '/cities',
  },
};
