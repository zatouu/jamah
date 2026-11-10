import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/get-dictionary'
import { Breadcrumb } from '@/components/breadcrumb'
import { SearchForm } from '@/components/search-form'
import { SourceNatureBadge } from '@/components/rubric/rubric-parts'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import { primaryNav } from '@/lib/navigation'
import { localePath } from '@/lib/paths'
import { hitKindLabel, safeHitHref, searchLibrary, splitHighlights, type SearchHit, type SearchResult } from '@/lib/search'
import { localizedAlternates } from '@/lib/site'

/**
 * Recherche hybride (mot à mot + sens) via le Search Service.
 * Si le service est absent ou indisponible, la page l'annonce et propose de parcourir les rubriques.
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
  const result = await searchLibrary(query)

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

      <section aria-live="polite" className="mt-8 max-w-3xl">
        {result ? (
          <SearchResults result={result} dict={dict} />
        ) : (
          <div className="rounded-card bg-paper p-6 shadow-soft ring-1 ring-line/60">
            {query && (
              <p className="text-sm text-muted">
                {dict.searchPage.yourQuery} : <q className="font-medium text-ink">{query}</q>
              </p>
            )}
            <h2 className="mt-2 font-display text-xl text-forest-900">{dict.searchPage.comingTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{dict.searchPage.comingBody}</p>
          </div>
        )}
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

function SearchResults({ result, dict }: { result: SearchResult; dict: Dictionary }) {
  const t = dict.searchPage
  if (!result.hits.length) {
    return (
      <div className="rounded-card bg-paper p-6 shadow-soft ring-1 ring-line/60">
        <h2 className="font-display text-xl text-forest-900">{t.noResultsTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t.noResultsBody}</p>
        <p className="mt-3 text-xs text-muted">{t.exactHint}</p>
      </div>
    )
  }
  return (
    <>
      <p className="text-sm text-muted">{t.results.replace('{n}', String(result.total))}</p>
      <ol className="mt-4 space-y-3">
        {result.hits.map((hit) => (
          <li key={hit.id}>
            <ResultCard hit={hit} dict={dict} />
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted">{t.exactHint}</p>
    </>
  )
}

function ResultCard({ hit, dict }: { hit: SearchHit; dict: Dictionary }) {
  const href = safeHitHref(hit.url, hit.anchor)
  const isArabic = hit.lang === 'ar'
  const title = <span className="font-display text-lg text-forest-900">{hit.title}</span>
  return (
    <article className="rounded-card bg-paper p-5 shadow-soft ring-1 ring-line/60 transition hover:ring-forest-600/30">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-forest-800">{dict.contentKinds[hitKindLabel[hit.kind]]}</span>
        {hit.source_nature && <SourceNatureBadge nature={hit.source_nature} dict={dict} />}
        {hit.match === 'semantic' && <span className="rounded-full bg-ochre-soft px-2.5 py-0.5 text-ochre">{dict.searchPage.semanticMatch}</span>}
      </div>
      <h3 className="mt-2" lang={hit.lang} dir={isArabic ? 'rtl' : undefined}>
        {href ? (
          href.startsWith('/') ? <Link href={href} className="hover:underline">{title}</Link> : <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">{title}</a>
        ) : title}
      </h3>
      {(hit.author || hit.work) && <p className="mt-1 text-sm text-muted">{[hit.author, hit.work].filter(Boolean).join(' · ')}</p>}
      <p className={`mt-2 leading-relaxed text-ink/85 ${isArabic ? 'font-arabic text-lg' : 'text-sm'}`} lang={hit.lang} dir={isArabic ? 'rtl' : undefined}>
        {splitHighlights(hit.snippet).map((part, i) =>
          part.mark ? <mark key={i} className="rounded bg-ochre-soft px-0.5 text-ink">{part.text}</mark> : <span key={i}>{part.text}</span>,
        )}
      </p>
      {hit.refs.length > 0 && <p className="mt-2 text-xs text-muted" dir="auto">{hit.refs.join(' · ')}</p>}
    </article>
  )
}
