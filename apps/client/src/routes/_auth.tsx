import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AuthErrorFallback } from '#/components/common/auth-error-fallback'
import { AuthLayout } from '#/layouts/auth-layout'

export const Route = createFileRoute('/_auth')({
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
