import { createFileRoute } from '@tanstack/react-router'
import { AuthErrorFallback } from '#/components/common/auth-error-fallback'
import { ForgotPasswordPage } from '#/pages/auth/forgot-password'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/_auth/forgot-password')({
  head: ({ match }) =>
    seo({
      title: 'Forgot password',
      description:
        'Reset your Formlyst account password by requesting a secure reset link.',
      noIndex: true,
      canonicalPath: match.pathname,
    }),
  errorComponent: AuthErrorFallback,
  component: ForgotPasswordPage,
})
