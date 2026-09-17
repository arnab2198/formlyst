import { Link } from '@tanstack/react-router'
import { Fragment, useState } from 'react'
import { toast } from 'sonner'
import { SignUpStepOne } from './signup/signup-step-one'
import { SignUpStepThree } from './signup/signup-step-three'
import { SignUpStepTwo } from './signup/signup-step-two'
import type {
  SignUpDetailsStepValues,
  SignUpEmailStepValues,
  SignUpOtpStepValues,
} from '@formlyst/utils'

const TOTAL_STEPS = 3

type Step = 1 | 2 | 3

export function SignUpForm() {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')

  function handleEmailStep(values: SignUpEmailStepValues) {
    setEmail(values.email)
    setStep(2)
  }

  function handleOtpStep(_values: SignUpOtpStepValues) {
    setStep(3)
  }

  function handleDetailsStep(values: SignUpDetailsStepValues) {
    console.log({ email, ...values })
    toast.success('Registered successfully')
  }

  function goToPreviousStep() {
    setStep((current) => (current === 3 ? 2 : 1))
  }

  return (
    <Fragment>
      <p className="mt-2 text-xs font-medium text-muted-foreground">
        Step {step} of {TOTAL_STEPS}
      </p>

      {step === 1 && (
        <SignUpStepOne defaultEmail={email} onSubmitStep={handleEmailStep} />
      )}

      {step === 2 && (
        <SignUpStepTwo
          email={email}
          onSubmitStep={handleOtpStep}
          onBack={goToPreviousStep}
        />
      )}

      {step === 3 && (
        <SignUpStepThree
          onSubmitStep={handleDetailsStep}
          onBack={goToPreviousStep}
        />
      )}

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
