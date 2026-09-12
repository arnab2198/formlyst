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
});

export type EnvSchema = z.infer<typeof envValidationSchema>;
