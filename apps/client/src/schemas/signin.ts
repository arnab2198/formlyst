import { z } from 'zod'
import { emailSchema, passwordSchema } from '#/schemas/shared'

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean(),
})

export type SignInFormValues = z.infer<typeof signInSchema>
