import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/config'
import { localePath } from '@/lib/paths'
import { siteUrl } from '@/lib/site'

// Seules les pages publiées figurent au sitemap.
// Les rubriques en préparation (noindex) en sont exclues jusqu'à publication de contenus validés.
const indexedPaths = ['', 'credits']

export default function sitemap(): MetadataRoute.Sitemap {
  return indexedPaths.flatMap((path) => {
    const languages = Object.fromEntries(locales.map((l) => [l, `${siteUrl}${localePath(l, path)}`]))
    return locales.map((lang) => ({
      url: `${siteUrl}${localePath(lang, path)}`,
      changeFrequency: path ? ('yearly' as const) : ('weekly' as const),
      priority: path ? 0.3 : 1,
      alternates: { languages },
    }))
  })
}
