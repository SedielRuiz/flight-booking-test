import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { CryptoModule } from '@common/crypto/crypto.module.js';
import { PrismaModule } from '@prisma/prisma.module.js';
import { RedisModule } from '@common/redis/redis.module.js';

@Module({
  imports: [CryptoModule, PrismaModule, RedisModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
