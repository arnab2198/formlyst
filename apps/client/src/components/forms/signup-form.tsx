import { zodResolver } from '@hookform/resolvers/zod'
import { useHydrated, Link } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '#/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { signUpSchema } from '@formlyst/utils'
import type { SignUpFormValues } from '@formlyst/utils'
import { Fragment } from 'react'

const DEFAULT_VALUES: SignUpFormValues = {
  email: '',
}

export function SignUpForm() {
  const hydrated = useHydrated()
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    disabled: !hydrated,
  })

  function onSubmit(values: SignUpFormValues) {
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
            Continue
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
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
