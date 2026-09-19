import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service.js';
import { RedisService } from '../../common/redis/redis.service.js';
import {
  generateOpaqueToken,
  hashToken,
} from '../../common/token/token.util.js';

export interface SessionMeta {
  ip: string;
  userAgent: string;
  deviceLabel: string;
}

interface SessionRecord {
  userId: string;
  deviceLabel: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string;
  refreshTokenHash: string;
}

export interface SessionSummary {
  sessionId: string;
  deviceLabel: string;
  ip: string;
  lastSeenAt: string;
}

export interface IssuedSession {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
}

export interface OAuthStateData {
  intent: 'auth' | 'link';
  linkUserId?: string;
}

type RefreshOutcome =
  | { status: 'ok'; sessionId: string; accessToken: string; refreshToken: string }
  | { status: 'invalid' }
  | { status: 'reuse_detected' };

const REVOKED_PREFIX = 'REVOKED:';
const REVOKED_GRACE_SECONDS = 120;

@Injectable()
export class SessionStoreService {
  constructor(
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private get ttl() {
    return this.configService.auth.tokenTtl;
  }

  // ---------------------------------------------------------------------
  // Sessions (access/refresh)
  // ---------------------------------------------------------------------

  async issueSession(
    userId: string,
    meta: SessionMeta,
  ): Promise<IssuedSession> {
    const sessionId = randomUUID();
    const accessToken = generateOpaqueToken();
    const refreshToken = generateOpaqueToken();
    const now = new Date().toISOString();

    const record: SessionRecord = {
      userId,
      deviceLabel: meta.deviceLabel,
      ip: meta.ip,
      userAgent: meta.userAgent,
      createdAt: now,
      lastSeenAt: now,
      refreshTokenHash: this.hashRefreshToken(refreshToken),
    };

    const pipeline = this.redis.client.pipeline();
    pipeline.hset(this.sessionKey(sessionId), record);
    pipeline.expire(this.sessionKey(sessionId), this.ttl.refreshAbsoluteMaxSeconds);
    pipeline.sadd(this.userSessionsKey(userId), sessionId);
    pipeline.set(
      this.accessKey(accessToken),
      JSON.stringify({ userId, sessionId }),
      'EX',
      this.ttl.accessSeconds,
    );
    pipeline.set(
      this.refreshKey(refreshToken),
      sessionId,
      'EX',
      this.ttl.refreshSeconds,
    );
    await pipeline.exec();

    return { sessionId, accessToken, refreshToken };
  }

  async verifyAccessToken(
    accessToken: string,
  ): Promise<{ userId: string; sessionId: string } | null> {
    const raw = await this.redis.get(this.accessKey(accessToken));
    if (!raw) return null;
    return JSON.parse(raw) as { userId: string; sessionId: string };
  }

  async rotateRefreshToken(presentedToken: string): Promise<RefreshOutcome> {
    const value = await this.redis.get(this.refreshKey(presentedToken));

    if (!value) {
      return { status: 'invalid' };
    }

    if (value.startsWith(REVOKED_PREFIX)) {
      const sessionId = value.slice(REVOKED_PREFIX.length);
      const session = await this.redis.client.hgetall(this.sessionKey(sessionId));
      const userId = session.userId;
      await this.revokeSession(sessionId, userId ?? null);
      return { status: 'reuse_detected' };
    }

    const sessionId = value;
    const session = await this.redis.client.hgetall(this.sessionKey(sessionId));
    if (!session.userId) {
      return { status: 'invalid' };
    }

    const accessToken = generateOpaqueToken();
    const refreshToken = generateOpaqueToken();

    const pipeline = this.redis.client.pipeline();
    pipeline.set(
      this.refreshKey(presentedToken),
      `${REVOKED_PREFIX}${sessionId}`,
      'EX',
      REVOKED_GRACE_SECONDS,
    );
    pipeline.set(
      this.refreshKey(refreshToken),
      sessionId,
      'EX',
      this.ttl.refreshSeconds,
    );
    pipeline.set(
      this.accessKey(accessToken),
      JSON.stringify({ userId: session.userId, sessionId }),
      'EX',
      this.ttl.accessSeconds,
    );
    pipeline.hset(this.sessionKey(sessionId), {
      refreshTokenHash: this.hashRefreshToken(refreshToken),
      lastSeenAt: new Date().toISOString(),
    });
    await pipeline.exec();

    return { status: 'ok', sessionId, accessToken, refreshToken };
  }

  async revokeSession(sessionId: string, userId: string | null): Promise<void> {
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const session = await this.redis.client.hgetall(this.sessionKey(sessionId));
      resolvedUserId = session.userId ?? null;
    }

    const pipeline = this.redis.client.pipeline();
    pipeline.del(this.sessionKey(sessionId));
    if (resolvedUserId) {
      pipeline.srem(this.userSessionsKey(resolvedUserId), sessionId);
    }
    await pipeline.exec();
  }

