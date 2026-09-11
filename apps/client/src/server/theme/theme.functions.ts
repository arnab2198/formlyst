import { createIsomorphicFn, createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import type { Theme } from './schemas'
import { themeSchema } from './schemas'

const THEME_COOKIE_KEY = 'theme'
const DEFAULT_THEME: Theme = 'light'

let clientThemeCache: Theme = DEFAULT_THEME

export function getThemeForClientNav(): Theme {
  return clientThemeCache
}

export function setThemeForClientNav(theme: Theme): void {
  clientThemeCache = theme
}

export const getThemeServerFn = createServerFn().handler((): Theme => {
  const result = themeSchema.safeParse(getCookie(THEME_COOKIE_KEY))
  return result.success ? result.data : DEFAULT_THEME
})

export const setThemeServerFn = createServerFn({ method: 'POST' })
  .validator(themeSchema)
  .handler(async ({ data }) => {
    setCookie(THEME_COOKIE_KEY, data, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  })

export const getInitialTheme = createIsomorphicFn()
  .server(() => getThemeServerFn())
  .client(() => getThemeForClientNav())
