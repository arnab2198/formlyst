import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthIdentityRepository } from '../repositories/auth-identity.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { toPublicUser } from '../utils/to-public-user.js';
import { SessionStoreService } from './session-store.service.js';

@Injectable()
export class SessionService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly authIdentityRepo: AuthIdentityRepository,
    private readonly sessionStore: SessionStoreService,
  ) {}

  async me(userId: string) {
    const [user, identities] = await Promise.all([
      this.userRepo.findById(userId),
      this.authIdentityRepo.findAllByUser(userId),
    ]);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...toPublicUser(user),
      hasPassword: user.passwordHash !== null,
      linkedProviders: identities.map((identity) => identity.provider),
    };
  }

  async listSessions(userId: string, currentSessionId: string) {
    const sessions = await this.sessionStore.listSessions(userId);
    return {
      sessions: sessions.map((session) => ({
        ...session,
        isCurrent: session.sessionId === currentSessionId,
      })),
    };
  }
}
