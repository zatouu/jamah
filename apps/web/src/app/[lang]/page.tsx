import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/get-dictionary'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import { SearchForm } from '@/components/search-form'
import { ArrowIcon } from '@/components/icons'
import { localePath } from '@/lib/paths'

type Params = { params: Promise<{ lang: string }> }

export default async function HomePage({ params }: Params) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const dict = getDictionary(lang)

  return (
    <>
      <Hero locale={lang} dict={dict} />
      <Paths locale={lang} dict={dict} />
      <ChainAndGuide locale={lang} dict={dict} />
      <LibraryPrinciple locale={lang} dict={dict} />
      <Updates locale={lang} dict={dict} />
    </>
  )
}

type SectionProps = { locale: Locale; dict: Dictionary }

function SectionHeading({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <div className="max-w-2xl space-y-3">
      {eyebrow && <p className="text-xs font-medium uppercase tracking-[0.2em] text-forest-600 rtl:tracking-normal">{eyebrow}</p>}
      <h2 className="font-display text-3xl text-forest-900 md:text-4xl">{title}</h2>
      {lead && <p className="text-lg leading-relaxed text-muted">{lead}</p>}
    </div>
  )
}

function GeometricMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="0.6">
      <rect x="45" y="45" width="110" height="110" />
      <rect x="45" y="45" width="110" height="110" transform="rotate(45 100 100)" />
      <circle cx="100" cy="100" r="78" />
      <circle cx="100" cy="100" r="40" />
      <rect x="72" y="72" width="56" height="56" transform="rotate(45 100 100)" />
    </svg>
  )
}

function Hero({ locale, dict }: SectionProps) {
  const t = dict.homePage
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,var(--color-forest-50),transparent_70%)]" />
      <GeometricMotif className="pointer-events-none absolute -end-24 -top-16 size-[34rem] text-forest-800/[0.07] md:-end-10" />
      <div className="container-page relative pb-20 pt-16 md:pb-28 md:pt-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-forest-100 bg-paper/70 px-3 py-1 text-xs font-medium text-forest-700">
          <span className="size-1.5 rounded-full bg-forest-600" aria-hidden />
          {t.eyebrow}
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-[2.5rem] leading-[1.1] text-forest-900 md:text-6xl md:leading-[1.05] rtl:leading-[1.4]">
          {t.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{t.lead}</p>
        <div className="mt-10 max-w-2xl">
          <SearchForm locale={locale} dict={dict} withSuggestions />
        </div>
      </div>
    </section>
  )
}

