import { z } from 'zod'
import { emailSchema } from './shared.js'

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
