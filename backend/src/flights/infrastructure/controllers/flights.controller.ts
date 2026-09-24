import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { FlightsService } from '@flights/application/flights.service.js';
import { ROUTES } from '@common/constants/routes.constant.js';
import { SearchFlightsQueryDto } from '@flights/infrastructure/dtos/search-flights.dto.js';

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

  @Get(ROUTES.FLIGHTS.BY_ID)
  async findById(@Param('id') id: string) {
    const flight = await this.flightsService.findById(id);

    if (!flight) {
      throw new NotFoundException(`Flight with id "${id}" not found`);
    }

    return flight;
  }
}
