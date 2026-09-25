import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from '@prisma/prisma.module.js';
import { FlightsModule } from '@flights/flights.module.js';
import { CitiesModule } from '@cities/cities.module.js';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from '@common/redis/redis.module.js';
import { CryptoModule } from '@common/crypto/crypto.module.js';
import { PaymentsModule } from './payments/payments.module.js';

@Module({
  imports: [PrismaModule, FlightsModule, CitiesModule, EventEmitterModule.forRoot(), RedisModule, CryptoModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
