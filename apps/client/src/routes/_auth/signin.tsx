import { createFileRoute } from '@tanstack/react-router'
import { SignInPage } from '#/pages/auth/signin'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/_auth/signin')({
  head: ({ match }) =>
    seo({
      title: 'Sign in',
      description:
        'Sign in to your Formlyst account to keep building and managing your forms.',
      noIndex: true,
      canonicalPath: match.pathname,
    }),
  component: SignInPage,
})
