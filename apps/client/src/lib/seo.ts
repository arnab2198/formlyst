import { type AnyRouteMatch } from '@tanstack/react-router'
import { env } from '#/env'
import appCss from '../styles.css?url'

interface Seo {
  links?: AnyRouteMatch['links']
  scripts?: AnyRouteMatch['headScripts']
  meta?: AnyRouteMatch['meta']
  styles?: AnyRouteMatch['styles']
}

export const seo: Seo = {
  meta: [
    {
      charSet: 'utf-8',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      title: env.VITE_APP_TITLE,
    },
  ],
  links: [
    {
      rel: 'stylesheet',
      href: appCss,
    },
  ],
}
