import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module.js';
import { FlightsService } from '@flights/application/flights.service.js';
import { FLIGHT_REPOSITORY } from '@flights/domain/repositories/flight.repository.js';
import { PrismaFlightRepository } from '@flights/infrastructure/repositories/prisma-flight.repository.js';
import { FlightsController } from '@flights/infrastructure/controllers/flights.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [FlightsController],
  providers: [
    FlightsService,
    {
      provide: FLIGHT_REPOSITORY,
      useClass: PrismaFlightRepository,
    },
  ],
  exports: [FlightsService],
})
export class FlightsModule {}
