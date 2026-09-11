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
  head: ({ match }) => {
    const { meta, links } = seo()
    const themeColor = match.context.theme === 'dark' ? '#0a0a0a' : '#ffffff'

    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: themeColor },
        ...meta,
      ],
      links: [
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '96x96',
          href: '/favicon-96x96.png',
        },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        ...links,
      ],
    }
  },
  beforeLoad: async () => ({
    theme: await getInitialTheme(),
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = Route.useRouteContext()

  return (
    <html
      lang="en"
      className={theme === 'dark' ? 'dark' : undefined}
      suppressHydrationWarning
    >
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
