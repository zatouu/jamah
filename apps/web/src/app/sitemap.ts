import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/config'
import { localePath } from '@/lib/paths'
import { siteUrl } from '@/lib/site'

// Seules les pages publiées et validées figurent au sitemap.
// Les rubriques provisoires (noindex) en sont exclues.
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [l, `${siteUrl}${localePath(l)}`]))
  return locales.map((lang) => ({
    url: `${siteUrl}${localePath(lang)}`,
    changeFrequency: 'weekly',
    priority: 1,
    alternates: { languages },
  }))
}
