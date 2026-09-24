export interface FlightSearchCriteria {
  originId?: string;
  destinationId?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
}
