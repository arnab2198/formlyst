import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.query.error) {
      return true;
    }
    return super.canActivate(context) as Promise<boolean>;
  }

  // Never throw here — the controller reads request.query.error / request.user
  // itself and redirects the browser back into the app instead of surfacing
  // a raw JSON error on the API's own origin.
  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    return (err ? null : (user ?? null)) as TUser;
  }
}
