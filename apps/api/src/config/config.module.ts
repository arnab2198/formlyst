import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { appConfig } from './configs/app.config.js';
import { authConfig } from './configs/auth.config.js';
import { databaseConfig } from './configs/database.config.js';
import { redisConfig } from './configs/redis.config.js';
import { mailConfig } from './configs/mail.config.js';
import { envValidationSchema } from './env.validation.js';
import { ConfigService } from './config.service.js';
import { telemetryConfig } from './configs/telemetry.config.js';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        redisConfig,
        mailConfig,
        telemetryConfig,
      ],
      validationSchema: envValidationSchema,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
