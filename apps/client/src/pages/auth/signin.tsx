import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { PasswordInput } from '#/components/ui/password-input'

export function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to keep building forms.
        </p>
      </div>

      <form className="mt-6" onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password-toggle">Password</FieldLabel>
            <PasswordInput
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>

          <Field orientation="horizontal">
            <Checkbox id="remember" defaultChecked />
            <FieldLabel className="font-normal" htmlFor="remember">
              Remember me on this device
            </FieldLabel>
          </Field>

          <Button size="lg" type="submit" className="w-full">
            Sign in
          </Button>

          <FieldSeparator>Or continue with</FieldSeparator>

          <Button size="lg" type="button" variant="outline" className="w-full">
            <img
              src="/images/google-icon.svg"
              alt=""
              className="size-4"
              data-icon="inline-start"
            />
            Sign in with Google
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <a
          href="/signup"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign up
        </a>
      </p>
    </>
  )
}
