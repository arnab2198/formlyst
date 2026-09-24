import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthErrorFallback } from '#/components/common/auth-error-fallback'
import { SignUpPage } from '#/pages/auth/signup'
import { seo } from '#/lib/seo'
import { getRegistrationStatus } from '#/server/auth/auth.functions'

export const Route = createFileRoute('/_auth/signup')({
  head: ({ match }) =>
    seo({
      title: 'Sign up',
      description:
        'Create a Formlyst account to start building and managing your forms.',
      noIndex: true,
      canonicalPath: match.pathname,
    }),
  errorComponent: AuthErrorFallback,
  loader: async () => {
    const { registrationStatus } = await getRegistrationStatus()
    if (registrationStatus === 'COMPLETE') {
      throw redirect({ to: '/', replace: true })
    }
    return {
      initialStep:
        registrationStatus === 'VERIFIED_PENDING_PROFILE' ? (3 as const) : (1 as const),
    }
  },
  component: SignUpRoute,
})

function SignUpRoute() {
  const { initialStep } = Route.useLoaderData()
  return <SignUpPage initialStep={initialStep} />
}
