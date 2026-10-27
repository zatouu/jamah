import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale, locales } from '@/i18n/config'
import { getDictionary } from '@/i18n/get-dictionary'
import { Breadcrumb, type Crumb } from '@/components/breadcrumb'
import { ArrowIcon } from '@/components/icons'
import { resolveSitePath, siteSections } from '@/lib/navigation'
import { localePath } from '@/lib/paths'
import { localizedAlternates } from '@/lib/site'

/**
 * Page provisoire des rubriques du sitemap (phase 1).
 * Non indexée : elle sera remplacée par les gabarits éditoriaux en phase 4.
 */
type Params = { params: Promise<{ lang: string; slug: string[] }> }

export const dynamicParams = false

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    Object.entries(siteSections).flatMap(([section, children]) => [
      { lang, slug: [section] },
      ...children.map((child) => ({ lang, slug: [section, child] })),
    ]),
  )
}

function resolve(lang: string, slug: string[]) {
  const target = resolveSitePath(slug)
  if (!isLocale(lang) || !target) return null
  const dict = getDictionary(lang)
  const section = dict.sections[target.section]
  const title = target.child ? (section.children as Record<string, string>)[target.child] : section.label
  return { lang, dict, target, section, title }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params
  const page = resolve(lang, slug)
  if (!page) return {}
  return {
    title: page.title,
    robots: { index: false, follow: true },
    alternates: localizedAlternates(page.lang, slug.join('/')),
  }
}

export default async function SectionPlaceholder({ params }: Params) {
  const { lang, slug } = await params
  const page = resolve(lang, slug)
  if (!page) notFound()
  const { dict, target, section, title } = page

  const crumbs: Crumb[] = [{ label: dict.home, href: localePath(page.lang) }]
  crumbs.push(target.child ? { label: section.label, href: localePath(page.lang, target.section) } : { label: section.label })
  if (target.child) crumbs.push({ label: title })

  const children = Object.entries(section.children as Record<string, string>)

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumb items={crumbs} label={dict.a11y.breadcrumb} />
      <header className="mt-10 max-w-3xl">
        <p className="inline-flex rounded-full bg-ochre-soft px-3 py-1 text-xs font-medium text-ochre">{dict.placeholder.eyebrow}</p>
        <h1 className="mt-5 font-display text-4xl text-forest-900 md:text-5xl rtl:leading-[1.4]">{title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">{target.child ? dict.placeholder.body : section.intro}</p>
      </header>

      {!target.child && (
        <section className="mt-12">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-forest-600 rtl:tracking-normal">{dict.placeholder.subsections}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {children.map(([childSlug, label]) => (
              <li key={childSlug}>
                <Link
                  href={localePath(page.lang, `${target.section}/${childSlug}`)}
                  className="group flex items-center justify-between gap-4 rounded-card border border-line bg-paper px-5 py-4 transition-colors hover:border-forest-600/40"
                >
                  <span className="text-ink">{label}</span>
                  <span className="text-forest-700 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    <ArrowIcon />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted">{dict.placeholder.body}</p>
        </section>
      )}

      <Link href={localePath(page.lang)} className="mt-12 inline-flex items-center gap-2 text-sm text-forest-700 hover:underline">
        <span className="rotate-180">
          <ArrowIcon />
        </span>
        {dict.placeholder.back}
      </Link>
    </div>
  )
}
