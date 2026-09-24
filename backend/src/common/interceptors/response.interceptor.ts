import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  data: T;
  meta?: any;
  message: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        if (res === undefined || res === null) {
          return { data: null as any, message: 'Success' };
        }

        if (res.data !== undefined && res.meta !== undefined) {
          return {
            data: res.data,
            meta: res.meta,
            message: res.message || 'Success',
          };
        }

        return {
          data: res,
          message: 'Success',
        };
      }),
    );
  }
}
