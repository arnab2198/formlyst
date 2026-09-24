import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Injectable, OnModuleInit } from '@nestjs/common';
import Handlebars from 'handlebars';
import { ConfigService } from '../../config/config.service.js';
import type { EmailTemplate } from './email.interface.js';

const TEMPLATE_NAMES: EmailTemplate[] = ['otp-code', 'password-reset'];
const PARTIAL_NAMES = ['header', 'footer'];

const templatesDir = join(dirname(fileURLToPath(import.meta.url)), 'templates');

@Injectable()
export class EmailTemplateService implements OnModuleInit {
  private readonly compiled = new Map<
    EmailTemplate,
    HandlebarsTemplateDelegate
  >();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    for (const name of PARTIAL_NAMES) {
      const source = readFileSync(
        join(templatesDir, 'partials', `${name}.hbs`),
        'utf-8',
      );
      Handlebars.registerPartial(name, source);
    }

    for (const name of TEMPLATE_NAMES) {
      const source = readFileSync(join(templatesDir, `${name}.hbs`), 'utf-8');
      this.compiled.set(name, Handlebars.compile(source));
    }
  }

  render(template: EmailTemplate, context: Record<string, unknown>): string {
    const compiledTemplate = this.compiled.get(template);
    if (!compiledTemplate) {
      throw new Error(`Unknown email template: ${template}`);
    }

    return compiledTemplate({
      ...context,
      clientUrl: this.configService.app.clientUrl,
      currentYear: new Date().getFullYear(),
    });
  }
}
