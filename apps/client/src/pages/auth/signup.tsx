import { SignUpForm } from '#/components/forms/signup-form'

export function SignUpPage() {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start building and collecting responses for your forms.
        </p>
      </div>

      <SignUpForm />
    </>
  )
}
