import { Controller, Get, Sse, MessageEvent } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';
import { AppService } from './app.service.js';
import { Public } from '@common/decorators/public.decorator.js';
import { ROUTES } from '@common/constants/routes.constant.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Public()
  @Get(ROUTES.HEALTH)
  async health() {
    return await this.appService.getHealthCheck();
  }

  @Public()
  @Sse(ROUTES.EVENTS)
  sse(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'app.events').pipe(
      map((payload: any) => ({
        data: payload as object,
      }) as MessageEvent),
    );
  }
}
