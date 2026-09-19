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
import { signupStart } from '#/server/auth/auth.functions'
import { signUpEmailStepSchema } from '@formlyst/utils'
import type { SignUpEmailStepValues } from '@formlyst/utils'

interface SignUpStepOneProps {
  defaultEmail: string
  onSubmitStep: (values: SignUpEmailStepValues, maskedEmail?: string) => void
}

export function SignUpStepOne({
  defaultEmail,
  onSubmitStep,
}: SignUpStepOneProps) {
  const hydrated = useHydrated()
  const signupStartFn = useServerFn(signupStart)
  const form = useForm<SignUpEmailStepValues>({
    resolver: zodResolver(signUpEmailStepSchema),
    defaultValues: { email: defaultEmail },
    mode: 'onTouched',
    reValidateMode: 'onChange',
    disabled: !hydrated,
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await signupStartFn({ data: values })
      if (result.nextStep === 'ALREADY_REGISTERED') {
        form.setError('email', {
          message: 'This email is already registered. Try signing in instead.',
        })
        return
      }
      onSubmitStep(values, result.maskedEmail)
    } catch {
      form.setError('email', {
        message: 'Something went wrong, please try again.',
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button disabled={!hydrated} size="lg" type="submit" className="w-full">
          Continue
        </Button>
      </FieldGroup>
    </form>
  )
}
