import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from '@common/decorators/public.decorator.js';
import { ROUTES } from '@common/constants/routes.constant.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get(ROUTES.HEALTH)
  async health() {
    return await this.appService.getHealthCheck();
  }
}
