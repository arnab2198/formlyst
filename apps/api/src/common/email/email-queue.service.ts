import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { EmailService, SendEmailOptions } from './email.interface.js';

@Injectable()
export class EmailQueueService implements EmailService {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  async send(options: SendEmailOptions): Promise<void> {
    await this.emailQueue.add('send', options);
  }
}
