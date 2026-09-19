import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from './config/config.module.js';
import { CommonModule } from './common/common.module.js';
import { ConfigService } from './config/config.service.js';
import { DatabaseModule } from './database/database.module.js';
import { RedisModule } from './common/redis/redis.module.js';
import { EmailModule } from './common/email/email.module.js';
import { RateLimitModule } from './common/rate-limit/rate-limit.module.js';
import { AuthModule } from './auth/auth.module.js';
import { InternalApiKeyGuard } from './auth/guards/internal-api-key.guard.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    DatabaseModule,
    RedisModule,
    EmailModule,
    RateLimitModule,
    AuthModule,
    ClsModule.forRoot({
      global: true,
      plugins: [
        new ClsPluginTransactional({
          imports: [TypeOrmModule],
          adapter: new TransactionalAdapterTypeOrm({
            dataSourceToken: getDataSourceToken(),
          }),
        }),
      ],
    }),
    ObserveModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        appKey: configService.telemetry.appKey!,
        appVersion: configService.app.version,
        environment: configService.app.env,
        appSecret: configService.telemetry.appSecret!,
        serviceId: configService.telemetry.serviceId,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: InternalApiKeyGuard },
  ],
})
export class AppModule {}
