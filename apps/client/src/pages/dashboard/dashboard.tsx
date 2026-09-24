import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Button } from '#/components/ui/button'
import { signOut } from '#/server/auth/auth.functions'
import type { AccountUser } from '#/server/auth/auth.functions'

interface DashboardPageProps {
  user: AccountUser
}

export function DashboardPage({ user }: DashboardPageProps) {
  const router = useRouter()
  const signOutFn = useServerFn(signOut)

  async function handleSignOut() {
    await signOutFn()
    router.navigate({ to: '/signin', replace: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Welcome, {user.firstName}
      </h1>
      <Button size="sm" variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  )
}
