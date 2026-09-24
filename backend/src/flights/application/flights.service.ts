import { Inject, Injectable } from '@nestjs/common';
import type { FlightEntity, FlightWithSeats, PaginatedResult } from '@flights/domain/entities/flight.entity.js';
import type { FlightRepository } from '@flights/domain/repositories/flight.repository.js';
import { FLIGHT_REPOSITORY } from '@flights/domain/repositories/flight.repository.js';
import type { FlightSearchCriteria } from '@flights/domain/interfaces/flight-search-criteria.interface.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightStatusEnum } from '@flights/domain/enums/flight-status.enum.js';

@Injectable()
export class FlightsService {
  constructor(
    @Inject(FLIGHT_REPOSITORY)
    private readonly flightRepository: FlightRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<FlightEntity>> {
    return this.flightRepository.findAll(page, limit);
  }

  async findById(id: string): Promise<FlightWithSeats | null> {
    return this.flightRepository.findById(id);
  }

  async search(criteria: FlightSearchCriteria): Promise<PaginatedResult<FlightEntity>> {
    const searchCriteria = { ...criteria };

    if (!searchCriteria.startDate) {
      searchCriteria.startDate = new Date();
    }

    if (!searchCriteria.endDate) {
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 7);
      searchCriteria.endDate = defaultEndDate;
    }

    return this.flightRepository.search(searchCriteria);
  }

  async updateStatus(id: string, status: FlightStatusEnum): Promise<FlightEntity | null> {
    const flight = await this.flightRepository.updateStatus(id, status);
    if (flight) {
      this.eventEmitter.emit('app.events', {
        type: 'FLIGHT_STATUS_UPDATED',
        payload: {
          flightId: flight.id,
          status: flight.status
        }
      });
    }
    return flight;
  }
}
