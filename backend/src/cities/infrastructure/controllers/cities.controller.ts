import { Controller, Get, Query } from '@nestjs/common';
import { CitiesService } from '@cities/application/cities.service.js';
import { ROUTES } from '@common/constants/routes.constant.js';
import { GetCitiesQueryDto } from '@cities/infrastructure/dtos/get-cities.dto.js';

@Controller(ROUTES.CITIES.BASE)
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  async findAll(@Query() query: GetCitiesQueryDto) {
    return this.citiesService.findAll(query.name);
  }
}
