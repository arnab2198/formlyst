import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AuthErrorFallback } from '#/components/common/auth-error-fallback'
import { AuthLayout } from '#/layouts/auth-layout'
import { getCurrentUser } from '#/server/auth/auth.functions'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const { user } = await getCurrentUser()
    if (user) {
      throw redirect({ to: '/', replace: true })
    }
  },
  component: AuthLayoutComponent,
  errorComponent: AuthErrorFallback,
})

function AuthLayoutComponent() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}
