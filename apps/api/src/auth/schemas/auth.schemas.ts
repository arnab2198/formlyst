import { emailSchema, passwordSchema } from '@formlyst/utils';
import { z } from 'zod';

const NAME_MAX_LENGTH = 50;
const OTP_LENGTH = 6;

const nameSchema = z
  .string()
  .trim()
  .min(1, 'This field is required')
  .max(NAME_MAX_LENGTH, `Must be at most ${NAME_MAX_LENGTH} characters`);

const otpCodeSchema = z
  .string()
  .trim()
  .length(OTP_LENGTH, `Enter the ${OTP_LENGTH}-digit code`)
  .regex(/^\d+$/, 'Code must contain only digits');

export const signupStartSchema = z.object({
  email: emailSchema,
  captchaToken: z.string().optional(),
});
export type SignupStartDto = z.infer<typeof signupStartSchema>;

export const signupResendOtpSchema = z.object({
  email: emailSchema,
});
export type SignupResendOtpDto = z.infer<typeof signupResendOtpSchema>;

export const signupVerifyOtpSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
});
export type SignupVerifyOtpDto = z.infer<typeof signupVerifyOtpSchema>;

export const signupCompleteProfileSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type SignupCompleteProfileDto = z.infer<
  typeof signupCompleteProfileSchema
>;

export const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
export type SigninDto = z.infer<typeof signinSchema>;

export const passwordForgotSchema = z.object({
  email: emailSchema,
});
export type PasswordForgotDto = z.infer<typeof passwordForgotSchema>;

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type PasswordResetDto = z.infer<typeof passwordResetSchema>;

export const setPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type SetPasswordDto = z.infer<typeof setPasswordSchema>;

export const handoffExchangeSchema = z.object({
  code: z.string().min(1, 'Handoff code is required'),
});
export type HandoffExchangeDto = z.infer<typeof handoffExchangeSchema>;

export const googleAuthQuerySchema = z.object({
  intent: z.enum(['auth', 'link']).default('auth'),
  linkCode: z.string().optional(),
});
export type GoogleAuthQueryDto = z.infer<typeof googleAuthQuerySchema>;
