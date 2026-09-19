export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
}

export interface EmailService {
  send(options: SendEmailOptions): Promise<void>;
}
