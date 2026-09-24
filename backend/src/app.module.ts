import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from '@prisma/prisma.module.js';
import { FlightsModule } from '@flights/flights.module.js';
import { CitiesModule } from '@cities/cities.module.js';

@Module({
  imports: [PrismaModule, FlightsModule, CitiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
