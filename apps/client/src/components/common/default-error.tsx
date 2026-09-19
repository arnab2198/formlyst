import { Logo } from '#/components/common/logo'
import { Button } from '#/components/ui/button'
import { env } from '#/env'
import { getErrorDetails } from '#/lib/error-details'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Link, useRouter } from '@tanstack/react-router'
import { ServerCrash } from 'lucide-react'

export function DefaultError({ error, info }: ErrorComponentProps) {
  const router = useRouter()
  const isDev = env.NODE_ENV === 'development'
  const { message, stack } = getErrorDetails(error)

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-destructive/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-accent/30 blur-3xl"
      />

      <Logo className="absolute top-6 left-6 sm:top-8 sm:left-10" />

      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ServerCrash className="size-8" strokeWidth={1.5} />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred. Try again, or head back home if the
          problem continues.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" variant="outline" asChild>
            <Link to="/">Go home</Link>
          </Button>
          <Button size="lg" type="button" onClick={() => router.invalidate()}>
            Try again
          </Button>
        </div>

        {isDev && (
          <div className="mt-10 w-full text-left">
            <p className="text-xs font-medium tracking-wide text-destructive uppercase">
              Dev-only error details
            </p>
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-xs whitespace-pre-wrap text-destructive">
              {message}
              {stack ? `\n\n${stack}` : ''}
              {info?.componentStack
                ? `\n\nComponent stack:${info.componentStack}`
                : ''}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
