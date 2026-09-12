import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useHydrated } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '#/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { forgotPasswordSchema } from '#/schemas/forgot-password'
import type { ForgotPasswordFormValues } from '#/schemas/forgot-password'
import { Fragment } from 'react'

const DEFAULT_VALUES: ForgotPasswordFormValues = {
  email: '',
}

export function ForgotPasswordForm() {
  const hydrated = useHydrated()
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    disabled: !hydrated,
  })

  function onSubmit(values: ForgotPasswordFormValues) {
    console.log(values)
  }

  return (
    <Fragment>
      <form
        className="mt-6"
        noValidate
        autoComplete="off"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  autoComplete="off"
                  placeholder="you@example.com"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            disabled={!hydrated}
            size="lg"
            type="submit"
            className="w-full"
          >
            Send reset link
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link
          to="/signin"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </Fragment>
  )
}
