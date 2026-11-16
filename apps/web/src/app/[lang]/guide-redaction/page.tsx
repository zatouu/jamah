import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/breadcrumb'
import { Markdown } from '@/components/markdown'
import { getDictionary } from '@/i18n/get-dictionary'
import { localePath } from '@/lib/paths'

/**
 * Guide des rédacteurs (français uniquement), lu depuis `src/content/guide-redaction.md` : on partage le lien
 * au lieu du fichier. Hors menu, hors sitemap et `noindex`. Le fichier est inclus dans le build standalone
 * par `outputFileTracingIncludes` (next.config.ts) pour les régénérations à l'exécution.
 */
const GUIDE = path.join(process.cwd(), 'src/content/guide-redaction.md')

type Params = { params: Promise<{ lang: string }> }

export function generateStaticParams() {
  return [{ lang: 'fr' }]
}

async function loadGuide() {
  const source = await readFile(GUIDE, 'utf8')
  const title = /^#\s+(.+)$/m.exec(source)?.[1]?.trim() ?? 'Guide de rédaction'
  return { title, body: source.replace(/^#\s+.+$/m, '') }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params
  if (lang !== 'fr') return {}
  return { title: (await loadGuide()).title, robots: { index: false, follow: false } }
}

export default async function GuidePage({ params }: Params) {
  const { lang } = await params
  if (lang !== 'fr') notFound()
  const dict = getDictionary(lang)
  const { title, body } = await loadGuide()

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumb items={[{ label: dict.home, href: localePath(lang) }, { label: title }]} label={dict.a11y.breadcrumb} />
      <h1 className="mt-10 font-display text-3xl text-forest-900 md:text-5xl">{title}</h1>
      <Markdown source={body} breaks={false} className="mt-8 max-w-4xl" />
    </div>
  )
}
