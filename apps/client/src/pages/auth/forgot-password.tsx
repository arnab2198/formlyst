import { ForgotPasswordForm } from '#/components/forms/forgot-password-form'

export function ForgotPasswordPage() {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Forgot your password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the email address associated with your account and we&apos;ll
          send you a link to reset your password.
        </p>
      </div>

      <ForgotPasswordForm />
    </>
  )
}
