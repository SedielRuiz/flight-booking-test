import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter.js';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor.js';
import { BasicAuthGuard } from '@common/guards/basic-auth.guard.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalGuards(new BasicAuthGuard(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
