import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CitiesService } from '@/cities/application/cities.service.js';
import { PrismaService } from '@prisma/prisma.service.js';

describe('CitiesService', () => {
  let service: CitiesService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      city: {
        findMany: vi.fn(),
      },
    };
    service = new CitiesService(prismaMock as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('should return all cities sorted by name when no name is provided', async () => {
      const cities = [{ id: '1', name: 'Bogotá' }];
      prismaMock.city.findMany.mockResolvedValue(cities);

      const result = await service.findAll();

      expect(prismaMock.city.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(cities);
    });

    it('should return filtered cities when a name is provided', async () => {
      const cities = [{ id: '2', name: 'Medellín' }];
      prismaMock.city.findMany.mockResolvedValue(cities);

      const result = await service.findAll('Med');

      expect(prismaMock.city.findMany).toHaveBeenCalledWith({
        where: { name: { contains: 'Med', mode: 'insensitive' } },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(cities);
    });
  });
});
