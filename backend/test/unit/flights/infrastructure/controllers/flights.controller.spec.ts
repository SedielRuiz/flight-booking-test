import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlightsController } from '@/flights/infrastructure/controllers/flights.controller.js';
import { FlightsService } from '@/flights/application/flights.service.js';
import { NotFoundException } from '@nestjs/common';
import { FlightStatusEnum } from '@/flights/domain/enums/flight-status.enum.js';

describe('FlightsController', () => {
  let controller: FlightsController;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      findAll: vi.fn(),
      search: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
      getMetrics: vi.fn(),
      getReservationByCode: vi.fn(),
      lockSeat: vi.fn(),
      unlockSeat: vi.fn(),
    };

    controller = new FlightsController(serviceMock as unknown as FlightsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMetrics', () => {
    it('should return metrics from service', async () => {
      const metricsData = [{ flightNumber: 'AV-123', metrics: { available: 10 } }];
      serviceMock.getMetrics.mockResolvedValue(metricsData);

      const result = await controller.getMetrics();
      expect(result).toEqual(metricsData);
      expect(serviceMock.getMetrics).toHaveBeenCalled();
    });
  });

  describe('getReservationByCode', () => {
    it('should return reservation from service', async () => {
      const reservation = { bookingCode: 'BKG-123' };
      serviceMock.getReservationByCode.mockResolvedValue(reservation);

      const result = await controller.getReservationByCode('BKG-123');
      expect(result).toEqual(reservation);
      expect(serviceMock.getReservationByCode).toHaveBeenCalledWith('BKG-123');
    });
  });

  describe('findById', () => {
    it('should return flight from service', async () => {
      const flight = { id: 'flight-123' };
      serviceMock.findById.mockResolvedValue(flight);

      const result = await controller.findById('flight-123');
      expect(result).toEqual(flight);
      expect(serviceMock.findById).toHaveBeenCalledWith('flight-123');
    });
  });

  describe('updateStatus', () => {
    it('should update flight status in service', async () => {
      const flight = { id: 'flight-123', status: FlightStatusEnum.DELAYED };
      serviceMock.updateStatus.mockResolvedValue(flight);

      const result = await controller.updateStatus('flight-123', { status: FlightStatusEnum.DELAYED });
      expect(result).toEqual(flight);
      expect(serviceMock.updateStatus).toHaveBeenCalledWith('flight-123', FlightStatusEnum.DELAYED);
    });
  });

  describe('lockSeat', () => {
    it('should lock seat in service and return success', async () => {
      serviceMock.lockSeat.mockResolvedValue(undefined); // lockSeat now returns void

      const result = await controller.lockSeat('flight-123', 'seat-123', 'user-1');
      expect(result).toEqual({ success: true, message: 'Seat locked successfully for 10 minutes' });
      expect(serviceMock.lockSeat).toHaveBeenCalledWith('flight-123', 'seat-123', 'user-1');
    });
  });

  describe('unlockSeat', () => {
    it('should unlock seat in service and return success', async () => {
      serviceMock.unlockSeat.mockResolvedValue(undefined);

      const result = await controller.unlockSeat('flight-123', 'seat-123');
      expect(result).toEqual({ success: true, message: 'Seat unlocked successfully' });
      expect(serviceMock.unlockSeat).toHaveBeenCalledWith('flight-123', 'seat-123');
    });
  });
});
