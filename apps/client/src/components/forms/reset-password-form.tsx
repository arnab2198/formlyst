import { zodResolver } from '@hookform/resolvers/zod'
import { useHydrated, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { PasswordInput } from '#/components/ui/password-input'
import { resetPassword } from '#/server/auth/auth.functions'
import { resetPasswordSchema } from '@formlyst/utils'
import type { ResetPasswordFormValues } from '@formlyst/utils'

const DEFAULT_VALUES: ResetPasswordFormValues = {
  password: '',
  confirmPassword: '',
}

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const hydrated = useHydrated()
  const router = useRouter()
  const resetPasswordFn = useServerFn(resetPassword)
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    disabled: !hydrated,
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await resetPasswordFn({
        data: {
          token,
          newPassword: values.password,
          confirmPassword: values.confirmPassword,
        },
      })
      toast.success('Your password has been reset')
      router.navigate({ to: '/signin' })
    } catch (error) {
      form.setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'This link has expired, please request a new one.',
      })
    }
  })

  return (
    <form className="mt-6" noValidate autoComplete="off" onSubmit={onSubmit}>
      <FieldGroup>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>New password</FieldLabel>
              <PasswordInput
                {...field}
                id={field.name}
                autoComplete="off"
                placeholder="Create a new password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
              <PasswordInput
                {...field}
                id={field.name}
                autoComplete="off"
                placeholder="Re-enter your new password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button disabled={!hydrated} size="lg" type="submit" className="w-full">
          Reset password
        </Button>
      </FieldGroup>
    </form>
  )
}
