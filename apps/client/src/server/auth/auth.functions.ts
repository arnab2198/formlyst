import { createServerFn } from '@tanstack/react-start'
import { signUpDetailsStepSchema } from '@formlyst/utils'
import type { User } from '#/types/user'
import { Http, HttpError, unwrap } from '#/lib/http'
import { AuthApi } from '#/lib/api-routes'
import { rateLimitMiddleware } from '#/server/rate-limit-middleware'
import { useAppSession } from './session'
import {
  emailOnlySchema,
  resetPasswordInputSchema,
  setPasswordInputSchema,
  signinInputSchema,
  verifyOtpInputSchema,
} from './schemas'

type AppSession = Awaited<ReturnType<typeof useAppSession>>

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface SessionSummary {
  sessionId: string
  deviceLabel: string
  ip: string
  lastSeenAt: string
  isCurrent: boolean
}

export interface AccountUser extends User {
  hasPassword: boolean
  linkedProviders: string[]
}

type RegistrationStatus = 'NOT_STARTED' | 'VERIFIED_PENDING_PROFILE' | 'COMPLETE'

function authHeader(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` }
}

async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const response = await Http.post(AuthApi.refresh, undefined, {
    headers: { 'x-refresh-token': refreshToken },
  })
  return unwrap<AuthTokens>(response)
}

/**
 * Calls `request` with the session's access token, retrying once (after a
 * silent refresh) if the backend rejects it as expired.
 */
async function callAuthenticated<T>(
  session: AppSession,
  request: (accessToken: string) => Promise<T>,
): Promise<T> {
  const accessToken = session.data.accessToken
  if (!accessToken) throw new Error('Not signed in')

  try {
    return await request(accessToken)
  } catch (error) {
    const refreshToken = session.data.refreshToken
    if (!(error instanceof HttpError) || error.status !== 401 || !refreshToken) {
      throw error
    }

    const refreshed = await refreshTokens(refreshToken)
    await session.update(refreshed)
    return request(refreshed.accessToken)
  }
}

// ---------------------------------------------------------------------
// Signup
// ---------------------------------------------------------------------

export const signupStart = createServerFn({ method: 'POST' })
  .middleware([
    rateLimitMiddleware({ key: 'signup-start', max: 10, windowMs: 60 * 60_000 }),
  ])
  .validator(emailOnlySchema)
  .handler(async ({ data }) => {
    const response = await Http.post(AuthApi.signupStart, data)
    return unwrap<{
      nextStep: 'VERIFY_EMAIL' | 'ALREADY_REGISTERED'
      maskedEmail?: string
    }>(response)
  })

export const resendOtp = createServerFn({ method: 'POST' })
  .middleware([
    rateLimitMiddleware({ key: 'resend-otp', max: 5, windowMs: 60 * 60_000 }),
  ])
  .validator(emailOnlySchema)
  .handler(async ({ data }) => {
    const response = await Http.post(AuthApi.signupResendOtp, data)
    return unwrap<{ ok: true }>(response)
  })

export const verifyOtp = createServerFn({ method: 'POST' })
  .middleware([
    rateLimitMiddleware({ key: 'verify-otp', max: 20, windowMs: 60_000 }),
  ])
  .validator(verifyOtpInputSchema)
  .handler(async ({ data }) => {
    const response = await Http.post(AuthApi.signupVerifyOtp, data)
    const { registrationToken } = unwrap<{
      registrationToken: string
      registrationStatus: string
    }>(response)

    const session = await useAppSession()
    await session.update({ registrationToken })
    return { ok: true as const }
  })

export const completeProfile = createServerFn({ method: 'POST' })
  .validator(signUpDetailsStepSchema)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const registrationToken = session.data.registrationToken
    if (!registrationToken) {
      throw new Error('Registration session expired, please start again')
    }

    const response = await Http.post(AuthApi.signupCompleteProfile, data, {
      headers: { 'x-registration-token': registrationToken },
    })
    const { accessToken, refreshToken, user } = unwrap<
      AuthTokens & { user: User }
    >(response)

    await session.update({
      accessToken,
      refreshToken,
      registrationToken: undefined,
    })
    return { user }
  })

// ---------------------------------------------------------------------
// Signin / signout / registration status
// ---------------------------------------------------------------------

export const signIn = createServerFn({ method: 'POST' })
  .middleware([
    rateLimitMiddleware({ key: 'signin', max: 10, windowMs: 60_000 }),
  ])
  .validator(signinInputSchema)
  .handler(async ({ data }) => {
    const response = await Http.post(AuthApi.signin, data)
    const { accessToken, refreshToken, user } = unwrap<
      AuthTokens & { user: User }
    >(response)

    const session = await useAppSession()
    await session.update({
      accessToken,
      refreshToken,
      registrationToken: undefined,
    })
    return { user }
  })

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession()
  const accessToken = session.data.accessToken
  if (accessToken) {
    await Http.post(AuthApi.signout, undefined, {
      headers: authHeader(accessToken),
    }).catch(() => undefined)
  }
  await session.clear()
  return { ok: true as const }
})

export const signOutAll = createServerFn({ method: 'POST' }).handler(
  async () => {
    const session = await useAppSession()
    if (session.data.accessToken) {
      await callAuthenticated(session, (accessToken) =>
        Http.post(AuthApi.signoutAll, undefined, {
          headers: authHeader(accessToken),
        }),
      ).catch(() => undefined)
    }
    await session.clear()
    return { ok: true as const }
  },
)

export const getRegistrationStatus = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    const headers: Record<string, string> = {}
    if (session.data.accessToken) {
      Object.assign(headers, authHeader(session.data.accessToken))
    }
    if (session.data.registrationToken) {
      headers['x-registration-token'] = session.data.registrationToken
    }

    const response = await Http.get(AuthApi.registrationStatus, { headers })
    return unwrap<{ registrationStatus: RegistrationStatus }>(response)
  },
)

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ user: AccountUser | null }> => {
    const session = await useAppSession()
    if (!session.data.accessToken) return { user: null }

    try {
      const user = await callAuthenticated(session, async (accessToken) =>
        unwrap<AccountUser>(
          await Http.get(AuthApi.me, { headers: authHeader(accessToken) }),
        ),
      )
      return { user }
    } catch {
      return { user: null }
    }
  },
)

export const listSessions = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    if (!session.data.accessToken) throw new Error('Not signed in')

    return callAuthenticated(session, async (accessToken) =>
      unwrap<{ sessions: SessionSummary[] }>(
        await Http.get(AuthApi.sessions, { headers: authHeader(accessToken) }),
      ),
    )
  },
)

// ---------------------------------------------------------------------
// Password
// ---------------------------------------------------------------------

export const forgotPassword = createServerFn({ method: 'POST' })
  .middleware([
    rateLimitMiddleware({
      key: 'password-forgot',
      max: 5,
      windowMs: 60 * 60_000,
    }),
  ])
  .validator(emailOnlySchema)
  .handler(async ({ data }) => {
    const response = await Http.post(AuthApi.passwordForgot, data)
    return unwrap<{ ok: true }>(response)
  })

export const resetPassword = createServerFn({ method: 'POST' })
  .validator(resetPasswordInputSchema)
  .handler(async ({ data }) => {
    const response = await Http.post(AuthApi.passwordReset, data)
    return unwrap<{ ok: true }>(response)
  })

export const setPassword = createServerFn({ method: 'POST' })
  .validator(setPasswordInputSchema)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    if (!session.data.accessToken) throw new Error('Not signed in')

    return callAuthenticated(session, async (accessToken) =>
      unwrap<{ ok: true }>(
        await Http.post(AuthApi.setPassword, data, {
          headers: authHeader(accessToken),
        }),
      ),
    )
  })
