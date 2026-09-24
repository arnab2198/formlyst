import { useServerFn } from '@tanstack/react-start'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { SetPasswordForm } from '#/components/forms/set-password-form'
import { signOutAll } from '#/server/auth/auth.functions'
import type {
  AccountUser,
  SessionSummary,
} from '#/server/auth/auth.functions'

interface AccountSettingsPageProps {
  user: AccountUser
  sessions: SessionSummary[]
}

export function AccountSettingsPage({
  user,
  sessions,
}: AccountSettingsPageProps) {
  const router = useRouter()
  const signOutAllFn = useServerFn(signOutAll)
  const [showSetPassword, setShowSetPassword] = useState(false)
  const googleLinked = user.linkedProviders.includes('GOOGLE')

  async function handleSignOutAll() {
    await signOutAllFn()
    router.navigate({ to: '/signin', replace: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Account settings
        </h1>
        <p className="text-sm text-muted-foreground">
          {user.firstName} {user.lastName} · {user.email}
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">
          Connected methods
        </h2>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Password</p>
            <p className="text-xs text-muted-foreground">
              {user.hasPassword ? 'Enabled' : 'Not set'}
            </p>
          </div>
          {!user.hasPassword && !showSetPassword && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSetPassword(true)}
            >
              Set password
            </Button>
          )}
        </div>

        {!user.hasPassword && showSetPassword && (
          <SetPasswordForm onSuccess={() => setShowSetPassword(false)} />
        )}

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Google</p>
            <p className="text-xs text-muted-foreground">
              {googleLinked ? 'Connected' : 'Not connected'}
            </p>
          </div>
          {!googleLinked && (
            <Button size="sm" variant="outline" asChild>
              <a href="/api/auth/google/start?intent=link">Connect Google</a>
            </Button>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Active sessions
          </h2>
          <Button size="sm" variant="ghost" onClick={handleSignOutAll}>
            Sign out of all devices
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {sessions.map((session) => (
            <div
              key={session.sessionId}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {session.deviceLabel}
                  {session.isCurrent && (
                    <span className="ml-2 text-xs text-primary">
                      This device
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.ip} · last active{' '}
                  {new Date(session.lastSeenAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function notifyGoogleLinkResult(searchParams: {
  linked?: string
  linkError?: string
}) {
  if (searchParams.linked === 'google') {
    toast.success('Google account connected')
  } else if (searchParams.linkError) {
    toast.error('Could not connect Google account')
  }
}
