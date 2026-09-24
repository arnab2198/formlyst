import { toast } from 'sonner'
import { SignInForm } from '#/components/forms/signin-form'

export function SignInPage() {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to keep building forms.
        </p>
      </div>

      <SignInForm />
    </>
  )
}

export function notifyGoogleSignInError(searchParams: { googleError?: string }) {
  if (searchParams.googleError === 'access_denied') {
    toast.error('Google sign-in was cancelled')
  } else if (searchParams.googleError === 'state_expired') {
    toast.error('Your sign-in session expired, please try again')
  } else if (searchParams.googleError) {
    toast.error('Could not sign in with Google, please try again')
  }
}
