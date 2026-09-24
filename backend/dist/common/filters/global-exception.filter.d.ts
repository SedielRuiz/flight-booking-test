import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare const getStatusCode: (exception: unknown) => number;
export declare const getErrorMessage: (exception: unknown) => string;
export declare class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void;
}
