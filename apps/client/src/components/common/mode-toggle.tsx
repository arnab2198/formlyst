import { Moon, Sun } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useTheme } from '#/hooks/use-theme'
import { cn } from '#/lib/utils'
import { Skeleton } from '../ui/skeleton'

export function ModeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('relative', className)}
      onClick={toggleTheme}
    >
      <Sun className="scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
      <span className="sr-only">
        {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      </span>
    </Button>
  )
}

export function ModeToggleSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton className={cn('size-7 rounded-md', className)}>
      <span className="sr-only">Loading theme switcher</span>
    </Skeleton>
  )
}
