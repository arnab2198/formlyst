import { useRouteContext, useRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { createContext, startTransition, useEffect, useOptimistic, useRef } from 'react'
import {
  setThemeForClientNav,
  setThemeServerFn,
} from '#/server/theme/theme.functions'
import type { Theme } from '#/server/theme/schemas'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme: routeTheme } = useRouteContext({ from: '__root__' })
  const router = useRouter()
  const [theme, setOptimisticTheme] = useOptimistic(routeTheme)
  const requestRef = useRef(0)

  useEffect(() => {
    setThemeForClientNav(routeTheme)
  }, [routeTheme])

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const requestId = ++requestRef.current
    setThemeForClientNav(next)

    startTransition(async () => {
      setOptimisticTheme(next)
      await setThemeServerFn({ data: next })
      if (requestId === requestRef.current) {
        await router.invalidate()
      }
    })
  }

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>
}
