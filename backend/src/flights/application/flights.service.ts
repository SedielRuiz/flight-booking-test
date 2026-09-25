import type {
  FlightEntity,
  FlightWithSeats,
  PaginatedResult,
} from '@flights/domain/entities/flight.entity.js';
import { FlightStatusEnum } from '@flights/domain/enums/flight-status.enum.js';
import type { FlightSearchCriteria } from '@flights/domain/interfaces/flight-search-criteria.interface.js';
import type { FlightRepository } from '@flights/domain/repositories/flight.repository.js';
import { FLIGHT_REPOSITORY } from '@flights/domain/repositories/flight.repository.js';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { RedisService } from '@common/redis/redis.service.js';

@Injectable()
export class FlightsService {
  constructor(
    @Inject(FLIGHT_REPOSITORY)
    private readonly flightRepository: FlightRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<FlightEntity>> {
    return this.flightRepository.findAll(page, limit);
  }

  async findById(id: string): Promise<FlightWithSeats | null> {
    const flight = await this.flightRepository.findById(id);
    if (!flight) return null;

    const keys = await this.redisService
      .getClient()
      .keys(`flight:${id}:seat:*:lock`);
    const lockedSeatIds = keys.map((key) => key.split(':')[3]);

    flight.seats = flight.seats.map((seat) => {
      if (lockedSeatIds.includes(seat.id)) {
        return { ...seat, isAvailable: false };
      }
      return seat;
    });

    return flight;
  }

  async search(
    criteria: FlightSearchCriteria,
  ): Promise<PaginatedResult<FlightEntity>> {
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

  async updateStatus(
    id: string,
    status: FlightStatusEnum,
  ): Promise<FlightEntity | null> {
    const flight = await this.flightRepository.updateStatus(id, status);
    if (flight) {
      this.eventEmitter.emit('app.events', {
        type: 'FLIGHT_STATUS_UPDATED',
        payload: {
          flightId: flight.id,
          status: flight.status,
        },
      });
    }
    return flight;
  }

  async lockSeat(
    flightId: string,
    seatId: string,
    userId: string,
  ): Promise<boolean> {
    const lockKey = `flight:${flightId}:seat:${seatId}:lock`;
    const isLocked = await this.redisService.acquireLock(lockKey, 600); // 10 minutes

    if (isLocked) {
      this.eventEmitter.emit('app.events', {
        type: 'SEAT_LOCKED',
        payload: {
          flightId,
          seatId,
          userId,
          expiresAt: new Date(Date.now() + 600000),
        },
      });
    }

    return isLocked;
  }

  async unlockSeat(flightId: string, seatId: string): Promise<void> {
    const lockKey = `flight:${flightId}:seat:${seatId}:lock`;
    await this.redisService.releaseLock(lockKey);

    this.eventEmitter.emit('app.events', {
      type: 'SEAT_UNLOCKED',
      payload: {
        flightId,
        seatId,
      },
    });
  }
}
