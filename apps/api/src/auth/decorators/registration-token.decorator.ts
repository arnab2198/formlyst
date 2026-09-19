import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RegistrationRequest } from '../guards/registration-token.guard.js';

export const RegistrationToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RegistrationRequest>();
    return request.registrationToken;
  },
);
