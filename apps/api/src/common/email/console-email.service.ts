import { Injectable, Logger } from '@nestjs/common';
import type { EmailService, SendEmailOptions } from './email.interface.js';

@Injectable()
export class ConsoleEmailService implements EmailService {
  private readonly logger = new Logger(ConsoleEmailService.name);

  async send({ to, subject, text }: SendEmailOptions): Promise<void> {
    this.logger.log(`[email:console] to=${to} subject="${subject}"\n${text}`);
  }
}
