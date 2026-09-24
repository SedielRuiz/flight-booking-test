import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service.js';
import type { CityEntity } from '@cities/domain/entities/city.entity.js';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(name?: string): Promise<CityEntity[]> {
    const where = name
      ? { name: { contains: name, mode: 'insensitive' as const } }
      : {};

    return this.prisma.city.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }
}
