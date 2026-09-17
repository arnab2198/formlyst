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
import { signUpEmailStepSchema } from '@formlyst/utils'
import type { SignUpEmailStepValues } from '@formlyst/utils'

interface SignUpStepOneProps {
  defaultEmail: string
  onSubmitStep: (values: SignUpEmailStepValues) => void
}

export function SignUpStepOne({
  defaultEmail,
  onSubmitStep,
}: SignUpStepOneProps) {
  const hydrated = useHydrated()
  const form = useForm<SignUpEmailStepValues>({
    resolver: zodResolver(signUpEmailStepSchema),
    defaultValues: { email: defaultEmail },
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
