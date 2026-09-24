import { createServerOnlyFn } from '@tanstack/react-start'
import { useSession } from '@tanstack/react-start/server'
import { env } from '#/env'

export type AppSessionData = {
  registrationToken?: string
  accessToken?: string
  refreshToken?: string
}

export const useAppSession = createServerOnlyFn(() =>
  useSession<AppSessionData>({
    name: '__Host-app-session',
    password: env.SESSION_SECRET,
    cookie: {
      secure: true,
      sameSite: 'lax',
      httpOnly: true,
      path: '/',
    },
  }),
)
