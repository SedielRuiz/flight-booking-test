import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      commandTimeout: 2000,
      enableOfflineQueue: false,
    });

    this.redisClient.on('error', (error) => {
      console.error('[Redis Background Error]:', error.message || 'Redis connection error');
    });
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redisClient.set(key, 'locked', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
