import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import { z } from 'zod'
import { seo } from '#/lib/seo'
import {
  AccountSettingsPage,
  notifyGoogleLinkResult,
} from '#/pages/account/settings'
import { getCurrentUser, listSessions } from '#/server/auth/auth.functions'

const settingsSearchSchema = z.object({
  linked: z.string().optional(),
  linkError: z.string().optional(),
})

export const Route = createFileRoute('/account/settings')({
  validateSearch: settingsSearchSchema,
  head: ({ match }) =>
    seo({
      title: 'Account settings',
      noIndex: true,
      canonicalPath: match.pathname,
    }),
  beforeLoad: async () => {
    const { user } = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/signin' })
    }
    const { sessions } = await listSessions()
    return { user, sessions }
  },
  component: AccountSettingsRoute,
})

function AccountSettingsRoute() {
  const { user, sessions } = Route.useRouteContext()
  const search = Route.useSearch()

  useEffect(() => {
    notifyGoogleLinkResult(search)
  }, [search])

  return <AccountSettingsPage user={user} sessions={sessions} />
}
