import * as argon2 from 'argon2';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import type { Profile } from 'passport-google-oauth20';
import { ConfigService } from '../../config/config.service.js';
import { EMAIL_SERVICE } from '../../common/email/email.interface.js';
import type { EmailService } from '../../common/email/email.interface.js';
import { RateLimitService } from '../../common/rate-limit/rate-limit.service.js';
import {
  generateOpaqueToken,
  generateOtp,
  hashToken,
  maskEmail,
} from '../../common/token/token.util.js';
import { AuthIdentityRepository } from '../repositories/auth-identity.repository.js';
import { TokenRepository } from '../repositories/token.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AuthProvider } from '../enums/auth-provider.enum.js';
import { RegistrationStatus } from '../enums/registration-status.enum.js';
import { TokenType } from '../enums/token-type.enum.js';
import type { UserEntity } from '../entities/user.entity.js';
import { toPublicUser } from '../utils/to-public-user.js';
import type { SessionMeta, OAuthStateData } from './session-store.service.js';
import { SessionStoreService } from './session-store.service.js';

const PASSWORD_RESET_TTL_SECONDS = 1800;

type GoogleOutcome =
  | { type: 'auth'; handoffCode: string }
  | { type: 'link'; ok: true }
  | { type: 'link'; ok: false; errorCode: string };

