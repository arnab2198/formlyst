import { env } from '#/env'
import { cn } from '#/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img src="/images/logo.svg" alt="" className="h-8 w-auto" />
      <span className="text-lg font-semibold tracking-tight text-foreground">
        {env.VITE_APP_TITLE}
      </span>
    </div>
  )
}
