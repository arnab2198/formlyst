import { ClientOnly } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Logo } from '#/components/common/logo'
import { ModeToggle, ModeToggleSkeleton } from '#/components/common/mode-toggle'
import { env } from '#/env'

const MODE_TOGGLE_PLACEMENT =
  'absolute top-6 right-6 z-10 sm:top-8 sm:right-10 lg:right-16'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      <ClientOnly
        fallback={<ModeToggleSkeleton className={MODE_TOGGLE_PLACEMENT} />}
      >
        <ModeToggle className={MODE_TOGGLE_PLACEMENT} />
      </ClientOnly>

      <div className="flex flex-col gap-10 px-6 py-8 sm:px-10 lg:px-16">
        <Logo />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30 lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-12 lg:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-12 left-12 size-28 text-foreground/15"
          style={{
            backgroundImage:
              'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-20 right-20 size-24 rounded-full border border-primary/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-accent/40 blur-3xl"
        />

        <h2 className="relative max-w-md text-center text-3xl font-bold text-balance text-foreground">
          Build Beautiful Forms And Collect Responses With{' '}
          <span className="text-primary">{env.VITE_APP_TITLE}</span>!
        </h2>
        <img
          src="/images/auth-illustration.svg"
          alt="Illustration of a person filling out an online form"
          className="relative w-full max-w-md drop-shadow-xl"
        />
      </div>
    </div>
  )
}
