import { z } from 'zod'

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

const EMAIL_MAX_LENGTH = 254

const PASSWORD_MIN_LENGTH = 12
const PASSWORD_MAX_LENGTH = 32
const PASSWORD_LOWERCASE_REGEX = /[a-z]/
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/
const PASSWORD_NUMBER_REGEX = /[0-9]/
const PASSWORD_SPECIAL_CHARACTER_REGEX = /[^A-Za-z0-9]/

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(EMAIL_MAX_LENGTH, `Email must be at most ${EMAIL_MAX_LENGTH} characters`)
  .regex(EMAIL_REGEX, 'Enter a valid email address')

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
  )
  .regex(PASSWORD_LOWERCASE_REGEX, 'Password must include a lowercase letter')
  .regex(PASSWORD_UPPERCASE_REGEX, 'Password must include an uppercase letter')
  .regex(PASSWORD_NUMBER_REGEX, 'Password must include a number')
  .regex(
    PASSWORD_SPECIAL_CHARACTER_REGEX,
    'Password must include a special character',
  )
