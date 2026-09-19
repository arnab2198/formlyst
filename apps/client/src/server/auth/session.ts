import { createServerOnlyFn } from '@tanstack/react-start'
import { useSession } from '@tanstack/react-start/server'
import { env } from '#/env'

export type AppSessionData = {
  /** present once OTP is verified, cleared once profile is completed */
  registrationToken?: string
  /** present once fully logged in (profile completed / sign in / Google auth / refresh) */
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
