import { zodResolver } from '@hookform/resolvers/zod'
import { useHydrated } from '@tanstack/react-router'
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
  onBack: () => void
}

export function SignUpStepThree({
  onSubmitStep,
  onBack,
}: SignUpStepThreeProps) {
  const hydrated = useHydrated()
  const form = useForm<SignUpDetailsStepValues>({
    resolver: zodResolver(signUpDetailsStepSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    disabled: !hydrated,
  })

  return (
    <form
      className="mt-6"
      noValidate
      autoComplete="off"
      onSubmit={form.handleSubmit(onSubmitStep)}
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

        <div className="grid grid-cols-2 gap-2">
          <Button
            disabled={!hydrated}
            size="lg"
            type="button"
            variant="outline"
            className="w-full"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            disabled={!hydrated}
            size="lg"
            type="submit"
            className="w-full"
          >
            Create account
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
