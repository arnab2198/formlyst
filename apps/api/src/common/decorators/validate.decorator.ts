import { SetMetadata } from '@nestjs/common';
import type { ZodType } from 'zod';

export type ValidationSource =
  'body' | 'headers' | 'header' | 'query' | 'params' | 'param';

export type RequestSource = 'body' | 'headers' | 'params' | 'query';

export interface ValidationRule<Schema extends ZodType = ZodType> {
  source: ValidationSource;
  schema: Schema;
}

export const VALIDATION_METADATA_KEY = Symbol('VALIDATION_METADATA_KEY');

const REQUEST_KEY_BY_SOURCE: Record<ValidationSource, RequestSource> = {
  body: 'body',
  headers: 'headers',
  header: 'headers',
  query: 'query',
  params: 'params',
  param: 'params',
};

export function toRequestKey(source: ValidationSource): RequestSource {
  const key = REQUEST_KEY_BY_SOURCE[source];
  if (!key) {
    throw new Error(`@Validate(): unknown source "${String(source)}"`);
  }
  return key;
}

/**
 * Validates one or more parts of the incoming request against Zod schemas.
 * `ZodValidationInterceptor` reads this metadata, and on success replaces
 * `request[source]` with the parsed value (so defaults/coercions applied by
 * the schema are visible too) — controllers keep using the normal
 * `@Body()`/`@Query()`/`@Param()`/`@Headers()` decorators to read it.
 *
 * @example
 * ```ts
 * @Post()
 * @Validate({ source: 'body', schema: createUserSchema })
 * create(@Body() dto: CreateUserDto) {}
 *
 * @Get(':id')
 * @Validate([
 *   { source: 'params', schema: userIdParamSchema },
 *   { source: 'query', schema: paginationSchema },
 * ])
 * findOne(@Param() params: UserIdParam, @Query() query: Pagination) {}
 * ```
 */
export const Validate = (rules: ValidationRule | ValidationRule[]) =>
  SetMetadata(VALIDATION_METADATA_KEY, Array.isArray(rules) ? rules : [rules]);
