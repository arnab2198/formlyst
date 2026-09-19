import type { AnyRouteMatch } from '@tanstack/react-router'
import { env } from '#/env'
import appCss from '../styles.css?url'

type SeoMeta = NonNullable<AnyRouteMatch['meta']>
type SeoLinks = NonNullable<AnyRouteMatch['links']>
type SeoScripts = NonNullable<AnyRouteMatch['headScripts']>

export interface SeoOptions {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'profile'
  noIndex?: boolean
  canonicalPath?: string
  jsonLd?: Record<string, unknown>
}

const SITE_NAME = env.VITE_APP_TITLE
const TITLE_SEPARATOR = ' | '
const DEFAULT_DESCRIPTION =
  'Formlyst is a modern form builder — create beautiful forms and collect responses effortlessly.'
const DEFAULT_IMAGE = '/images/logo.png'

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  if (!env.VITE_SITE_URL) return path
  return new URL(path, env.VITE_SITE_URL).toString()
}

export function seo(options: SeoOptions = {}): {
  meta: SeoMeta
  links: SeoLinks
  scripts: SeoScripts
} {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    keywords,
    image = DEFAULT_IMAGE,
    type = 'website',
    noIndex = false,
    canonicalPath,
    jsonLd,
  } = options

  const pageTitle = title ? `${title}${TITLE_SEPARATOR}${SITE_NAME}` : SITE_NAME
  const imageUrl = absoluteUrl(image)
  const canonicalUrl = canonicalPath ? absoluteUrl(canonicalPath) : undefined

  const meta: SeoMeta = [
    { title: pageTitle },
    { name: 'description', content: description },
    {
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow',
    },
    { name: 'author', content: SITE_NAME },
    ...(keywords?.length
      ? [{ name: 'keywords', content: keywords.join(', ') }]
      : []),

    { property: 'og:type', content: type },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: description },
    { property: 'og:image', content: imageUrl },
    { property: 'og:locale', content: 'en_US' },
    ...(canonicalUrl ? [{ property: 'og:url', content: canonicalUrl }] : []),

    { name: 'twitter:url', content: canonicalUrl },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ]

  const links: SeoLinks = [
    { rel: 'stylesheet', href: appCss },
    ...(canonicalUrl ? [{ rel: 'canonical', href: canonicalUrl }] : []),
  ]

  const scripts: SeoScripts = jsonLd
    ? [{ type: 'application/ld+json', children: JSON.stringify(jsonLd) }]
    : []

  return { meta, links, scripts }
}
