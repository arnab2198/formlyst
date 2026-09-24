import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '#/server/auth/auth.functions'

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async () => {
    const { user } = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/signin', replace: true })
    }
    return { user }
  },
  component: DashboardLayoutComponent,
})

function DashboardLayoutComponent() {
  return (
    <div className="min-h-svh">
      <Outlet />
    </div>
  )
}
