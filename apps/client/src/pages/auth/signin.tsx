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
