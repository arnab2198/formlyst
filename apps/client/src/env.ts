import { createEnv } from '@t3-oss/env-core'
import { createIsomorphicFn } from '@tanstack/react-start'
import { z } from 'zod'

// TanStack Start reads env from two different places per environment — see
// https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables.
// `process.env` on the server (populated at process start; this app deploys
// as a Node server via Nitro's node-server preset, so this is safe — it
// would need per-request handling on an edge runtime instead), and
// `import.meta.env` on the client, which only ever exposes `VITE_`-prefixed
// keys to the browser bundle.
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
