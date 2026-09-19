import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RefreshRequest } from '../guards/refresh-token.guard.js';

export const RefreshToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RefreshRequest>();
    return request.refreshToken;
  },
);
