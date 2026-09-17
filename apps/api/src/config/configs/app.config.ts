import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'Formlyst API',
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '8000', 10),
  url: process.env.APP_URL ?? 'http://localhost:8000',
  version: process.env.APP_VERSION ?? '1.0.0',
}));