  revokeAccessToken(accessToken: string): Promise<number> {
    return this.redis.del(this.accessKey(accessToken));
  }

  async revokeAllSessions(userId: string): Promise<void> {
    const sessionIds = await this.redis.client.smembers(
      this.userSessionsKey(userId),
    );

    const pipeline = this.redis.client.pipeline();
    for (const sessionId of sessionIds) {
      pipeline.del(this.sessionKey(sessionId));
    }
    pipeline.del(this.userSessionsKey(userId));
    await pipeline.exec();
  }

  async listSessions(userId: string): Promise<SessionSummary[]> {
    const sessionIds = await this.redis.client.smembers(
      this.userSessionsKey(userId),
    );

    const summaries: SessionSummary[] = [];
    const staleIds: string[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.redis.client.hgetall(this.sessionKey(sessionId));
      if (!session.userId) {
        staleIds.push(sessionId);
        continue;
      }
      summaries.push({
        sessionId,
        deviceLabel: session.deviceLabel,
        ip: session.ip,
        lastSeenAt: session.lastSeenAt,
      });
    }

    if (staleIds.length > 0) {
      await this.redis.client.srem(this.userSessionsKey(userId), ...staleIds);
    }

    return summaries;
  }

  // ---------------------------------------------------------------------
  // Registration token (verify-otp -> complete-profile)
  // ---------------------------------------------------------------------

  async issueRegistrationToken(userId: string): Promise<string> {
    const token = generateOpaqueToken();
    await this.redis.set(
      this.registrationKey(token),
      userId,
      this.ttl.registrationSeconds,
    );
    return token;
  }

  peekRegistrationToken(token: string): Promise<string | null> {
    return this.redis.get(this.registrationKey(token));
  }

  consumeRegistrationToken(token: string): Promise<string | null> {
    return this.redis.getdel(this.registrationKey(token));
  }

  // ---------------------------------------------------------------------
  // OAuth state (CSRF/replay nonce for the Google redirect round-trip)
  // ---------------------------------------------------------------------

  async issueOAuthState(data: OAuthStateData): Promise<string> {
    const state = generateOpaqueToken(32);
    await this.redis.set(
      this.oauthStateKey(state),
      JSON.stringify(data),
      this.ttl.oauthStateSeconds,
    );
    return state;
  }

  async consumeOAuthState(state: string): Promise<OAuthStateData | null> {
    const raw = await this.redis.getdel(this.oauthStateKey(state));
    return raw ? (JSON.parse(raw) as OAuthStateData) : null;
  }

  // ---------------------------------------------------------------------
  // Link intent (carries "who is linking" across the Google redirect)
  // ---------------------------------------------------------------------

  async issueLinkIntent(userId: string): Promise<string> {
    const code = generateOpaqueToken(32);
    await this.redis.set(
      this.linkIntentKey(code),
      userId,
      this.ttl.linkIntentSeconds,
    );
    return code;
  }

  consumeLinkIntent(code: string): Promise<string | null> {
    return this.redis.getdel(this.linkIntentKey(code));
  }

  // ---------------------------------------------------------------------
  // Handoff (one-time code exchanged by Start after Google auth succeeds)
  // ---------------------------------------------------------------------

  async issueHandoff(payload: unknown): Promise<string> {
    const code = generateOpaqueToken(32);
    await this.redis.set(
      this.handoffKey(code),
      JSON.stringify(payload),
      this.ttl.handoffCodeSeconds,
    );
    return code;
  }

  async consumeHandoff<T = unknown>(code: string): Promise<T | null> {
    const raw = await this.redis.getdel(this.handoffKey(code));
    return raw ? (JSON.parse(raw) as T) : null;
  }

  // ---------------------------------------------------------------------

  private hashRefreshToken(token: string): string {
    return hashToken(token);
  }

  private sessionKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  private userSessionsKey(userId: string): string {
    return `user:${userId}:sessions`;
  }

  private accessKey(token: string): string {
    return `access:${token}`;
  }

  private refreshKey(token: string): string {
    return `refresh:${token}`;
  }

  private registrationKey(token: string): string {
    return `reg:${token}`;
  }

  private oauthStateKey(state: string): string {
    return `oauthstate:${state}`;
  }

  private linkIntentKey(code: string): string {
    return `linkintent:${code}`;
  }

  private handoffKey(code: string): string {
    return `handoff:${code}`;
  }
}