@Injectable()
export class AuthService {
  private dummyPasswordHash: Promise<string> | null = null;

  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenRepo: TokenRepository,
    private readonly authIdentityRepo: AuthIdentityRepository,
    private readonly sessionStore: SessionStoreService,
    private readonly rateLimit: RateLimitService,
    private readonly configService: ConfigService,
    @Inject(EMAIL_SERVICE) private readonly emailService: EmailService,
  ) {}

  // ---------------------------------------------------------------------
  // Signup
  // ---------------------------------------------------------------------

  @Transactional()
  async signupStart(email: string, ip: string) {
    const normalized = normalizeEmail(email);

    const withinLimits = await this.consumeOtpRateLimits(normalized, ip);
    if (!withinLimits) {
      throw new HttpException(
        'Too many requests, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    let user = await this.userRepo.findByEmail(normalized);

    if (user?.registrationStatus === RegistrationStatus.COMPLETE) {
      return { nextStep: 'ALREADY_REGISTERED' as const };
    }

    if (!user) {
      user = await this.userRepo.save({
        email: normalized,
        registrationStatus: RegistrationStatus.PENDING_VERIFICATION,
      });
    }

    await this.issueOtp(user.id, normalized);
    return {
      nextStep: 'VERIFY_EMAIL' as const,
      maskedEmail: maskEmail(normalized),
    };
  }

  @Transactional()
  async signupResendOtp(email: string, ip: string): Promise<{ ok: true }> {
    const normalized = normalizeEmail(email);

    const cooldownOk = await this.rateLimit.consume(
      `ratelimit:otp-resend-cooldown:${normalized}`,
      1,
      60,
    );
    const withinLimits =
      cooldownOk && (await this.consumeOtpRateLimits(normalized, ip));

    if (!withinLimits) {
      return { ok: true };
    }

    const user = await this.userRepo.findByEmail(normalized);
    if (!user || user.registrationStatus === RegistrationStatus.COMPLETE) {
      return { ok: true };
    }

    await this.issueOtp(user.id, normalized);
    return { ok: true };
  }

  @Transactional()
  async signupVerifyOtp(email: string, code: string) {
    const normalized = normalizeEmail(email);
    const user = await this.userRepo.findByEmail(normalized);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    const activeToken = await this.tokenRepo.findActive(
      user.id,
      TokenType.EMAIL_VERIFICATION,
    );
    if (!activeToken) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    const attempts = activeToken.metadata?.attempts ?? 0;
    const maxAttempts = this.configService.auth.otp.maxAttempts;
    if (attempts >= maxAttempts) {
      await this.tokenRepo.revoke(activeToken.id);
      throw new UnauthorizedException(
        'Too many attempts, please request a new code',
      );
    }

    if (hashToken(code) !== activeToken.tokenHash) {
      await this.tokenRepo.incrementAttempts(activeToken.id, attempts + 1);
      throw new UnauthorizedException('Invalid code');
    }

    await this.tokenRepo.markUsed(activeToken.id);
    user.registrationStatus = RegistrationStatus.VERIFIED_PENDING_PROFILE;
    user.emailVerified = true;
    await this.userRepo.save(user);

    const registrationToken = await this.sessionStore.issueRegistrationToken(
      user.id,
    );
    return {
      registrationToken,
      registrationStatus: RegistrationStatus.VERIFIED_PENDING_PROFILE,
    };
  }

  async signupCompleteProfile(
    registrationTokenRaw: string,
    dto: { firstName: string; lastName: string; password: string },
    meta: SessionMeta,
  ) {
    const userId = await this.sessionStore.consumeRegistrationToken(
      registrationTokenRaw,
    );
    if (!userId) {
      throw new UnauthorizedException(
        'Registration session expired, please verify your email again',
      );
    }

    const user = await this.userRepo.findById(userId);
    if (!user || user.registrationStatus !== RegistrationStatus.VERIFIED_PENDING_PROFILE) {
      throw new UnauthorizedException('Registration session is no longer valid');
    }

    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.passwordHash = await argon2.hash(dto.password);
    user.registrationStatus = RegistrationStatus.COMPLETE;
    await this.userRepo.save(user);

    await this.sessionStore.revokeAllSessions(user.id);
    const session = await this.sessionStore.issueSession(user.id, meta);

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: toPublicUser(user),
    };
  }

  // ---------------------------------------------------------------------
  // Signin / signout / refresh
  // ---------------------------------------------------------------------

  async signin(email: string, password: string, meta: SessionMeta) {
    const normalized = normalizeEmail(email);

    const withinLimits = await this.rateLimit.consume(
      `ratelimit:signin-account:${normalized}`,
      10,
      3600,
    );
    if (!withinLimits) {
      throw new HttpException(
        'Too many attempts, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.userRepo.findByEmail(normalized);
    const hashToVerify = user?.passwordHash ?? (await this.getDummyPasswordHash());

    let valid: boolean;
    try {
      valid = await argon2.verify(hashToVerify, password);
    } catch {
      valid = false;
    }

    if (
      !user ||
      !user.passwordHash ||
      !valid ||
      user.registrationStatus !== RegistrationStatus.COMPLETE
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.sessionStore.revokeAllSessions(user.id);
    const session = await this.sessionStore.issueSession(user.id, meta);

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: toPublicUser(user),
    };
  }

  async signOut(
    accessToken: string,
    sessionId: string,
    userId: string,
  ): Promise<{ ok: true }> {
    await Promise.all([
      this.sessionStore.revokeSession(sessionId, userId),
      this.sessionStore.revokeAccessToken(accessToken),
    ]);
    return { ok: true };
  }

  async signOutAll(userId: string): Promise<{ ok: true }> {
    await this.sessionStore.revokeAllSessions(userId);
    return { ok: true };
  }

  async refresh(refreshTokenRaw: string) {
    const outcome = await this.sessionStore.rotateRefreshToken(refreshTokenRaw);

    if (outcome.status === 'invalid') {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
    if (outcome.status === 'reuse_detected') {
      throw new UnauthorizedException(
        'Refresh token reuse detected, please sign in again',
      );
    }

    return {
      accessToken: outcome.accessToken,
      refreshToken: outcome.refreshToken,
    };
  }

  // ---------------------------------------------------------------------
  // Password
  // ---------------------------------------------------------------------

  @Transactional()
  async passwordForgot(email: string, ip: string): Promise<{ ok: true }> {
    const normalized = normalizeEmail(email);

    const withinLimits =
      (await this.rateLimit.consume(
        `ratelimit:pwd-forgot-ip:${ip}`,
        5,
        3600,
      )) &&
      (await this.rateLimit.consume(
        `ratelimit:pwd-forgot-email:${normalized}`,
        5,
        3600,
      ));

    const user = withinLimits
      ? await this.userRepo.findByEmail(normalized)
      : null;

    if (user?.passwordHash) {
      await this.tokenRepo.revokeAllActive(user.id, TokenType.PASSWORD_RESET);
      const raw = generateOpaqueToken(32);
      await this.tokenRepo.save({
        userId: user.id,
        type: TokenType.PASSWORD_RESET,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000),
      });
      const resetUrl = `${this.configService.app.clientUrl}/reset-password/${raw}`;
      await this.emailService.send({
        to: normalized,
        subject: 'Reset your password',
        text: `Reset your password: ${resetUrl}\nIt expires in ${PASSWORD_RESET_TTL_SECONDS / 60} minutes.`,
      });
    }

    return { ok: true };
  }

  @Transactional()
  async passwordReset(
    rawToken: string,
    newPassword: string,
  ): Promise<{ ok: true }> {
    const tokenRecord = await this.tokenRepo.findActiveByHash(
      TokenType.PASSWORD_RESET,
      hashToken(rawToken),
    );
    if (!tokenRecord) {
      throw new UnauthorizedException('Reset token is invalid or expired');
    }

    const user = await this.userRepo.findById(tokenRecord.userId);
    if (!user) {
      throw new UnauthorizedException('Reset token is invalid or expired');
    }

    user.passwordHash = await argon2.hash(newPassword);
    await this.userRepo.save(user);
    await this.tokenRepo.markUsed(tokenRecord.id);
    await this.sessionStore.revokeAllSessions(user.id);

    return { ok: true };
  }

  async setPassword(userId: string, password: string): Promise<{ ok: true }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.passwordHash) {
      throw new ConflictException(
        'Password is already set for this account',
      );
    }

    user.passwordHash = await argon2.hash(password);
    await this.userRepo.save(user);
    return { ok: true };
  }

  // ---------------------------------------------------------------------
  // Registration status
  // ---------------------------------------------------------------------

  async registrationStatus(
    accessToken?: string,
    registrationToken?: string,
  ): Promise<{
    registrationStatus: 'NOT_STARTED' | 'VERIFIED_PENDING_PROFILE' | 'COMPLETE';
  }> {
    if (accessToken) {
      const session = await this.sessionStore.verifyAccessToken(accessToken);
      if (session) {
        return { registrationStatus: 'COMPLETE' };
      }
    }

    if (registrationToken) {
      const userId = await this.sessionStore.peekRegistrationToken(
        registrationToken,
      );
      if (userId) {
        return { registrationStatus: 'VERIFIED_PENDING_PROFILE' };
      }
    }

    return { registrationStatus: 'NOT_STARTED' };
  }

  // ---------------------------------------------------------------------
  // Google OAuth
  // ---------------------------------------------------------------------

  consumeOAuthState(state: string): Promise<OAuthStateData | null> {
    return this.sessionStore.consumeOAuthState(state);
  }

  async createLinkIntent(userId: string): Promise<{ linkCode: string }> {
    const linkCode = await this.sessionStore.issueLinkIntent(userId);
    return { linkCode };
  }

  async exchangeHandoff(code: string) {
    const payload = await this.sessionStore.consumeHandoff(code);
    if (!payload) {
      throw new UnauthorizedException('Handoff code is invalid or expired');
    }
    return payload;
  }

  async handleProfile(
    profile: Profile,
    state: OAuthStateData,
    meta: SessionMeta,
  ): Promise<GoogleOutcome> {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    const emailVerified =
      (profile as unknown as { _json?: { email_verified?: boolean } })._json
        ?.email_verified === true;

    if (!email || !emailVerified) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    const providerUserId = profile.id;

    if (state.intent === 'link') {
      const linkUserId = state.linkUserId;
      if (!linkUserId) {
        return { type: 'link', ok: false, errorCode: 'missing_link_user' };
      }

      const existingLink = await this.authIdentityRepo.findByProvider(
        AuthProvider.GOOGLE,
        providerUserId,
      );
      if (existingLink && existingLink.userId !== linkUserId) {
        return { type: 'link', ok: false, errorCode: 'already_linked' };
      }
      if (!existingLink) {
        await this.authIdentityRepo.save({
          userId: linkUserId,
          provider: AuthProvider.GOOGLE,
          providerUserId,
          providerEmail: email,
        });
      }
      return { type: 'link', ok: true };
    }

    const identity = await this.authIdentityRepo.findByProvider(
      AuthProvider.GOOGLE,
      providerUserId,
    );
    let user = identity ? await this.userRepo.findById(identity.userId) : null;

    if (!user) {
      const existingByEmail = await this.userRepo.findByEmail(email);
      if (existingByEmail) {
        throw new ConflictException(
          'This email is already registered with a password. Sign in and link Google from account settings.',
        );
      }
      user = await this.createGoogleUser(
        email,
        profile.name?.givenName ?? null,
        profile.name?.familyName ?? null,
        providerUserId,
      );
    }

    await this.sessionStore.revokeAllSessions(user.id);
    const session = await this.sessionStore.issueSession(user.id, meta);
    const handoffCode = await this.sessionStore.issueHandoff({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      sessionId: session.sessionId,
      user: toPublicUser(user),
    });

    return { type: 'auth', handoffCode };
  }

  @Transactional()
  private async createGoogleUser(
    email: string,
    firstName: string | null,
    lastName: string | null,
    providerUserId: string,
  ): Promise<UserEntity> {
    const user = await this.userRepo.save({
      email,
      firstName,
      lastName,
      emailVerified: true,
      registrationStatus: RegistrationStatus.COMPLETE,
    });
    await this.authIdentityRepo.save({
      userId: user.id,
      provider: AuthProvider.GOOGLE,
      providerUserId,
      providerEmail: email,
    });
    return user;
  }

  // ---------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------

  private async issueOtp(userId: string, email: string): Promise<void> {
    await this.tokenRepo.revokeAllActive(userId, TokenType.EMAIL_VERIFICATION);

    const raw = generateOtp();
    const ttlSeconds = this.configService.auth.otp.ttlSeconds;
    await this.tokenRepo.save({
      userId,
      type: TokenType.EMAIL_VERIFICATION,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      metadata: { attempts: 0 },
    });

    await this.emailService.send({
      to: email,
      subject: 'Your verification code',
      text: `Your verification code is ${raw}. It expires in ${Math.round(ttlSeconds / 60)} minutes.`,
    });
  }

  private async consumeOtpRateLimits(
    email: string,
    ip: string,
  ): Promise<boolean> {
    const emailOk = await this.rateLimit.consume(
      `ratelimit:otp-email:${email}`,
      5,
      3600,
    );
    const ipOk = await this.rateLimit.consume(`ratelimit:otp-ip:${ip}`, 10, 3600);
    return emailOk && ipOk;
  }

  private getDummyPasswordHash(): Promise<string> {
    if (!this.dummyPasswordHash) {
      this.dummyPasswordHash = argon2.hash(
        'dummy-password-for-timing-safety',
      );
    }
    return this.dummyPasswordHash;
  }
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
