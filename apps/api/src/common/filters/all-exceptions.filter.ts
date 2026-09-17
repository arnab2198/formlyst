import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorResponse } from '../responses/api-response.type.js';

/**
 * Catches every exception (Nest's built-ins like `BadRequestException`,
 * `ZodValidationException`, a raw `ZodError`, or anything unexpected) and
 * shapes it into `{ statusCode, message, errors, success }` — `errors` is
 * only included when there's structured detail to show.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = this.resolveStatusCode(exception);
    const { message, errors } = this.resolveBody(exception);

    this.log(request, statusCode, message, exception);

    const body: ApiErrorResponse = {
      statusCode,
      message,
      success: false,
    };
    if (errors !== undefined) {
      body.errors = errors;
    }

    response.status(statusCode).json(body);
  }

  private resolveStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    if (exception instanceof ZodError) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveBody(exception: unknown): {
    message: string;
    errors?: unknown;
  } {
    if (exception instanceof ZodError) {
      return {
        message: 'Validation failed',
        errors: exception.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      };
    }

    if (!(exception instanceof HttpException)) {
      return { message: 'Internal server error' };
    }

    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { message: payload };
    }

    if (isRecord(payload)) {
      if (Array.isArray(payload.message)) {
        return { message: 'Validation failed', errors: payload.message };
      }

      return {
        message:
          typeof payload.message === 'string'
            ? payload.message
            : exception.message,
        errors: 'errors' in payload ? payload.errors : undefined,
      };
    }

    return { message: exception.message };
  }

  private log(
    request: Request,
    statusCode: number,
    message: string,
    exception: unknown,
  ): void {
    const context = `${request.method} ${request.url}`;

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${context} - ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${context} - ${statusCode} - ${message}`);
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
