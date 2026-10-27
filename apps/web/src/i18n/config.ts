export const locales = ['fr', 'ar'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'

const rtlLocales: ReadonlySet<string> = new Set(['ar'])

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}

export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return rtlLocales.has(locale) ? 'rtl' : 'ltr'
}

/** Choisit la langue préférée à partir d'un en-tête Accept-Language. */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.find((p) => p.trim().startsWith('q='))
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 }
    })
    .sort((a, b) => b.q - a.q)
  return ranked.find((entry) => isLocale(entry.lang))?.lang as Locale | undefined ?? defaultLocale
}
