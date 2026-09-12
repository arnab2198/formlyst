import { z } from 'zod'
import { emailSchema } from '#/schemas/shared'

export const signUpSchema = z.object({
  email: emailSchema,
})

export type SignUpFormValues = z.infer<typeof signUpSchema>
