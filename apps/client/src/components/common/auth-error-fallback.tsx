import { Button } from '#/components/ui/button'
import { env } from '#/env'
import { getErrorDetails } from '#/lib/error-details'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Link, useRouter } from '@tanstack/react-router'
import { ServerCrash } from 'lucide-react'

/**
 * Scoped error fallback for routes nested under `_auth` (signin, signup,
 * forgot-password, reset-password). `AuthLayout` already renders the Logo
 * and page chrome around `<Outlet/>` — this only replaces the outlet's own
 * content, so it must fit inside that narrow column rather than assume it
 * owns the full viewport like `DefaultError` does.
 */
export function AuthErrorFallback({ error, info }: ErrorComponentProps) {
  const router = useRouter()
  const isDev = env.NODE_ENV === 'development'
  const { message, stack } = getErrorDetails(error)

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ServerCrash className="size-6" strokeWidth={1.5} />
      </div>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        An unexpected error occurred. Try again, or head back home if the
        problem continues.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" variant="outline" asChild>
          <Link to="/">Go home</Link>
        </Button>
        <Button size="lg" type="button" onClick={() => router.invalidate()}>
          Try again
        </Button>
      </div>

      {isDev && (
        <div className="mt-8 w-full text-left">
          <p className="text-xs font-medium tracking-wide text-destructive uppercase">
            Dev-only error details
          </p>
          <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs whitespace-pre-wrap text-destructive">
            {message}
            {stack ? `\n\n${stack}` : ''}
            {info?.componentStack
              ? `\n\nComponent stack:${info.componentStack}`
              : ''}
          </pre>
        </div>
      )}
    </div>
  )
}
