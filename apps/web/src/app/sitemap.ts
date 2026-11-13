import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/config'
import { getSiteContent } from '@/content/site-content'
import { localePath } from '@/lib/paths'
import { siteUrl } from '@/lib/site'

// Seules les pages publiées figurent au sitemap : accueil, crédits et rubriques dont le
// contenu est publié dans le CMS pour la langue concernée. Les autres restent `noindex`.
const staticPaths = ['', 'credits']

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contents = await Promise.all(locales.map((lang) => getSiteContent(lang)))
  const byLang = new Map(contents.map((c) => [c.locale, c.published]))
  const cmsPaths = [...new Set(contents.flatMap((c) => Object.keys(c.published)))]

  return [...staticPaths, ...cmsPaths].flatMap((path) => {
    const available = locales.filter((l) => staticPaths.includes(path) || byLang.get(l)?.[path])
    const languages = Object.fromEntries(available.map((l) => [l, `${siteUrl}${localePath(l, path)}`]))
    return available.map((lang) => {
      const updatedAt = byLang.get(lang)?.[path]?.updatedAt
      return {
        url: `${siteUrl}${localePath(lang, path)}`,
        ...(updatedAt ? { lastModified: new Date(updatedAt) } : {}),
        changeFrequency: path ? ('monthly' as const) : ('weekly' as const),
        priority: path === '' ? 1 : path === 'credits' ? 0.3 : 0.7,
        alternates: { languages },
      }
    })
  })
}
