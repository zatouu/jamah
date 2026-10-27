import type { Metadata } from 'next'
import { locales, type Locale } from '@/i18n/config'
import { localePath } from './paths'

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

/** Balises canonical + hreflang pour une page disponible dans toutes les langues. */
export function localizedAlternates(locale: Locale, path = ''): Metadata['alternates'] {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, localePath(l, path)])),
      'x-default': localePath('fr', path),
    },
  }
}
