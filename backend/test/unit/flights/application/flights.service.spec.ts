import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlightsService } from '@/flights/application/flights.service.js';
import { FlightRepository } from '@flights/domain/repositories/flight.repository.js';
import { FlightStatusEnum } from '@flights/domain/enums/flight-status.enum.js';

describe('FlightsService', () => {
  let service: FlightsService;
  let repositoryMock: any;

  beforeEach(() => {
    repositoryMock = {
      findAll: vi.fn(),
      findById: vi.fn(),
      search: vi.fn(),
    };
    
    // By using dependency injection, we instantiate the service with the repository mock
    service = new FlightsService(repositoryMock as unknown as FlightRepository);
  });

  describe('findAll', () => {
    it('should call repository findAll with default page and limit', async () => {
      const expectedResult = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      repositoryMock.findAll.mockResolvedValue(expectedResult);

      const result = await service.findAll(1, 10);
      
      expect(repositoryMock.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('search', () => {
    it('should call repository search with all mapped parameters', async () => {
      const date = new Date('2026-10-10');
      const expectedResult = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      repositoryMock.search.mockResolvedValue(expectedResult);

      const result = await service.search('bog', 'mde', date, 2, 20);
      
      expect(repositoryMock.search).toHaveBeenCalledWith('bog', 'mde', date, 2, 20);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should return a flight when the ID exists', async () => {
      const flight = { 
        id: 'flight-123', 
        flightNumber: 'AV-123', 
        status: FlightStatusEnum.SCHEDULED 
      };
      repositoryMock.findById.mockResolvedValue(flight);

      const result = await service.findById('flight-123');
      
      expect(repositoryMock.findById).toHaveBeenCalledWith('flight-123');
      expect(result).toEqual(flight);
    });

    it('should return null when the ID does not exist', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      const result = await service.findById('invalid-id');
      
      expect(repositoryMock.findById).toHaveBeenCalledWith('invalid-id');
      expect(result).toBeNull();
    });
  });
});
