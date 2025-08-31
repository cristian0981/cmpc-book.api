import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  data: T | T[];
}

@Injectable()
export class TransformInterceptorRequest<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();
    const status = response.statusCode ?? 200;

    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: status,
          data: data // ✅ sea array u objeto, siempre lo ponemos en "data"
        };
      }),
    );
  }
}
