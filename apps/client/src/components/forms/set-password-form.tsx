import { zodResolver } from '@hookform/resolvers/zod'
import { useHydrated } from '@tanstack/react-router'
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
import { setPassword } from '#/server/auth/auth.functions'
import { setPasswordSchema } from '@formlyst/utils'
import type { SetPasswordFormValues } from '@formlyst/utils'

const DEFAULT_VALUES: SetPasswordFormValues = {
  password: '',
  confirmPassword: '',
}

interface SetPasswordFormProps {
  onSuccess: () => void
}

export function SetPasswordForm({ onSuccess }: SetPasswordFormProps) {
  const hydrated = useHydrated()
  const setPasswordFn = useServerFn(setPassword)
  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    disabled: !hydrated,
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await setPasswordFn({ data: values })
      toast.success('Password set successfully')
      onSuccess()
    } catch (error) {
      form.setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Something went wrong, please try again.',
      })
    }
  })

  return (
    <form className="flex flex-col gap-4" noValidate autoComplete="off" onSubmit={onSubmit}>
      <FieldGroup>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <PasswordInput
                {...field}
                id={field.name}
                autoComplete="off"
                placeholder="Create a password"
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
                placeholder="Re-enter your password"
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

        <Button disabled={!hydrated} type="submit" className="w-full">
          Set password
        </Button>
      </FieldGroup>
    </form>
  )
}
