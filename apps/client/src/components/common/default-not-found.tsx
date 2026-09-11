import { Link } from '@tanstack/react-router'
import type { NotFoundRouteProps } from '@tanstack/react-router'
import { FileQuestion } from 'lucide-react'
import { Logo } from '#/components/common/logo'
import { Button } from '#/components/ui/button'

function getNotFoundMessage(data: unknown) {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message
  }
  return undefined
}

export function DefaultNotFound({ data }: NotFoundRouteProps) {
  const message = getNotFoundMessage(data)

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-accent/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 right-12 hidden size-28 text-foreground/10 sm:block"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />

      <Logo className="absolute top-6 left-6 sm:top-8 sm:left-10" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative flex items-center justify-center">
          <span className="bg-gradient-to-b from-foreground/15 to-foreground/0 bg-clip-text text-[7rem] leading-none font-bold tracking-tight text-transparent sm:text-[9rem]">
            404
          </span>
          <FileQuestion
            className="absolute size-12 text-primary sm:size-14"
            strokeWidth={1.5}
          />
        </div>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {message ??
            "The page you're looking for doesn't exist or may have been moved."}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            variant="outline"
            type="button"
            onClick={() => window.history.back()}
          >
            Go back
          </Button>
          <Button size="lg" asChild>
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
