import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  internalApiKey: process.env.INTERNAL_API_KEY!,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  tokenTtl: {
    accessSeconds: parseInt(process.env.ACCESS_TOKEN_TTL_SECONDS ?? '900', 10),
    refreshSeconds: parseInt(
      process.env.REFRESH_TOKEN_TTL_SECONDS ?? '2592000',
      10,
    ),
    refreshAbsoluteMaxSeconds: parseInt(
      process.env.REFRESH_TOKEN_ABSOLUTE_MAX_SECONDS ?? '7776000',
      10,
    ),
    registrationSeconds: parseInt(
      process.env.REGISTRATION_TOKEN_TTL_SECONDS ?? '1800',
      10,
    ),
    oauthStateSeconds: parseInt(
      process.env.OAUTH_STATE_TTL_SECONDS ?? '600',
      10,
    ),
    linkIntentSeconds: parseInt(
      process.env.LINK_INTENT_TTL_SECONDS ?? '300',
      10,
    ),
    handoffCodeSeconds: parseInt(
      process.env.HANDOFF_CODE_TTL_SECONDS ?? '60',
      10,
    ),
  },
  otp: {
    ttlSeconds: parseInt(process.env.OTP_TTL_SECONDS ?? '600', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10),
  },
}));
