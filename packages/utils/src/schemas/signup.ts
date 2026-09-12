import { z } from 'zod'
import { emailSchema } from './shared.js'

export const signUpSchema = z.object({
  email: emailSchema,
})

export type SignUpFormValues = z.infer<typeof signUpSchema>
