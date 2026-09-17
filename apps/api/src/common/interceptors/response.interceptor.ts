import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isResponsePayload } from '../responses/generate-response.js';
import type { ApiSuccessResponse } from '../responses/api-response.type.js';

/**
 * Shapes every successful controller/service return value into
 * `{ statusCode, message, data, success }`. `data` is omitted entirely when
 * there is none, rather than sent as `null`.
 *
 * Nest resolves the route's real HTTP status (from `@HttpCode()` or the
 * method-based default) and applies it to `response` *before* interceptors
 * run, and never re-applies it afterwards for a normal JSON response — so
 * `response.statusCode` read here already reflects that default, and calling
 * `response.status(...)` here (e.g. for a `generateResponse()` payload) is
 * what actually ends up on the wire, not just in the JSON body.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    if (context.getType() !== 'http') {
      return next.handle() as unknown as Observable<ApiSuccessResponse<T>>;
    }

    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((result): ApiSuccessResponse<T> => {
        if (isResponsePayload(result)) {
          response.status(result.statusCode);
          return buildBody(result.statusCode, result.message, result.data as T);
        }

        return buildBody(response.statusCode, null, result);
      }),
    );
  }
}

function buildBody<T>(
  statusCode: number,
  message: string | null,
  data: T,
): ApiSuccessResponse<T> {
  const body: ApiSuccessResponse<T> = {
    statusCode,
    message,
    success: statusCode < 400,
  };

  if (data !== undefined) {
    body.data = data;
  }

  return body;
}
