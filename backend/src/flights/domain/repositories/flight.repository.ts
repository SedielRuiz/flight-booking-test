import { FlightEntity, FlightWithSeats, PaginatedResult } from '@flights/domain/entities/flight.entity.js';
import { FlightSearchCriteria } from '@flights/domain/interfaces/flight-search-criteria.interface.js';
import { FlightStatusEnum, SeatStatusEnum } from '@domain/index.js';

export interface FlightRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<FlightEntity>>;
  findById(id: string): Promise<FlightWithSeats | null>;
  search(criteria: FlightSearchCriteria): Promise<PaginatedResult<FlightEntity>>;
  updateStatus(id: string, status: FlightStatusEnum): Promise<FlightEntity | null>;
}

export const FLIGHT_REPOSITORY = Symbol('FLIGHT_REPOSITORY');
