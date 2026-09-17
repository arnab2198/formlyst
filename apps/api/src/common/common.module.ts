import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ZodValidationInterceptor } from './interceptors/validation.interceptor.js';
import { ResponseInterceptor } from './interceptors/response.interceptor.js';
import { AllExceptionsFilter } from './filters/all-exceptions.filter.js';

@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ZodValidationInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class CommonModule {}
