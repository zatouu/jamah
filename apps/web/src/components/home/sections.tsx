import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import type { MediaKey } from '@/content/media'
import { ArrowIcon } from '@/components/icons'
import { Photo, PhotoSlot } from '@/components/photo'
import { SearchForm } from '@/components/search-form'
import { nextAnnualDate } from '@/lib/calendar'
import { localePath } from '@/lib/paths'

type SectionProps = { locale: Locale; dict: Dictionary }

const eyebrowClass = 'text-xs font-medium uppercase tracking-[0.2em] text-forest-600 rtl:tracking-normal'

function SectionHeading({ eyebrow, title, lead, light }: { eyebrow?: string; title: string; lead?: string; light?: boolean }) {
  return (
    <div className="max-w-2xl space-y-3">
      {eyebrow && <p className={light ? `${eyebrowClass} !text-forest-100/80` : eyebrowClass}>{eyebrow}</p>}
      <h2 className={`font-display text-3xl md:text-4xl rtl:leading-[1.4] ${light ? 'text-ivory' : 'text-forest-900'}`}>{title}</h2>
      {lead && <p className={`text-lg leading-relaxed ${light ? 'text-ivory/75' : 'text-muted'}`}>{lead}</p>}
    </div>
  )
}

function Ornament({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" aria-hidden className={`h-3 w-28 ${className}`} fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0 6h46M74 6h46" />
      <rect x="54" y="0" width="12" height="12" transform="rotate(45 60 6)" />
      <circle cx="60" cy="6" r="1.6" fill="currentColor" />
    </svg>
  )
}

