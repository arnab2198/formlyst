import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '../../config/config.module.js';
import { ConfigService } from '../../config/config.service.js';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.redis.host,
          port: configService.redis.port,
          password: configService.redis.password,
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
