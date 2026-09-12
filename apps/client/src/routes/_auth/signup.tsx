import { createFileRoute } from '@tanstack/react-router'
import { SignUpPage } from '#/pages/auth/signup'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/_auth/signup')({
  head: ({ match }) =>
    seo({
      title: 'Sign up',
      description:
        'Create a Formlyst account to start building and managing your forms.',
      noIndex: true,
      canonicalPath: match.pathname,
    }),
  component: SignUpPage,
})
