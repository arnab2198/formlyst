import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '#/layouts/auth-layout'

export const Route = createFileRoute('/_auth')({
  component: AuthLayoutComponent,
})

function AuthLayoutComponent() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}
