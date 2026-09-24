export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

export type EmailTemplate = 'otp-code' | 'password-reset';

export interface SendEmailOptions {
  to: string;
  subject: string;
  template: EmailTemplate;
  context: Record<string, unknown>;
}

export interface EmailService {
  send(options: SendEmailOptions): Promise<void>;
}
