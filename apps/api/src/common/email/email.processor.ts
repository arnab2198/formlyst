import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { convert } from 'html-to-text';
import type { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../../config/config.service.js';
import { EmailTemplateService } from './email-template.service.js';
import type { SendEmailOptions } from './email.interface.js';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: EmailTemplateService,
  ) {
    super();
    this.transporter = nodemailer.createTransport(
      configService.getMailTransportOptions(),
    );
  }

  async process(job: Job<SendEmailOptions>): Promise<void> {
    const { to, subject, template, context } = job.data;
    const html = this.templateService.render(template, context);
    const text = convert(html, { wordwrap: 80 });

    await this.transporter.sendMail({
      from: this.configService.mail.from,
      to,
      subject,
      html,
      text,
    });
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SendEmailOptions>, error: Error): void {
    this.logger.error(
      `Email job ${job.id} (to=${job.data.to}) failed: ${error.message}`,
    );
  }
}
