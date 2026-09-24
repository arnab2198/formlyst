import { zodResolver } from '@hookform/resolvers/zod'
import { useHydrated } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { toast } from 'sonner'
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
import { resendOtp, verifyOtp } from '#/server/auth/auth.functions'
import { maskString, signUpOtpStepSchema } from '@formlyst/utils'
import type { SignUpOtpStepValues } from '@formlyst/utils'

const DEFAULT_VALUES: SignUpOtpStepValues = { otp: '' }
const OTP_LENGTH = 6
// Mirrors OTP_ISSUE_COOLDOWN_SECONDS in the API's auth.service.ts.
const RESEND_COOLDOWN_SECONDS = 60

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
  const verifyOtpFn = useServerFn(verifyOtp)
  const resendOtpFn = useServerFn(resendOtp)
  // Starts running: step one just sent a code, so an immediate resend would only hit the server cooldown.
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const form = useForm<SignUpOtpStepValues>({
    resolver: zodResolver(signUpOtpStepSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    disabled: !hydrated,
  })

  useEffect(() => {
    if (resendCooldown <= 0) return
    const interval = setInterval(() => {
      setResendCooldown((current) => Math.max(current - 1, 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  const submitStep = form.handleSubmit(async (values) => {
    try {
      await verifyOtpFn({ data: { email, code: values.otp } })
      onSubmitStep(values)
    } catch {
      form.setError('otp', { message: 'Incorrect code — please try again.' })
      form.setValue('otp', '')
    }
  })

  async function handleResend() {
    try {
      await resendOtpFn({ data: { email } })
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
      toast.success('A new code has been sent to your email')
    } catch {
      toast.error('Could not resend the code, please try again shortly')
    }
  }

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

        <Button
          disabled={!hydrated || resendCooldown > 0}
          size="sm"
          type="button"
          variant="link"
          className="justify-self-start px-0"
          onClick={handleResend}
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : 'Resend code'}
        </Button>

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
