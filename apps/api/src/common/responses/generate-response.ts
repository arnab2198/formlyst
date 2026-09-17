import { HttpStatus } from '@nestjs/common';

const RESPONSE_PAYLOAD = Symbol('RESPONSE_PAYLOAD');

export interface ResponsePayload<T = undefined> {
  statusCode: HttpStatus;
  message: string | null;
  data?: T;
  readonly [RESPONSE_PAYLOAD]: true;
}

export interface GenerateResponseOptions<T> {
  statusCode?: HttpStatus;
  message?: string | null;
  data?: T;
}

/**
 * Builds a response payload that a service (or controller) can return
 * directly. `ResponseInterceptor` recognizes it via a module-private symbol
 * brand — never enumerable/serializable, so it can't leak into the JSON
 * output or be spoofed by a plain object — and uses its
 * statusCode/message/data instead of wrapping the payload itself as `data`.
 */
export function generateResponse<T = undefined>(
  options: GenerateResponseOptions<T> = {},
): ResponsePayload<T> {
  return {
    statusCode: options.statusCode ?? HttpStatus.OK,
    message: options.message ?? null,
    data: options.data,
    [RESPONSE_PAYLOAD]: true,
  };
}

export function isResponsePayload(value: unknown): value is ResponsePayload {
  return (
    typeof value === 'object' && value !== null && RESPONSE_PAYLOAD in value
  );
}
