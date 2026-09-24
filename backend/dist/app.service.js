var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { PrismaService } from './prisma/prisma.service.js';
let AppService = class AppService {
    prisma;
    redis;
    constructor(prisma) {
        this.prisma = prisma;
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            commandTimeout: 2000,
            enableOfflineQueue: false,
        });
        this.redis.on('error', (error) => {
            console.error('[Redis Background Error]:', error.message || 'Redis connection error');
        });
    }
    async getHealthCheck() {
        let dbStatus = 'Disconnected';
        let redisStatus = 'Disconnected';
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            dbStatus = 'Connected';
        }
        catch (error) {
            console.error('[HealthCheck] Postgres ping failed:', error);
            dbStatus = 'Unavailable';
        }
        try {
            await this.redis.ping();
            redisStatus = 'Connected';
        }
        catch (error) {
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
};
AppService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AppService);
export { AppService };
//# sourceMappingURL=app.service.js.map