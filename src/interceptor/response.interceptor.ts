import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface ApiResponse<T> {
  response_data: {
    data: T;
    dto_type: string;
  };
  status_code: number;
  messages: {
    success_message: any;
  };
  response_meta: {
    inflight_time: number;
  };
}
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  private readonly logger = new Logger(ResponseInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = req;
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip;
    const requestBody = req.body;
    const startTime = performance.now();
    return next.handle().pipe(
      map((data) => {
        const meta = data.meta;
        delete data['meta'];
        return { data: data['data'], meta };
      }),
      map(({ data, meta }) => ({
        response_data: {
          data,
          dto_type: meta.type,
        },
        status_code: response.statusCode,
        messages: { success_message: meta.message },
        response_meta: { inflight_time: performance.now() - startTime },
      })),
    );
  }
}
