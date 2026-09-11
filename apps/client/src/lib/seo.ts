import { type AnyRouteMatch } from '@tanstack/react-router'
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
      title: 'TanStack Start Starter',
    },
  ],
  links: [
    {
      rel: 'stylesheet',
      href: appCss,
    },
  ],
}
