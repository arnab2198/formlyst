import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService, ConfigType } from '@nestjs/config';
import { appConfig } from './configs/app.config.js';
import { databaseConfig } from './configs/database.config.js';
import { redisConfig } from './configs/redis.config.js';
import { mailConfig } from './configs/mail.config.js';
import { telemetryConfig } from './configs/telemetry.config.js';

export interface AppConfiguration {
  app: ConfigType<typeof appConfig>;
  database: ConfigType<typeof databaseConfig>;
  redis: ConfigType<typeof redisConfig>;
  mail: ConfigType<typeof mailConfig>;
  telemetry: ConfigType<typeof telemetryConfig>;
}

@Injectable()
export class ConfigService extends NestConfigService<AppConfiguration, true> {
  get app() {
    return this.get('app', { infer: true });
  }

  get database() {
    return this.get('database', { infer: true });
  }

  get redis() {
    return this.get('redis', { infer: true });
  }

  get mail() {
    return this.get('mail', { infer: true });
  }

  get telemetry() {
    return this.get('telemetry', { infer: true });
  }

  isProduction(): boolean {
    return this.app.env === 'production';
  }

  isDevelopment(): boolean {
    return this.app.env === 'development';
  }

  isTest(): boolean {
    return this.app.env === 'test';
  }

  getRedisUrl(): string {
    const { host, port, password } = this.redis;
    return password
      ? `redis://:${password}@${host}:${port}`
      : `redis://${host}:${port}`;
  }

  getMailTransportOptions() {
    const { host, port, secure, user, password } = this.mail;
    return {
      host,
      port,
      secure,
      auth: user && password ? { user, pass: password } : undefined,
    };
  }
}
