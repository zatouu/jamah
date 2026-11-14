export const locales = ['fr', 'ar', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'

/** Nom de chaque langue dans sa propre langue (sélecteur de langue). */
export const localeNames: Record<Locale, string> = { fr: 'Français', ar: 'العربية', en: 'English' }

/** Libellé court affiché dans l'en-tête. */
export const localeShortNames: Record<Locale, string> = { fr: 'FR', ar: 'ع', en: 'EN' }

/** Locale BCP 47 pour Intl (chiffres arabes orientaux en arabe). */
export function intlLocale(locale: Locale): string {
  return locale === 'ar' ? 'ar-EG' : locale
}

/** Locale Open Graph. */
export const ogLocales: Record<Locale, string> = { fr: 'fr_FR', ar: 'ar_AR', en: 'en_US' }

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
