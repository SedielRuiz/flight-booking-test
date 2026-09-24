import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppController } from '@/app.controller.js';
import { AppService } from '@/app.service.js';

describe('AppController', () => {
  let controller: AppController;
  let appServiceMock: any;

  beforeEach(() => {
    appServiceMock = {
      getHealthCheck: vi.fn(),
    };
    controller = new AppController(appServiceMock as unknown as AppService);
  });

  describe('health', () => {
    it('should return health check from AppService', async () => {
      const mockResult = {
        api: 'Running',
        postgres: 'Connected',
        redis: 'Connected',
        timestamp: new Date().toISOString()
      };
      
      appServiceMock.getHealthCheck.mockResolvedValue(mockResult);

      const result = await controller.health();
      
      expect(result).toEqual(mockResult);
      expect(appServiceMock.getHealthCheck).toHaveBeenCalled();
    });
  });
});
