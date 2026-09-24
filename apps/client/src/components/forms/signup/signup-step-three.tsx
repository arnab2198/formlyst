import { zodResolver } from '@hookform/resolvers/zod'
import { useHydrated } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '#/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { PasswordInput } from '#/components/ui/password-input'
import { completeProfile } from '#/server/auth/auth.functions'
import { signUpDetailsStepSchema } from '@formlyst/utils'
import type { SignUpDetailsStepValues } from '@formlyst/utils'

const DEFAULT_VALUES: SignUpDetailsStepValues = {
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
}

interface SignUpStepThreeProps {
  onSubmitStep: (values: SignUpDetailsStepValues) => void
}

export function SignUpStepThree({
  onSubmitStep,
}: SignUpStepThreeProps) {
  const hydrated = useHydrated()
  const completeProfileFn = useServerFn(completeProfile)
  const form = useForm<SignUpDetailsStepValues>({
    resolver: zodResolver(signUpDetailsStepSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    disabled: !hydrated,
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await completeProfileFn({ data: values })
      onSubmitStep(values)
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
    <form
      className="mt-6"
      noValidate
      autoComplete="off"
      onSubmit={onSubmit}
    >
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  autoComplete="off"
                  placeholder="Jane"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  autoComplete="off"
                  placeholder="Doe"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

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

        <Button disabled={!hydrated} size="lg" type="submit" className="w-full">
          Create account
        </Button>
      </FieldGroup>
    </form>
  )
}
