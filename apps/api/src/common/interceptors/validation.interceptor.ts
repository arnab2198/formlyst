import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import {
  RequestSource,
  toRequestKey,
  ValidationRule,
  VALIDATION_METADATA_KEY,
} from '../decorators/validate.decorator.js';
import { ZodValidationException } from '../exceptions/zod-validation.exception.js';

/**
 * Runs the `@Validate()` rules for the current route (if any) before the
 * handler executes. Interceptor "before" logic — everything here runs prior
 * to `next.handle()` — executes ahead of Nest's `@Body()`/`@Query()`/etc.
 * argument resolution, so mutating `request[source]` here is visible to them.
 */
@Injectable()
export class ZodValidationInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const rules = this.reflector.get<ValidationRule[]>(
      VALIDATION_METADATA_KEY,
      context.getHandler(),
    );

    if (!rules?.length) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();

    for (const rule of rules) {
      const key = toRequestKey(rule.source);
      const result = rule.schema.safeParse(request[key]);

      if (!result.success) {
        throw new ZodValidationException(key, result.error);
      }

      setRequestValue(request, key, result.data);
    }

    return next.handle();
  }
}

function setRequestValue(
  request: Request,
  key: RequestSource,
  value: unknown,
): void {
  if (key === 'query') {
    // Express 5 exposes `req.query` as a getter-only accessor recomputed from
    // the raw URL on every access, so `request.query = value` throws under
    // ESM's strict mode ("... which has only a getter"). Redefining the
    // property replaces the accessor with a plain, writable value.
    Object.defineProperty(request, 'query', {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    return;
  }

  request[key] = value as never;
}
