import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { SessionStoreService } from '../services/session-store.service.js';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly sessionStore: SessionStoreService) {
    super();
  }

  async getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const intent: 'auth' | 'link' =
      request.query.intent === 'link' ? 'link' : 'auth';

    let linkUserId: string | undefined;
    if (intent === 'link') {
      const linkCode = request.query.linkCode as string | undefined;
      linkUserId = linkCode
        ? ((await this.sessionStore.consumeLinkIntent(linkCode)) ?? undefined)
        : undefined;
      if (!linkUserId) {
        throw new UnauthorizedException(
          'Link session expired, please try again',
        );
      }
    }

    const state = await this.sessionStore.issueOAuthState({
      intent,
      linkUserId,
    });

    return { session: false, state, scope: ['profile', 'email'] };
  }
}
