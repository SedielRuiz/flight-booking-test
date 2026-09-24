import { PrismaService } from './prisma/prisma.service.js';
export declare class AppService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService);
    getHealthCheck(): Promise<{
        api: string;
        postgres: string;
        redis: string;
        timestamp: string;
    }>;
}
