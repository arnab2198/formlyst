import { createFileRoute } from '@tanstack/react-router'
import { AuthErrorFallback } from '#/components/common/auth-error-fallback'
import { ResetPasswordPage } from '#/pages/auth/reset-password'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/_auth/reset-password/$token')({
  head: ({ match }) =>
    seo({
      title: 'Reset password',
      description: 'Choose a new password for your Formlyst account.',
      noIndex: true,
      canonicalPath: match.pathname,
    }),
  errorComponent: AuthErrorFallback,
  component: ResetPasswordRoute,
})

function ResetPasswordRoute() {
  const { token } = Route.useParams()
  return <ResetPasswordPage token={token} />
}
