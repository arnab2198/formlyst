import { z } from 'zod';

// z.coerce.boolean() would turn "false" into `true` (Boolean("false") === true),
// so boolean env flags are parsed from an explicit "true"/"false" enum instead.
const booleanFlag = (defaultValue: 'true' | 'false') =>
  z
    .enum(['true', 'false'])
    .default(defaultValue)
    .transform((value) => value === 'true');

export const envValidationSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  APP_NAME: z.string().min(1).default('Formlyst API'),
  APP_URL: z.string().url().default('http://localhost:8000'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_HOST: z.string().min(1).default('localhost'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_USERNAME: z.string().min(1).default('postgres'),
  DATABASE_PASSWORD: z.string().default(''),
  DATABASE_NAME: z.string().min(1).default('formlyst'),
  DATABASE_URL: z.string().optional(),

  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TTL: z.coerce.number().int().positive().default(3600),

  MAIL_HOST: z.string().min(1).default('localhost'),
  MAIL_PORT: z.coerce.number().int().positive().default(587),
  MAIL_SECURE: booleanFlag('false'),
  MAIL_USER: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().email().default('no-reply@formlyst.dev'),

  OBSERVE_APP_KEY: z.string().min(1),
  OBSERVE_APP_SECRET: z.string().min(1),
  OBSERVE_SERVICE_ID: z.string().default('api'),

  INTERNAL_API_KEY: z.string().min(32),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(2_592_000),
  REFRESH_TOKEN_ABSOLUTE_MAX_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(7_776_000),
  REGISTRATION_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(1_800),
  OAUTH_STATE_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  LINK_INTENT_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  HANDOFF_CODE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  OTP_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
});

export type EnvSchema = z.infer<typeof envValidationSchema>;
