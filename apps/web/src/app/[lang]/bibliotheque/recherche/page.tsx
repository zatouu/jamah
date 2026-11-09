import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/get-dictionary'
import { Breadcrumb } from '@/components/breadcrumb'
import { SearchForm } from '@/components/search-form'
import { primaryNav } from '@/lib/navigation'
import { localePath } from '@/lib/paths'
import { localizedAlternates } from '@/lib/site'

/**
 * Page de recherche (phase 1) : conserve la requête et annonce honnêtement l'état du service.
 * Phase 2 : raccordement au moteur de sufi-knowledge (recherche hybride + RAG sourcé).
 */
type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string | string[] }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  return {
    title: getDictionary(lang).searchPage.title,
    robots: { index: false, follow: true },
    alternates: localizedAlternates(lang, 'bibliotheque/recherche'),
  }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const dict = getDictionary(lang)
  const raw = (await searchParams).q
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 200) ?? ''

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: dict.home, href: localePath(lang) },
          { label: dict.sections.bibliotheque.label, href: localePath(lang, 'bibliotheque') },
          { label: dict.sections.bibliotheque.children.recherche },
        ]}
        label={dict.a11y.breadcrumb}
      />
      <h1 className="mt-6 font-display text-3xl text-forest-900 md:text-[2.6rem]">{dict.searchPage.title}</h1>
      <div className="mt-6 max-w-3xl">
        <SearchForm locale={lang} dict={dict} defaultValue={query} withSuggestions />
      </div>

      <section aria-live="polite" className="mt-8 max-w-3xl rounded-card border border-line bg-paper p-6">
        {query && (
          <p className="text-sm text-muted">
            {dict.searchPage.yourQuery} : <q className="font-medium text-ink">{query}</q>
          </p>
        )}
        <h2 className="mt-2 font-display text-xl text-forest-900">{dict.searchPage.comingTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{dict.searchPage.comingBody}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ochre rtl:tracking-normal">{dict.searchPage.browse}</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {primaryNav.map((slug) => (
            <li key={slug}>
              <Link href={localePath(lang, slug)} className="inline-block rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink/80 hover:border-forest-600 hover:text-forest-800">
                {dict.sections[slug].label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
