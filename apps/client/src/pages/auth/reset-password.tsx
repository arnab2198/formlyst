import { ResetPasswordForm } from '#/components/forms/reset-password-form'

interface ResetPasswordPageProps {
  token: string
}

export function ResetPasswordPage({ token }: ResetPasswordPageProps) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Set a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      <ResetPasswordForm token={token} />
    </>
  )
}
