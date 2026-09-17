import { BadRequestException } from '@nestjs/common';
import type { ZodError } from 'zod';

export interface ValidationIssue {
  path: string;
  message: string;
}

export class ZodValidationException extends BadRequestException {
  constructor(source: string, error: ZodError) {
    const errors: ValidationIssue[] = error.issues.map((issue) => ({
      path: issue.path.join('.') || source,
      message: issue.message,
    }));

    super({ message: `Validation failed for request ${source}`, errors });
  }
}
