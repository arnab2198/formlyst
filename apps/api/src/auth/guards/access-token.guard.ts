import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionStoreService } from '../services/session-store.service.js';

export interface AuthenticatedRequest extends Request {
  auth: { userId: string; sessionId: string; accessToken: string };
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly sessionStore: SessionStoreService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed access token');
    }

    const accessToken = header.slice('Bearer '.length).trim();
    const session = await this.sessionStore.verifyAccessToken(accessToken);
    if (!session) {
      throw new UnauthorizedException('Access token is invalid or expired');
    }

    request.auth = { ...session, accessToken };
    return true;
  }
}
