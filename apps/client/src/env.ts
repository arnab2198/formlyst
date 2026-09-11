import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  },
  server: {
    SERVER_URL: z.string().url().optional(),
  },
  clientPrefix: 'VITE_',
  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
  },
  runtimeEnv: {
    ...import.meta.env,
    NODE_ENV: import.meta.env.MODE,
  },
  emptyStringAsUndefined: true,
})
