import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppService } from '@/app.service.js';
import { PrismaService } from '@prisma/prisma.service.js';

// Mock the external dependency ioredis
vi.mock('ioredis', () => {
  return {
    Redis: class {
      on = vi.fn();
      ping = vi.fn().mockResolvedValue('PONG');
    },
  };
});

describe('AppService', () => {
  let service: AppService;
  let prismaMock: any;

  beforeEach(() => {
    // Mock Prisma
    prismaMock = {
      $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    };
    service = new AppService(prismaMock as unknown as PrismaService);
  });

  describe('getHealthCheck', () => {
    it('should return connected status for db and redis', async () => {
      const result = await service.getHealthCheck();
      
      expect(result).toBeDefined();
      expect(result.api).toBe('Running');
      expect(result.postgres).toBe('Connected');
      expect(result.redis).toBe('Connected');
      expect(result.timestamp).toBeTypeOf('string');
    });

    it('should handle db ping failure gracefully', async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error('DB Error'));
      const result = await service.getHealthCheck();
      
      expect(result.postgres).toBe('Unavailable');
      expect(result.redis).toBe('Connected'); // Redis still connected
    });
  });
});
