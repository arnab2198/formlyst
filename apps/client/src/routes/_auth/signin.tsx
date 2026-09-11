import { createFileRoute } from '@tanstack/react-router'
import { SignInPage } from '#/pages/auth/signin'

export const Route = createFileRoute('/_auth/signin')({
  component: SignInPage,
})
