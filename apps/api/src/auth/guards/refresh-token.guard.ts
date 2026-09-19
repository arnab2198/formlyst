import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

export interface RefreshRequest extends Request {
  refreshToken: string;
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RefreshRequest>();
    const token = request.headers['x-refresh-token'];

    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    request.refreshToken = token;
    return true;
  }
}
