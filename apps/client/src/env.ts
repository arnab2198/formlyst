import { createEnv } from '@t3-oss/env-core'
import { createIsomorphicFn } from '@tanstack/react-start'
import { z } from 'zod'

const getRuntimeEnv = createIsomorphicFn()
  .server(() => process.env)
  .client(() => import.meta.env)

export const env = createEnv({
  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  },
  server: {
    SERVER_URL: z.string().url().optional(),
    APP_ORIGIN: z.string().url(),
    API_BASE_URL: z.string().url(),
    PUBLIC_API_BASE_URL: z.string().url(),
    INTERNAL_API_KEY: z.string().min(32),
    SESSION_SECRET: z.string().min(32),
  },
  clientPrefix: 'VITE_',
  client: {
    VITE_APP_TITLE: z.string().min(1).default('Formlyst'),
    VITE_SITE_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    ...getRuntimeEnv(),
    NODE_ENV: import.meta.env.MODE,
  },
  emptyStringAsUndefined: true,
})
