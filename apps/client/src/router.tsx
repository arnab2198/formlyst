import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { DefaultError } from './components/common/default-error'
import { DefaultNotFound } from './components/common/default-not-found'
import { getContext } from './providers/tanstack-query-provider'

export function getRouter() {
  const context = getContext()

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultError,
    defaultNotFoundComponent: DefaultNotFound,
  })

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
