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
import { maskString, signUpOtpStepSchema } from '@formlyst/utils'
import type { SignUpOtpStepValues } from '@formlyst/utils'

const DEFAULT_VALUES: SignUpOtpStepValues = { otp: '' }
const OTP_LENGTH = 6

function maskEmailForDisplay(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) {
    return maskString(email)
  }

  return `${maskString(localPart, { visibleStart: 1, visibleEnd: 1 })}@${domain}`
}

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
                Enter the 6-digit code sent to {maskEmailForDisplay(email)}
              </FieldDescription>
              <InputOTP
                {...field}
                id={field.name}
                maxLength={OTP_LENGTH}
                pattern={REGEXP_ONLY_DIGITS}
                containerClassName="w-full"
                aria-invalid={fieldState.invalid}
                onComplete={() => {
                  void submitStep()
                }}
              >
                <InputOTPGroup className="w-full gap-2 has-aria-invalid:border-transparent has-aria-invalid:ring-0 *:data-[slot=input-otp-slot]:rounded-lg *:data-[slot=input-otp-slot]:border">
                  {Array.from({ length: OTP_LENGTH }, (_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="h-12 flex-1 text-lg font-semibold"
                      aria-invalid={fieldState.invalid}
                    />
                  ))}
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
