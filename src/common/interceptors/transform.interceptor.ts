import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import { IResponse, PaginationData, StandardResponse } from '../interfaces';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<IResponse<T>, StandardResponse<T>>
{
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((responseData: IResponse<T>) => {
        const message = responseData?.message || 'Success';
        const data = responseData?.data ?? null;

        return {
          statusCode,
          message,
          timestamp: new Date(),
          data: data as T,
        };
      }),
    );
  }
}

@Injectable()
export class PaginationInterceptor<T>
  implements
    NestInterceptor<
      IResponse<PaginationData<T>>,
      StandardResponse<PaginationData<T>>
    >
{
  private readonly logger = new Logger(PaginationInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<PaginationData<T>>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((responseData: IResponse<PaginationData<T>>) => {
        const message = responseData?.message || 'Success';
        const data = responseData?.data;

        if (!data?.entities) {
          return {
            statusCode,
            message,
            timestamp: new Date(),
            data: {
              entities: [],
              meta: {
                page: 1,
                limit: 0,
                totalItems: 0,
                totalPages: 0,
              },
            },
          };
        }
        return {
          message,
          statusCode,
          timestamp: new Date(),
          data,
        };
      }),
    );
  }
}
