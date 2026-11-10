import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import { localePath } from './paths'
import { siteUrl } from './site'

/** Données structurées du site (Organization + WebSite). SearchAction sera ajoutée quand la recherche sera active. */
export function siteJsonLd(locale: Locale, dict: Dictionary) {
  const home = `${siteUrl}${localePath(locale)}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Jamah Sayroul Abad',
        alternateName: 'جماعة سير العبيد',
        url: siteUrl,
        description: dict.meta.description,
      },
      {
        '@type': 'WebSite',
        '@id': `${home}#website`,
        url: home,
        name: dict.meta.siteName,
        inLanguage: locale,
        publisher: { '@id': `${siteUrl}/#organization` },
      },
    ],
  }
}

/** Sérialise sans permettre la fermeture prématurée de la balise <script>. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
