import { registerAs } from '@nestjs/config';

export const telemetryConfig = registerAs('telemetry', () => ({
  appKey: process.env.OBSERVE_APP_KEY,
  appSecret: process.env.OBSERVE_APP_SECRET,
  serviceId: process.env.OBSERVE_SERVICE_ID ?? 'api',
}));
