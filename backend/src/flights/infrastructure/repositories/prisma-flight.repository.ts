import { FlightStatusEnum } from '@domain/index.js';
import {
  FlightEntity,
  FlightWithSeats,
  PaginatedResult,
} from '@flights/domain/entities/flight.entity.js';
import { FlightSearchCriteria } from '@flights/domain/interfaces/flight-search-criteria.interface.js';
import { FlightRepository } from '@flights/domain/repositories/flight.repository.js';
import { FlightMapper } from '@flights/infrastructure/mappers/flight.mapper.js';
import { Injectable } from '@nestjs/common';
import { FlightStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service.js';

@Injectable()
export class PrismaFlightRepository implements FlightRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<FlightEntity>> {
    const skip = (page - 1) * limit;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.flight.count(),
      this.prisma.flight.findMany({
        skip,
        take: limit,
        orderBy: { departureTime: 'asc' },
        include: {
          origin: true,
          destination: true,
        },
      }),
    ]);

    return {
      data: data.map((flight) => FlightMapper.toDomain(flight)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<FlightWithSeats | null> {
    const flight = await this.prisma.flight.findUnique({
      where: { id },
      include: {
        origin: true,
        destination: true,
        seats: {
          orderBy: { seatNumber: 'asc' },
        },
      },
    });

    if (!flight) return null;
    return FlightMapper.toDomainWithSeats(flight);
  }

  async search(
    criteria: FlightSearchCriteria,
  ): Promise<PaginatedResult<FlightEntity>> {
    const { originId, destinationId, startDate, endDate, page, limit } =
      criteria;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (originId) where.originId = originId;
    if (destinationId) where.destinationId = destinationId;

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      where.departureTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.flight.count({ where }),
      this.prisma.flight.findMany({
        where,
        skip,
        take: limit,
        orderBy: { departureTime: 'asc' },
        include: {
          origin: true,
          destination: true,
        },
      }),
    ]);

    return {
      data: data.map((flight) => FlightMapper.toDomain(flight)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private mapStatusToPrisma(status: FlightStatusEnum): FlightStatus {
    switch (status) {
      case FlightStatusEnum.SCHEDULED:
        return FlightStatus.SCHEDULED;
      case FlightStatusEnum.CANCELLED:
        return FlightStatus.CANCELLED;
      case FlightStatusEnum.DELAYED:
        return FlightStatus.DELAYED;
      case FlightStatusEnum.SOLD_OUT:
        return FlightStatus.SOLD_OUT;
      default:
        return FlightStatus.SCHEDULED;
    }
  }

  async updateStatus(
    id: string,
    status: FlightStatusEnum,
  ): Promise<FlightEntity | null> {
    try {
      const flight = await this.prisma.flight.update({
        where: { id },
        data: { status: this.mapStatusToPrisma(status) },
        include: { origin: true, destination: true },
      });
      return FlightMapper.toDomain(flight);
    } catch (error) {
      return null;
    }
  }
}
