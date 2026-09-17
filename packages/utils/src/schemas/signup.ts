import { z } from 'zod'
import { emailSchema, passwordSchema } from './shared.js'

const NAME_MAX_LENGTH = 50
const OTP_LENGTH = 6

const nameSchema = z
  .string()
  .trim()
  .min(1, 'This field is required')
  .max(NAME_MAX_LENGTH, `Must be at most ${NAME_MAX_LENGTH} characters`)

const otpSchema = z
  .string()
  .trim()
  .length(OTP_LENGTH, `Enter the ${OTP_LENGTH}-digit code`)
  .regex(/^\d+$/, 'Code must contain only digits')

export const signUpEmailStepSchema = z.object({
  email: emailSchema,
})

export type SignUpEmailStepValues = z.infer<typeof signUpEmailStepSchema>

export const signUpOtpStepSchema = z.object({
  otp: otpSchema,
})

export type SignUpOtpStepValues = z.infer<typeof signUpOtpStepSchema>

export const signUpDetailsStepSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpDetailsStepValues = z.infer<typeof signUpDetailsStepSchema>