/* 1. Accueil chaleureux : grande photo, salutation, appels à l'action, recherche */
export function Hero({ locale, dict }: SectionProps) {
  const t = dict.homePage
  return (
    <section className="relative">
      <div className="relative isolate min-h-[34rem] overflow-hidden md:min-h-[42rem]">
        <Photo id="khaima" locale={locale} priority className="absolute inset-0 -z-10" imgClassName="scale-105" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-900/90 via-forest-900/45 to-forest-900/10" />
        <div className="container-page flex min-h-[34rem] flex-col justify-end pb-32 pt-24 md:min-h-[42rem] md:pb-40">
          <p className="font-display text-lg italic text-ivory/85 rtl:not-italic">{t.greeting}</p>
          <h1 className="mt-3 max-w-3xl font-display text-[2.6rem] leading-[1.08] text-ivory md:text-7xl rtl:leading-[1.35]">{t.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory/85 md:text-xl">{t.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={localePath(locale, 'jamah')} className="inline-flex items-center gap-2 rounded-full bg-ivory px-6 py-3 text-sm font-medium text-forest-900 transition-colors hover:bg-forest-50">
              {t.ctaPrimary}
              <ArrowIcon />
            </Link>
            <Link href={localePath(locale, 'bibliotheque')} className="inline-flex items-center gap-2 rounded-full border border-ivory/40 px-6 py-3 text-sm font-medium text-ivory backdrop-blur-sm transition-colors hover:bg-ivory/10">
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
      <div className="container-page relative -mt-20 md:-mt-24">
        <div className="rounded-[1.5rem] border border-line bg-paper p-6 shadow-[0_30px_60px_-30px_rgb(15_61_46/0.45)] md:p-8">
          <p className="mb-4 font-display text-xl text-forest-900">{t.searchTitle}</p>
          <SearchForm locale={locale} dict={dict} withSuggestions />
        </div>
      </div>
    </section>
  )
}

/* 2. Parole du maître (source citée) */
export function QuoteBand({ dict }: SectionProps) {
  const q = dict.homePage.quote
  return (
    <section className="container-page py-20 text-center md:py-28">
      <Ornament className="mx-auto text-ochre" />
      <blockquote className="mx-auto mt-8 max-w-3xl">
        <p lang="fr" dir="ltr" className="font-display text-2xl leading-snug text-forest-900 md:text-[2.1rem] md:leading-[1.35]">
          {q.text}
        </p>
        <footer className="mt-8 space-y-1">
          <cite className="block font-display text-lg not-italic text-forest-800">{q.author}</cite>
          <span className="block text-sm text-muted">{q.context}</span>
          <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-muted underline decoration-line underline-offset-4 hover:text-forest-700">
            {q.sourceLabel}
          </a>
          {q.note && <span className="block text-xs text-muted">{q.note}</span>}
        </footer>
      </blockquote>
    </section>
  )
}

/* 3. Vie de la communauté */
const lifeImages: (MediaKey | null)[] = ['tasbih', null, 'enseignement', 'dunes']

export function CommunityLife({ locale, dict }: SectionProps) {
  const t = dict.homePage.life
  return (
    <section className="container-page pb-20 md:pb-28">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((item, i) => {
          const image = lifeImages[i]
          return (
            <li key={item.title}>
              <Link href={localePath(locale, item.href)} className="group block">
                <div className="overflow-hidden rounded-card">
                  {image ? (
                    <Photo id={image} locale={locale} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/5]" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <PhotoSlot label={t.hadraSlot} className="aspect-[4/5]" />
                  )}
                </div>
                <h3 className="mt-4 font-display text-xl text-forest-900 group-hover:text-forest-700">{item.title}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* 4. Rendez-vous annuels, avec compte à rebours jusqu'au Gamou du 20 avril */
export function Gatherings({ locale, dict }: SectionProps) {
  const t = dict.homePage.gatherings
  const { date, daysLeft } = nextAnnualDate(4, 20)
  const fmtDate = new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'fr', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  const fmtNum = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'fr')
  return (
    <section className="relative isolate overflow-hidden bg-forest-900 text-ivory">
      <Photo id="dunes" locale={locale} credit={false} className="absolute inset-0 -z-10 opacity-20" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-900/70 to-forest-900" />
      <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div className="space-y-8">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} light />
          <div className="rounded-[1.5rem] border border-ivory/15 bg-ivory/[0.06] p-7 backdrop-blur-sm">
            <p className="text-sm text-ivory/70">{t.countdownLabel}</p>
            <p className="mt-2 font-display text-5xl tabular-nums md:text-6xl">
              {daysLeft === 0 ? t.today : t.daysLeft.replace('{n}', fmtNum.format(daysLeft))}
            </p>
            <p className="mt-2 text-sm text-ivory/70">{fmtDate.format(date)}</p>
          </div>
        </div>
        <ul className="space-y-4 self-end">
          {t.items.map((item) => (
            <li key={item.title} className="rounded-[1.25rem] border border-ivory/10 bg-forest-800/60 p-6 md:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl">{item.title}</h3>
                <span className="text-sm text-forest-100/80">{item.place}</span>
              </div>
              <p className="mt-3 leading-relaxed text-ivory/80">{item.body}</p>
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs text-ivory/50 underline underline-offset-4 hover:text-ivory/80">
                {item.sourceLabel}
              </a>
            </li>
          ))}
          <li className="px-1 text-xs text-ivory/50">{t.note}</li>
        </ul>
      </div>
    </section>
  )
}

/* 5. Notre guide */
export function Guide({ locale, dict }: SectionProps) {
  const t = dict.homePage.guide
  return (
    <section className="container-page py-20 md:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <PhotoSlot label={t.portraitSlot} className="aspect-[4/5] rounded-[1.5rem]" />
        <div>
          <p className={eyebrowClass}>{t.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl text-forest-900 md:text-5xl rtl:leading-[1.4]">{t.title}</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{t.body}</p>
          <Link href={localePath(locale, 'maitres/cheikh-ousmane-mbow')} className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest-800 px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-forest-700">
            {t.cta}
            <ArrowIcon />
          </Link>
          <p className="mt-3 text-xs text-muted">{t.note}</p>

          <h3 className="mt-12 text-sm font-medium text-ink">{t.videosTitle}</h3>
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="group relative grid aspect-video place-items-center overflow-hidden rounded-xl bg-forest-900/90">
                <span className="grid size-10 place-items-center rounded-full bg-ivory/15 text-ivory">
                  <svg viewBox="0 0 24 24" className="size-4 translate-x-px fill-current" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="absolute bottom-2 start-2 text-[0.65rem] text-ivory/60">{t.videoSlot}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* 6. Parcours + chaîne de transmission */
export function Paths({ locale, dict }: SectionProps) {
  const { paths, chain } = dict.homePage
  const fmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'fr', { minimumIntegerDigits: 2 })
  return (
    <section className="border-y border-line bg-paper">
      <div className="container-page py-20 md:py-24">
        <SectionHeading title={paths.title} lead={paths.lead} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {paths.items.map((item, i) => (
            <li key={item.href}>
              <Link href={localePath(locale, item.href)} className="group flex h-full flex-col rounded-card border border-line bg-ivory/60 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-forest-600/40 hover:bg-paper hover:shadow-[0_18px_40px_-24px_rgb(15_61_46/0.35)]">
                <span className="text-sm tabular-nums text-ochre">{fmt.format(i + 1)}</span>
                <span className="mt-5 font-display text-xl text-forest-900">{item.title}</span>
                <span className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-muted">{item.body}</span>
                <span className="mt-6 text-forest-700 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  <ArrowIcon />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16">
          <p className="text-sm text-muted">{chain.title} — {chain.lead}</p>
          <ol className="mt-5 flex flex-wrap items-center gap-2">
            {chain.items.map((item, i) => (
              <li key={item.href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="text-forest-600/50"><ArrowIcon className="size-3.5" /></span>}
                <Link
                  href={localePath(locale, item.href)}
                  title={item.body}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    i === chain.items.length - 1 ? 'bg-forest-800 text-ivory hover:bg-forest-700' : 'border border-line text-ink hover:border-forest-600'
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* 7. Bibliothèque : manuscrit + lecture en couches */
export function LibraryPrinciple({ locale, dict }: SectionProps) {
  const t = dict.homePage.library
  const rows = [
    { key: 'original', label: t.layers.original, content: <p className="text-arabic text-forest-900" lang="ar">{t.sample.original}</p> },
    { key: 'transliteration', label: t.layers.transliteration, content: <p className="italic text-ink/80" lang="ar-Latn" dir="ltr">{t.sample.transliteration}</p> },
    { key: 'translation', label: t.layers.translation, content: <p className="text-ink" lang="fr" dir="ltr">{t.sample.translation}</p> },
    { key: 'commentary', label: t.layers.commentary, content: <p className="text-sm text-muted">{t.sample.commentary}</p> },
  ]
  return (
    <section className="container-page py-20 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
        <Photo id="fatiha" locale={locale} sizes="(min-width: 1024px) 35vw, 100vw" className="aspect-[3/4] rounded-[1.5rem] lg:aspect-auto lg:h-full" />
        <div className="flex flex-col justify-center">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
          <figure className="mt-8 rounded-[1.5rem] border border-line bg-paper p-2">
            <dl className="divide-y divide-line">
              {rows.map((row) => (
                <div key={row.key} className="grid gap-2 px-5 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <dt className="pt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted rtl:tracking-normal">
                    {row.key === 'commentary' ? <span className="rounded-full bg-ochre-soft px-2 py-0.5 text-ochre">{row.label}</span> : row.label}
                  </dt>
                  <dd>{row.content}</dd>
                </div>
              ))}
            </dl>
            <figcaption className="px-5 pb-3 pt-1 text-xs text-muted">{t.reference}</figcaption>
          </figure>
          <Link href={localePath(locale, 'bibliotheque')} className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-forest-800 px-5 py-2.5 text-sm font-medium text-forest-800 transition-colors hover:bg-forest-800 hover:text-ivory">
            {t.cta}
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* 8. Photothèque : images libres + emplacements pour les photos de la Jamah */
export function Gallery({ locale, dict }: SectionProps) {
  const t = dict.homePage.gallery
  return (
    <section className="bg-sand/60">
      <div className="container-page py-20 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
          <Link href={localePath(locale, 'jamah/contact')} className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:underline">
            {t.cta}
            <ArrowIcon />
          </Link>
        </div>
        <div className="mt-10 grid auto-rows-[12rem] grid-cols-2 gap-3 md:auto-rows-[14rem] md:grid-cols-4">
          <Photo id="manuscrit" locale={locale} sizes="50vw" className="col-span-2 row-span-2 rounded-card" />
          <Photo id="medinaBaye" locale={locale} sizes="25vw" className="rounded-card" />
          <PhotoSlot label={`${t.slots[0]} — ${t.slotSuffix}`} className="rounded-card" />
          <PhotoSlot label={`${t.slots[1]} — ${t.slotSuffix}`} className="rounded-card" />
          <PhotoSlot label={`${t.slots[2]} — ${t.slotSuffix}`} className="rounded-card" />
        </div>
        <Link href={localePath(locale, 'credits')} className="mt-6 inline-block text-xs text-muted underline underline-offset-4 hover:text-forest-700">
          {dict.homePage.photoCredits}
        </Link>
      </div>
    </section>
  )
}

/* 9. Actualités, événements et invitation */
export function UpdatesAndJoin({ locale, dict }: SectionProps) {
  const t = dict.homePage
  const blocks = [
    { title: t.news.title, empty: t.news.empty, href: 'actualites/articles' },
    { title: t.events.title, empty: t.events.empty, href: 'actualites/evenements' },
  ]
  return (
    <section className="container-page space-y-6 pt-20 md:pt-24">
      <div className="grid gap-6 md:grid-cols-2">
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
      </div>
      <div className="flex flex-col items-start justify-between gap-6 rounded-[1.5rem] bg-ochre-soft p-8 md:flex-row md:items-center md:p-10">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl text-forest-900 md:text-3xl">{t.join.title}</h2>
          <p className="mt-2 leading-relaxed text-ink/75">{t.join.body}</p>
        </div>
        <Link href={localePath(locale, 'jamah/contact')} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-forest-800 px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-forest-700">
          {t.join.cta}
          <ArrowIcon />
        </Link>
      </div>
    </section>
  )
}
