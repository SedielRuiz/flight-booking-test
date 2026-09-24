import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module.js';
import { CitiesService } from '@cities/application/cities.service.js';
import { CitiesController } from '@cities/infrastructure/controllers/cities.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [CitiesService],
})
export class CitiesModule {}
