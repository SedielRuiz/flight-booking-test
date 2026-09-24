import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export const getStatusCode = (exception: unknown): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

export const getErrorMessage = (exception: unknown): string => {
  return String(exception);
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = getStatusCode(exception);
    const message = getErrorMessage(exception);
    
    // Si el error es menor a 500 (ej. 400 Bad Request, 404 Not Found),
    // mostramos la respuesta que da NestJS, si no, mostramos un mensaje genérico.
    const responseException =
      statusCode < HttpStatus.INTERNAL_SERVER_ERROR
        ? exception.getResponse()
        : message;

    const body: any = {
      statusCode,
      message:
        typeof responseException === 'object' && responseException !== null
          ? (responseException as any).message || responseException
          : responseException,
      ...(typeof responseException === 'object' &&
        responseException !== null &&
        responseException),
    };

    response.status(statusCode).json(body);
  }
}
