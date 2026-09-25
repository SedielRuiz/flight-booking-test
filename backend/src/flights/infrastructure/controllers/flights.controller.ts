import { ROUTES } from '@common/constants/routes.constant.js';
import { FlightsService } from '@flights/application/flights.service.js';
import { SearchFlightsQueryDto } from '@flights/infrastructure/dtos/search-flights.dto.js';
import { UpdateFlightStatusDto } from '@flights/infrastructure/dtos/update-flight-status.dto.js';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';

@Controller(ROUTES.FLIGHTS.BASE)
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  async findAll(@Query() query: SearchFlightsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return this.flightsService.search({
      originId: query.originId,
      destinationId: query.destinationId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      page,
      limit,
    });
  }

  @Get(ROUTES.FLIGHTS.METRICS)
  async getMetrics() {
    return this.flightsService.getMetrics();
  }

  @Get(ROUTES.FLIGHTS.RESERVATION)
  async getReservationByCode(@Param('code') code: string) {
    return this.flightsService.getReservationByCode(code);
  }

  @Get(ROUTES.FLIGHTS.BY_ID)
  async findById(@Param('id') id: string) {
    return this.flightsService.findById(id);
  }

  @Patch(ROUTES.FLIGHTS.UPDATE_STATUS)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateFlightStatusDto,
  ) {
    return this.flightsService.updateStatus(id, updateDto.status);
  }

  @Patch(ROUTES.FLIGHTS.SEATS.LOCK)
  async lockSeat(
    @Param('id') id: string,
    @Param('seatId') seatId: string,
    @Body('userId') userId: string,
  ) {
    await this.flightsService.lockSeat(id, seatId, userId);
    return {
      success: true,
      message: 'Seat locked successfully for 10 minutes',
    };
  }

  @Patch(ROUTES.FLIGHTS.SEATS.UNLOCK)
  async unlockSeat(@Param('id') id: string, @Param('seatId') seatId: string) {
    await this.flightsService.unlockSeat(id, seatId);
    return { success: true, message: 'Seat unlocked successfully' };
  }
}
