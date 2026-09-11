import TanstackDevtoolsPanel from '#/components/common/tanstack-devtools'
import { seo } from '#/lib/seo'
import { ThemeProvider } from '#/providers/theme-provider'
import { getInitialTheme } from '#/server/theme/theme.functions'
import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => seo,
  beforeLoad: async () => ({
    theme: await getInitialTheme(),
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = Route.useRouteContext()

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : undefined} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <TanstackDevtoolsPanel />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
