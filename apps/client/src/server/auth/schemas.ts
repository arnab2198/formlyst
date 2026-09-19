import { emailSchema } from '@formlyst/utils'
import { z } from 'zod'

const OTP_LENGTH = 6

const otpCodeSchema = z
  .string()
  .trim()
  .length(OTP_LENGTH, `Enter the ${OTP_LENGTH}-digit code`)
  .regex(/^\d+$/, 'Code must contain only digits')

export const emailOnlySchema = z.object({
  email: emailSchema,
})
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>

export const verifyOtpInputSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
})
export type VerifyOtpInput = z.infer<typeof verifyOtpInputSchema>

export const signinInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})
export type SigninInput = z.infer<typeof signinInputSchema>

export const resetPasswordInputSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(1, 'Password is required'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
})
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>

export const setPasswordInputSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
})
export type SetPasswordInput = z.infer<typeof setPasswordInputSchema>
