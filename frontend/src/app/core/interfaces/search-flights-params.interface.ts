export interface SearchFlightsParams {
  originId: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
}
