var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Catch, HttpException, HttpStatus, } from '@nestjs/common';
export const getStatusCode = (exception) => {
    return exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
};
export const getErrorMessage = (exception) => {
    return String(exception);
};
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = getStatusCode(exception);
        const message = getErrorMessage(exception);
        const responseException = statusCode < HttpStatus.INTERNAL_SERVER_ERROR
            ? exception.getResponse()
            : message;
        const body = {
            statusCode,
            message: typeof responseException === 'object' && responseException !== null
                ? responseException.message || responseException
                : responseException,
            ...(typeof responseException === 'object' &&
                responseException !== null &&
                responseException),
        };
        response.status(statusCode).json(body);
    }
};
GlobalExceptionFilter = __decorate([
    Catch()
], GlobalExceptionFilter);
export { GlobalExceptionFilter };
//# sourceMappingURL=global-exception.filter.js.map