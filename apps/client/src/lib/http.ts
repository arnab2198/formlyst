import '@tanstack/react-start/server-only'
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { env } from '#/env'

interface ApiSuccessResponse<T> {
  statusCode: number
  message: string | null
  success: true
  data: T
}

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

/**
 * Server-only client for the private NestJS API — never import this from a
 * component or route `component`, only from `src/server/**` handlers, or the
 * internal API key would end up reachable from the browser bundle.
 */
export const Http = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'content-type': 'application/json',
    'x-internal-api-key': env.INTERNAL_API_KEY,
  },
})

Http.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const status = error.response?.status ?? 500
    const message = error.response?.data.message ?? 'Request failed'
    throw new HttpError(status, message)
  }
  throw error instanceof Error ? error : new Error('Request failed')
})

/** Unwraps this codebase's `{ statusCode, message, data, success }` envelope. */
export function unwrap<T>(response: AxiosResponse<ApiSuccessResponse<T>>): T {
  return response.data.data
}
