import { z } from 'zod'
import { emailSchema } from '#/schemas/shared'

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
