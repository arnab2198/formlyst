import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '../../config/config.module.js';
import { EmailProcessor } from './email.processor.js';
import { EmailQueueService } from './email-queue.service.js';
import { EmailTemplateService } from './email-template.service.js';
import { EMAIL_SERVICE } from './email.interface.js';

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'email',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    }),
  ],
  providers: [
    EmailTemplateService,
    EmailProcessor,
    EmailQueueService,
    { provide: EMAIL_SERVICE, useExisting: EmailQueueService },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
