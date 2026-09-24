import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { z } from 'zod'
import { AuthErrorFallback } from '#/components/common/auth-error-fallback'
import { SignInPage, notifyGoogleSignInError } from '#/pages/auth/signin'
import { seo } from '#/lib/seo'

const signinSearchSchema = z.object({
  googleError: z.string().optional(),
})

export const Route = createFileRoute('/_auth/signin')({
  validateSearch: signinSearchSchema,
  head: ({ match }) =>
    seo({
      title: 'Sign in',
      description:
        'Sign in to your Formlyst account to keep building and managing your forms.',
      noIndex: true,
      canonicalPath: match.pathname,
    }),
  errorComponent: AuthErrorFallback,
  component: SignInRoute,
})

function SignInRoute() {
  const search = Route.useSearch()

  useEffect(() => {
    notifyGoogleSignInError(search)
  }, [search])

  return <SignInPage />
}
