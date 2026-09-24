import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { PrismaService } from '@prisma/prisma.service.js';

@Injectable()
export class AppService {
  private redis: Redis;

  constructor(private prisma: PrismaService) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      commandTimeout: 2000,
      enableOfflineQueue: false,
    });

    this.redis.on('error', (error) => {
      console.error(
        '[Redis Background Error]:',
        error.message || 'Redis connection error',
      );
    });
  }

  async getHealthCheck() {
    let dbStatus = 'Disconnected';
    let redisStatus = 'Disconnected';

    // Ping Postgres
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'Connected';
    } catch (error) {
      console.error('[HealthCheck] Postgres ping failed:', error);
      dbStatus = 'Unavailable';
    }

    // Ping Redis
    try {
      await this.redis.ping();
      redisStatus = 'Connected';
    } catch (error) {
      console.error('[HealthCheck] Redis ping failed:', error);
      redisStatus = 'Unavailable';
    }

    return {
      api: 'Running',
      postgres: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
