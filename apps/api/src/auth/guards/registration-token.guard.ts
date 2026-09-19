import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionStoreService } from '../services/session-store.service.js';

export interface RegistrationRequest extends Request {
  registrationToken: string;
}

@Injectable()
export class RegistrationTokenGuard implements CanActivate {
  constructor(private readonly sessionStore: SessionStoreService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RegistrationRequest>();
    const token = request.headers['x-registration-token'];

    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException('Missing registration token');
    }

    const userId = await this.sessionStore.peekRegistrationToken(token);
    if (!userId) {
      throw new UnauthorizedException('Registration token is invalid or expired');
    }

    request.registrationToken = token;
    return true;
  }
}
