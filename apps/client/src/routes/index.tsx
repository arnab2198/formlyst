import { createFileRoute } from '@tanstack/react-router'
import { absoluteUrl, seo } from '#/lib/seo'
import { env } from '#/env'

export const Route = createFileRoute('/')({
  head: ({ match }) =>
    seo({
      canonicalPath: match.pathname,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: env.VITE_APP_TITLE,
        description:
          'Formlyst is a modern form builder — create beautiful forms and collect responses effortlessly.',
        url: absoluteUrl(match.pathname),
      },
    }),
  component: Home,
})

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
    </div>
  )
}
