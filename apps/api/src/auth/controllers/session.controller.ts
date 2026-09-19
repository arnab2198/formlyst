import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import type { AuthenticatedRequest } from '../guards/access-token.guard.js';
import { AccessTokenGuard } from '../guards/access-token.guard.js';
import { SessionService } from '../services/session.service.js';

@Controller('auth')
@UseGuards(AccessTokenGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('me')
  me(@CurrentUser() auth: AuthenticatedRequest['auth']) {
    return this.sessionService.me(auth.userId);
  }

  @Get('sessions')
  listSessions(@CurrentUser() auth: AuthenticatedRequest['auth']) {
    return this.sessionService.listSessions(auth.userId, auth.sessionId);
  }
}
