import { FlightEntity, FlightWithSeats, PaginatedResult } from '@flights/domain/entities/flight.entity.js';
import { FlightSearchCriteria } from '@flights/domain/interfaces/flight-search-criteria.interface.js';

export interface FlightRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<FlightEntity>>;
  findById(id: string): Promise<FlightWithSeats | null>;
  search(criteria: FlightSearchCriteria): Promise<PaginatedResult<FlightEntity>>;
}

export const FLIGHT_REPOSITORY = Symbol('FLIGHT_REPOSITORY');
