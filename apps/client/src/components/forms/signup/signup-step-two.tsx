import { zodResolver } from '@hookform/resolvers/zod'
import { useHydrated } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { Button } from '#/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '#/components/ui/input-otp'
import { signUpOtpStepSchema } from '@formlyst/utils'
import type { SignUpOtpStepValues } from '@formlyst/utils'

const DEFAULT_VALUES: SignUpOtpStepValues = { otp: '' }

interface SignUpStepTwoProps {
  email: string
  onSubmitStep: (values: SignUpOtpStepValues) => void
  onBack: () => void
}

export function SignUpStepTwo({
  email,
  onSubmitStep,
  onBack,
}: SignUpStepTwoProps) {
  const hydrated = useHydrated()
  const form = useForm<SignUpOtpStepValues>({
    resolver: zodResolver(signUpOtpStepSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    disabled: !hydrated,
  })

  const submitStep = form.handleSubmit(onSubmitStep)

  return (
    <form className="mt-6" noValidate autoComplete="off" onSubmit={submitStep}>
      <FieldGroup>
        <Controller
          name="otp"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Verification code</FieldLabel>
              <FieldDescription>
                Enter the 6-digit code sent to {email}
              </FieldDescription>
              <InputOTP
                {...field}
                id={field.name}
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                aria-invalid={fieldState.invalid}
                onComplete={() => {
                  void submitStep()
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
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
            Continue
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
