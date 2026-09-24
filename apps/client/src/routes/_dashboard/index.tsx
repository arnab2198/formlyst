import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '#/pages/dashboard/dashboard'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/_dashboard/')({
  head: ({ match }) =>
    seo({
      title: 'Dashboard',
      noIndex: true,
      canonicalPath: match.pathname,
    }),
  component: DashboardIndexRoute,
})

function DashboardIndexRoute() {
  const { user } = Route.useRouteContext()
  return <DashboardPage user={user} />
}