function Paths({ locale, dict }: SectionProps) {
  const t = dict.homePage.paths
  const fmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'fr', { minimumIntegerDigits: 2 })
  return (
    <section className="container-page py-16 md:py-20">
      <SectionHeading title={t.title} />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((item, i) => (
          <li key={item.href}>
            <Link
              href={localePath(locale, item.href)}
              className="group flex h-full flex-col rounded-card border border-line bg-paper p-6 transition duration-300 hover:-translate-y-0.5 hover:border-forest-600/40 hover:shadow-[0_18px_40px_-24px_rgb(15_61_46/0.35)]"
            >
              <span className="text-sm tabular-nums text-forest-600">{fmt.format(i + 1)}</span>
              <span className="mt-6 font-display text-xl text-forest-900">{item.title}</span>
              <span className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-muted">{item.body}</span>
              <span className="mt-6 text-forest-700 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                <ArrowIcon />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ChainAndGuide({ locale, dict }: SectionProps) {
  const { chain, guide } = dict.homePage
  return (
    <section className="border-y border-line bg-paper">
      <div className="container-page grid gap-14 py-16 md:py-24 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <SectionHeading title={chain.title} lead={chain.lead} />
          <ol className="relative mt-10 space-y-1 border-s border-forest-100 ps-6">
            {chain.items.map((item, i) => {
              const isGuide = i === chain.items.length - 1
              return (
                <li key={item.href} className="relative">
                  <span
                    aria-hidden
                    className={`absolute -start-[1.95rem] top-1/2 size-3 -translate-y-1/2 rounded-full border-2 ${
                      isGuide ? 'border-forest-800 bg-forest-800' : 'border-forest-600 bg-paper'
                    }`}
                  />
                  <Link
                    href={localePath(locale, item.href)}
                    className="flex items-baseline justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-forest-50"
                  >
                    <span className="font-display text-lg text-forest-900">{item.title}</span>
                    <span className="text-sm text-muted">{item.body}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>

        <article className="relative flex flex-col overflow-hidden rounded-[1.5rem] bg-forest-900 p-8 text-ivory md:p-12">
          <GeometricMotif className="pointer-events-none absolute -bottom-24 -end-24 size-80 text-ivory/[0.06]" />
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-forest-100/80 rtl:tracking-normal">{guide.eyebrow}</p>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">{guide.title}</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ivory/85">{guide.body}</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {guide.links.map((label) => (
              <li key={label} className="rounded-full border border-ivory/20 px-3.5 py-1.5 text-sm text-ivory/90">
                {label}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-10">
            <Link
              href={localePath(locale, 'maitres/cheikh-ousmane-mbow')}
              className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-sm font-medium text-forest-900 transition-colors hover:bg-forest-50"
            >
              {guide.cta}
              <ArrowIcon />
            </Link>
            <p className="text-xs text-ivory/60">{guide.note}</p>
          </div>
        </article>
      </div>
    </section>
  )
}

function LibraryPrinciple({ locale, dict }: SectionProps) {
  const t = dict.homePage.library
  const rows = [
    { key: 'original', label: t.layers.original, content: <p className="text-arabic text-forest-900" lang="ar">{t.sample.original}</p> },
    { key: 'transliteration', label: t.layers.transliteration, content: <p className="italic text-ink/80" lang="ar-Latn" dir="ltr">{t.sample.transliteration}</p> },
    { key: 'translation', label: t.layers.translation, content: <p className="text-ink" lang="fr" dir="ltr">{t.sample.translation}</p> },
    { key: 'commentary', label: t.layers.commentary, content: <p className="text-sm text-muted">{t.sample.commentary}</p> },
  ]
  return (
    <section className="container-page grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div className="space-y-8">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
        <Link
          href={localePath(locale, 'bibliotheque')}
          className="inline-flex items-center gap-2 rounded-full border border-forest-800 px-5 py-2.5 text-sm font-medium text-forest-800 transition-colors hover:bg-forest-800 hover:text-ivory"
        >
          {t.cta}
          <ArrowIcon />
        </Link>
      </div>

      <figure className="rounded-[1.5rem] border border-line bg-paper p-2 shadow-[0_24px_60px_-40px_rgb(15_61_46/0.4)]">
        <dl className="divide-y divide-line">
          {rows.map((row) => (
            <div key={row.key} className="grid gap-2 px-5 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="pt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted rtl:tracking-normal">
                {row.key === 'commentary' ? (
                  <span className="rounded-full bg-ochre-soft px-2 py-0.5 text-ochre">{row.label}</span>
                ) : (
                  row.label
                )}
              </dt>
              <dd>{row.content}</dd>
            </div>
          ))}
        </dl>
        <figcaption className="px-5 pb-3 pt-1 text-xs text-muted">{t.reference}</figcaption>
      </figure>
    </section>
  )
}

function Updates({ locale, dict }: SectionProps) {
  const t = dict.homePage
  const blocks = [
    { title: t.news.title, empty: t.news.empty, href: 'actualites/articles' },
    { title: t.events.title, empty: t.events.empty, href: 'actualites/evenements' },
  ]
  return (
    <section className="container-page grid gap-6 pb-8 md:grid-cols-2">
      {blocks.map((block) => (
        <div key={block.href} className="rounded-card border border-line bg-paper/60 p-6 md:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl text-forest-900">{block.title}</h2>
            <Link href={localePath(locale, block.href)} className="text-sm text-forest-700 hover:underline">
              {t.seeAll}
            </Link>
          </div>
          <p className="mt-6 rounded-xl border border-dashed border-line px-5 py-8 text-center text-sm text-muted">{block.empty}</p>
        </div>
      ))}
    </section>
  )
}
