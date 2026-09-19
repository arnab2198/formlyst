import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

interface Bucket {
  count: number
  resetAt: number
}

// In-memory, best-effort — a UX nicety only. The backend's rate limiter
// (backend doc §10) is the one that's actually load-bearing, since this
// server function is directly callable and this check resets on redeploy.
const buckets = new Map<string, Bucket>()

function consume(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  bucket.count += 1
  return bucket.count <= max
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

export function rateLimitMiddleware(options: {
  key: string
  max: number
  windowMs: number
}) {
  return createMiddleware({ type: 'function' }).server(async ({ next }) => {
    const request = getRequest()
    const ip = getClientIp(request)
    const allowed = consume(`${options.key}:${ip}`, options.max, options.windowMs)
    if (!allowed) {
      throw new Error('Too many requests, please try again later')
    }
    return next()
  })
}
