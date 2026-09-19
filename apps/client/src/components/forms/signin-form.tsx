import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { PasswordInput } from '#/components/ui/password-input'
import { signIn } from '#/server/auth/auth.functions'
import { signInSchema } from '@formlyst/utils'
import type { SignInFormValues } from '@formlyst/utils'
import { useHydrated, useRouter, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Fragment } from 'react'

const DEFAULT_VALUES: SignInFormValues = {
  email: '',
  password: '',
  rememberMe: true,
}

export function SignInForm() {
  const hydrated = useHydrated()
  const router = useRouter()
  const signInFn = useServerFn(signIn)
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    disabled: !hydrated,
  })

  async function onSubmit(values: SignInFormValues) {
    try {
      await signInFn({
        data: { email: values.email, password: values.password },
      })
      router.navigate({ to: '/' })
    } catch {
      form.setError('root', {
        message: 'Invalid email or password',
      })
    }
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

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  {...field}
                  id={field.name}
                  autoComplete="off"
                  placeholder="Enter your password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="rememberMe"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Checkbox
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel className="font-normal" htmlFor={field.name}>
                  Remember me on this device
                </FieldLabel>
              </Field>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button
            disabled={!hydrated}
            size="lg"
            type="submit"
            className="w-full"
          >
            Sign in
          </Button>

          <FieldSeparator>Or continue with</FieldSeparator>

          <Button
            disabled={!hydrated}
            size="lg"
            type="button"
            variant="outline"
            className="w-full"
            asChild
          >
            <a href="/api/auth/google/start?intent=auth">
              <img
                src="/images/google-icon.svg"
                alt=""
                className="size-4"
                data-icon="inline-start"
              />
              Sign in with Google
            </a>
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </Fragment>
  )
}
