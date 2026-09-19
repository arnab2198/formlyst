import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { env } from '#/env'

export const csrfMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest()
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin')
    if (!origin || new URL(origin).origin !== env.APP_ORIGIN) {
      throw new Error('Origin check failed')
    }
  }
  return next()
})
