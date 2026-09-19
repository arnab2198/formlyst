import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './controllers/auth.controller.js';
import { SessionController } from './controllers/session.controller.js';
import { AuthIdentityEntity } from './entities/auth-identity.entity.js';
import { TokenEntity } from './entities/token.entity.js';
import { UserEntity } from './entities/user.entity.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { RegistrationTokenGuard } from './guards/registration-token.guard.js';
import { AuthIdentityRepository } from './repositories/auth-identity.repository.js';
import { TokenRepository } from './repositories/token.repository.js';
import { UserRepository } from './repositories/user.repository.js';
import { AuthService } from './services/auth.service.js';
import { SessionService } from './services/session.service.js';
import { SessionStoreService } from './services/session-store.service.js';
import { GoogleStrategy } from './strategies/google.strategy.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AuthIdentityEntity, TokenEntity]),
    PassportModule.register({ session: false }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 100 }],
    }),
  ],
  controllers: [AuthController, SessionController],
  providers: [
    UserRepository,
    AuthIdentityRepository,
    TokenRepository,
    SessionStoreService,
    AuthService,
    SessionService,
    GoogleStrategy,
    AccessTokenGuard,
    RegistrationTokenGuard,
    RefreshTokenGuard,
    GoogleAuthGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [UserRepository, AuthIdentityRepository, TokenRepository],
})
export class AuthModule {}
