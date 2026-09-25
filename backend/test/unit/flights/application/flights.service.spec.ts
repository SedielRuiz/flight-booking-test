import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlightsService } from '@/flights/application/flights.service.js';
import { FlightRepository } from '@flights/domain/repositories/flight.repository.js';
import { FlightStatusEnum } from '@flights/domain/enums/flight-status.enum.js';

describe('FlightsService', () => {
  let service: FlightsService;
  let repositoryMock: any;
  let eventEmitterMock: any;
  let redisServiceMock: any;
  let prismaServiceMock: any;

  beforeEach(() => {
    repositoryMock = {
      findAll: vi.fn(),
      findById: vi.fn(),
      search: vi.fn(),
    };
    
    eventEmitterMock = {
      emit: vi.fn(),
    };
    
    redisServiceMock = {
      getClient: vi.fn().mockReturnValue({
        keys: vi.fn().mockResolvedValue([]),
      }),
      acquireLock: vi.fn().mockResolvedValue(true),
      releaseLock: vi.fn().mockResolvedValue(true),
    };
    
    prismaServiceMock = {
      reservation: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    service = new FlightsService(
      repositoryMock as unknown as FlightRepository,
      eventEmitterMock,
      redisServiceMock,
      prismaServiceMock,
    );
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

      const criteria = {
        origin: 'bog',
        destination: 'mde',
        date,
        page: 2,
        limit: 20
      };

      const result = await service.search(criteria);
      
      expect(repositoryMock.search).toHaveBeenCalledWith(expect.objectContaining({
        origin: 'bog',
        destination: 'mde',
        date,
        page: 2,
        limit: 20,
      }));
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should return a flight when the ID exists', async () => {
      const flight = { 
        id: 'flight-123', 
        flightNumber: 'AV-123', 
        status: FlightStatusEnum.SCHEDULED,
        seats: [] 
      };
      repositoryMock.findById.mockResolvedValue(flight);

      const result = await service.findById('flight-123');
      
      expect(repositoryMock.findById).toHaveBeenCalledWith('flight-123');
      expect(result).toEqual(flight);
    });

    it('should throw NotFoundException when the ID does not exist', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow('Flight with id "invalid-id" not found');
      expect(repositoryMock.findById).toHaveBeenCalledWith('invalid-id');
    });
  });
  describe('updateStatus', () => {
    it('should throw NotFoundException if flight not found', async () => {
      repositoryMock.updateStatus = vi.fn().mockResolvedValue(null);
      await expect(service.updateStatus('invalid', FlightStatusEnum.DELAYED)).rejects.toThrow('Flight with id "invalid" not found');
    });

    it('should update flight status and emit event', async () => {
      const flight = { id: 'flight-1', status: FlightStatusEnum.DELAYED };
      repositoryMock.updateStatus = vi.fn().mockResolvedValue(flight);
      
      const result = await service.updateStatus('flight-1', FlightStatusEnum.DELAYED);
      
      expect(result).toEqual(flight);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('app.events', expect.objectContaining({
        type: 'FLIGHT_STATUS_UPDATED',
        payload: { flightId: 'flight-1', status: FlightStatusEnum.DELAYED }
      }));
    });
  });

  describe('lockSeat', () => {
    it('should throw NotFoundException if lock cannot be acquired', async () => {
      redisServiceMock.acquireLock.mockResolvedValue(false);
      await expect(service.lockSeat('flight-1', 'seat-1', 'user-1')).rejects.toThrow('Seat with id "seat-1" is already locked or unavailable');
    });

    it('should acquire lock and emit event', async () => {
      redisServiceMock.acquireLock.mockResolvedValue(true);
      
      await service.lockSeat('flight-1', 'seat-1', 'user-1');
      
      expect(redisServiceMock.acquireLock).toHaveBeenCalledWith('flight:flight-1:seat:seat-1:lock', 600);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('app.events', expect.objectContaining({
        type: 'SEAT_LOCKED',
      }));
    });
  });

  describe('unlockSeat', () => {
    it('should release lock and emit event', async () => {
      await service.unlockSeat('flight-1', 'seat-1');
      
      expect(redisServiceMock.releaseLock).toHaveBeenCalledWith('flight:flight-1:seat:seat-1:lock');
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('app.events', expect.objectContaining({
        type: 'SEAT_UNLOCKED',
      }));
    });
  });

  describe('getReservationByCode', () => {
    it('should throw NotFoundException if reservation not found', async () => {
      prismaServiceMock.reservation.findFirst.mockResolvedValue(null);
      await expect(service.getReservationByCode('INVALID')).rejects.toThrow('Reservation with code "INVALID" not found');
    });

    it('should return reservation mapping if found', async () => {
      const mockReservation = {
        paymentCode: 'BKG-123',
        flight: { flightNumber: 'AV-1' },
        tickets: [{ seat: { seatNumber: '1A' }, passengerName: 'John Doe' }],
        payment: { amount: 100 }
      };
      prismaServiceMock.reservation.findFirst.mockResolvedValue(mockReservation);

      const result = await service.getReservationByCode('BKG-123');
      
      expect(result).toEqual({
        bookingCode: 'BKG-123',
        seatNumber: '1A',
        flightNumber: 'AV-1',
        passengerName: 'John Doe',
        amount: 100
      });
    });
  });
});
