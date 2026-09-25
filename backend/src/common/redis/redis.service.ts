import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly redisClient: Redis;
  private readonly subscriberClient: Redis;

  constructor(private eventEmitter: EventEmitter2) {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      commandTimeout: 2000,
      enableOfflineQueue: false,
    });

    this.subscriberClient = this.redisClient.duplicate();

    this.redisClient.on('error', (error) => {
      console.error('[Redis Background Error]:', error.message || 'Redis connection error');
    });
    this.subscriberClient.on('error', (error) => {
      console.error('[Redis Subscriber Error]:', error.message || 'Redis connection error');
    });
  }

  async onModuleInit() {
    // Enable keyspace notifications for expiration events ('Ex')
    await this.redisClient.config('SET', 'notify-keyspace-events', 'Ex');

    // Subscribe to expiration events on DB 0
    await this.subscriberClient.subscribe('__keyevent@0__:expired');

    this.subscriberClient.on('message', (channel, message) => {
      // message is the expired key. Ex: flight:44bd74a7...:seat:baa45124...:lock
      if (channel === '__keyevent@0__:expired' && message.includes(':lock')) {
        const parts = message.split(':');
        if (parts.length === 5 && parts[0] === 'flight' && parts[2] === 'seat') {
          const flightId = parts[1];
          const seatId = parts[3];
          this.eventEmitter.emit('seat.unlocked', { flightId, seatId });
        }
      }
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
    this.subscriberClient.disconnect();
    this.redisClient.disconnect();
  }
}
