import { AppService } from './app.service.js';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    health(): Promise<{
        api: string;
        postgres: string;
        redis: string;
        timestamp: string;
    }>;
}
