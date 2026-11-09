import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import type { MediaKey } from '@/content/media'
import { ArrowIcon } from '@/components/icons'
import { Photo } from '@/components/photo'
import { SearchForm } from '@/components/search-form'
import { nextAnnualDate } from '@/lib/calendar'
import { localePath } from '@/lib/paths'

type SectionProps = { locale: Locale; dict: Dictionary }

/* ---------- Gabarit commun : espacement, fond, en-tête ---------- */

const tones = {
  ivory: 'bg-ivory',
  paper: 'bg-paper border-y border-line',
  sand: 'bg-sand/70',
  dark: 'bg-forest-900 text-ivory',
} as const

type SectionShellProps = {
  id: string
  tone?: keyof typeof tones
  eyebrow?: string
  title?: string
  lead?: string
  action?: { href: string; label: string }
  children: ReactNode
  className?: string
}

function Section({ id, tone = 'ivory', eyebrow, title, lead, action, children, className = '' }: SectionShellProps) {
  const dark = tone === 'dark'
  return (
    <section id={id} aria-labelledby={title ? `${id}-title` : undefined} className={`relative isolate scroll-mt-20 overflow-hidden ${tones[tone]} ${className}`}>
      <div className="container-page py-12 md:py-16">
        {title && (
          <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 md:mb-10">
            <div className="max-w-2xl">
              {eyebrow && (
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] rtl:tracking-normal ${dark ? 'text-forest-100/80' : 'text-ochre'}`}>{eyebrow}</p>
              )}
              <h2 id={`${id}-title`} className={`mt-2 font-display text-3xl md:text-[2.5rem] md:leading-tight rtl:leading-[1.4] ${dark ? 'text-ivory' : 'text-forest-900'}`}>
                {title}
              </h2>
              {lead && <p className={`mt-3 text-base leading-relaxed md:text-lg ${dark ? 'text-ivory/75' : 'text-muted'}`}>{lead}</p>}
            </div>
            {action && (
              <Link href={action.href} className={`group inline-flex items-center gap-2 text-sm font-medium ${dark ? 'text-ivory' : 'text-forest-700'}`}>
                {action.label}
                <span className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"><ArrowIcon /></span>
              </Link>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}

const primaryBtn = 'inline-flex items-center gap-2 rounded-full bg-forest-800 px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-forest-700'
const cardLink = 'group block h-full rounded-card border border-line bg-paper transition duration-300 hover:-translate-y-0.5 hover:border-forest-600/40 hover:shadow-[0_18px_40px_-24px_rgb(15_61_46/0.35)]'

/* ---------- 1. Accueil ---------- */

export function Hero({ locale, dict }: SectionProps) {
  const t = dict.homePage
  return (
    <section id="accueil" className="relative">
      <div className="relative isolate overflow-hidden">
        <Photo id="khaima" locale={locale} priority className="absolute inset-0 -z-10" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-900/90 via-forest-900/50 to-forest-900/15" />
        <div className="container-page flex min-h-[28rem] flex-col justify-end pb-24 pt-16 md:min-h-[34rem] md:pb-28">
          <p className="font-display text-lg italic text-ivory/85 rtl:not-italic">{t.greeting}</p>
          <h1 className="mt-2 max-w-3xl font-display text-[2.4rem] leading-[1.08] text-ivory md:text-6xl rtl:leading-[1.35]">{t.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/85 md:text-lg">{t.lead}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={localePath(locale, 'jamah')} className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-sm font-medium text-forest-900 transition-colors hover:bg-forest-50">
              {t.ctaPrimary}
              <ArrowIcon />
            </Link>
            <a href="#maitres" className="inline-flex items-center gap-2 rounded-full border border-ivory/40 px-5 py-2.5 text-sm font-medium text-ivory backdrop-blur-sm transition-colors hover:bg-ivory/10">
              {t.ctaSecondary}
            </a>
          </div>
        </div>
      </div>
      <div className="container-page relative -mt-14">
        <div className="rounded-[1.25rem] border border-line bg-paper p-5 shadow-[0_24px_50px_-28px_rgb(15_61_46/0.45)] md:p-6">
          <p className="mb-3 font-display text-lg text-forest-900">{t.searchTitle}</p>
          <SearchForm locale={locale} dict={dict} withSuggestions />
        </div>
      </div>
    </section>
  )
}

/* ---------- 2. Parole du maître ---------- */

export function QuoteBand({ dict }: SectionProps) {
  const q = dict.homePage.quote
  return (
    <Section id="parole">
      <blockquote className="mx-auto max-w-3xl border-s-2 border-ochre ps-6 md:ps-8">
        <p lang="fr" dir="ltr" className="font-display text-xl leading-snug text-forest-900 md:text-[1.75rem] md:leading-[1.4]">
          {q.text}
        </p>
        <footer className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <cite className="font-display text-base not-italic text-forest-800">{q.author}</cite>
          <span className="text-muted">{q.context}</span>
          <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-forest-700">
            {q.sourceLabel}
          </a>
          {q.note && <span className="w-full text-xs text-muted">{q.note}</span>}
        </footer>
      </blockquote>
    </Section>
  )
}

/* ---------- 3. Du Prophète ﷺ à nos maîtres + notre guide ---------- */

const masterImages: MediaKey[] = ['hilye', 'ainMadhi', 'bayeNiasse', 'dunes']

export function Masters({ locale, dict }: SectionProps) {
  const { masters, guide } = dict.homePage
  return (
    <Section id="maitres" tone="paper" eyebrow={masters.eyebrow} title={masters.title} lead={masters.lead}>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {masters.items.map((item, i) => (
          <li key={item.href} className="relative">
            {i > 0 && (
              <span aria-hidden className="absolute -start-4 top-24 z-10 hidden size-4 -translate-x-1/2 rotate-45 border border-ochre bg-paper lg:block rtl:translate-x-1/2" />
            )}
            <Link href={localePath(locale, item.href)} className={`${cardLink} overflow-hidden`}>
              <Photo
                id={masterImages[i]}
                locale={locale}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="aspect-[4/3] bg-sand"
                imgClassName={`transition-transform duration-700 group-hover:scale-105 ${masterImages[i] === 'bayeNiasse' ? 'object-[50%_20%]' : ''}`}
              />
              <div className="p-5">
                <p lang="ar" dir="rtl" className="font-quran text-2xl leading-relaxed text-forest-800">{item.nameAr}</p>
                {locale === 'fr' && <h3 className="font-display text-lg text-forest-900">{item.name}</h3>}
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.role}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-ochre">{item.meta}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-forest-700">
                    {masters.more}
                    <ArrowIcon className="size-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-5 rounded-card bg-forest-900 p-6 text-ivory md:flex-row md:items-center md:gap-8 md:p-7">
        <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full border border-ivory/25 font-quran text-2xl">ع</span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-100/80 rtl:tracking-normal">{guide.eyebrow}</p>
          <h3 className="mt-1 font-display text-2xl">{guide.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ivory/80">{guide.body}</p>
          <p className="mt-2 text-xs text-ivory/50">{guide.note}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href={localePath(locale, 'maitres/cheikh-ousmane-mbow')} className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-sm font-medium text-forest-900 hover:bg-forest-50">
            {guide.cta}
            <ArrowIcon />
          </Link>
          <Link href={localePath(locale, 'bibliotheque/videos')} className="inline-flex items-center rounded-full border border-ivory/30 px-5 py-2.5 text-sm text-ivory hover:bg-ivory/10">
            {guide.videos}
          </Link>
        </div>
      </div>
    </Section>
  )
}

/* ---------- 4. Vie de la communauté ---------- */

const lifeImages: MediaKey[] = ['tasbih', 'medinaBaye', 'enseignement', 'dunes']

export function CommunityLife({ locale, dict }: SectionProps) {
  const t = dict.homePage.life
  return (
    <Section id="vie" eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((item, i) => (
          <li key={item.title}>
            <Link href={localePath(locale, item.href)} className={`${cardLink} overflow-hidden`}>
              <Photo id={lifeImages[i]} locale={locale} credit={false} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="aspect-[16/10]" imgClassName="transition-transform duration-700 group-hover:scale-105" />
              <div className="p-5">
                <h3 className="font-display text-lg text-forest-900 group-hover:text-forest-700">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ---------- 5. Rendez-vous ---------- */

export function Gatherings({ locale, dict }: SectionProps) {
  const t = dict.homePage.gatherings
  const { date, daysLeft } = nextAnnualDate(4, 20)
  const fmtDate = new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'fr', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  const fmtNum = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'fr')
  return (
    <Section id="rendez-vous" tone="dark" eyebrow={t.eyebrow} title={t.title}>
      <Photo id="dunes" locale={locale} credit={false} className="absolute inset-0 -z-10 opacity-15" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-ivory/15 bg-ivory/[0.07] p-6 backdrop-blur-sm">
          <p className="text-sm text-ivory/70">{t.countdownLabel}</p>
          <p className="mt-2 font-display text-5xl tabular-nums">{daysLeft === 0 ? t.today : t.daysLeft.replace('{n}', fmtNum.format(daysLeft))}</p>
          <p className="mt-2 text-sm text-ivory/70">{fmtDate.format(date)}</p>
        </div>
        {t.items.map((item) => (
          <article key={item.title} className="flex flex-col rounded-card border border-ivory/10 bg-forest-800/70 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-xl">{item.title}</h3>
              <span className="text-xs text-forest-100/80">{item.place}</span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ivory/80">{item.body}</p>
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 text-xs text-ivory/50 underline underline-offset-4 hover:text-ivory/80">
              {item.sourceLabel}
            </a>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs text-ivory/50">{t.note}</p>
    </Section>
  )
}

/* ---------- 6. Par où commencer ---------- */

export function Paths({ locale, dict }: SectionProps) {
  const t = dict.homePage.paths
  const fmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'fr', { minimumIntegerDigits: 2 })
  return (
    <Section id="commencer" tone="paper" title={t.title} lead={t.lead}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((item, i) => (
          <li key={item.href}>
            <Link href={localePath(locale, item.href)} className={`${cardLink} flex flex-col bg-ivory/60 p-5`}>
              <span className="text-sm tabular-nums text-ochre">{fmt.format(i + 1)}</span>
              <span className="mt-3 font-display text-lg text-forest-900">{item.title}</span>
              <span className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{item.body}</span>
              <span className="mt-4 text-forest-700 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                <ArrowIcon />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ---------- 7. Bibliothèque ---------- */

export function LibraryPrinciple({ locale, dict }: SectionProps) {
  const t = dict.homePage.library
  const rows = [
    { key: 'original', label: t.layers.original, content: <p className="text-arabic !text-2xl !leading-[2] text-forest-900" lang="ar">{t.sample.original}</p> },
    { key: 'transliteration', label: t.layers.transliteration, content: <p className="italic text-ink/80" lang="ar-Latn" dir="ltr">{t.sample.transliteration}</p> },
    { key: 'translation', label: t.layers.translation, content: <p className="text-ink" lang="fr" dir="ltr">{t.sample.translation}</p> },
    { key: 'commentary', label: t.layers.commentary, content: <p className="text-sm text-muted">{t.sample.commentary}</p> },
  ]
  return (
    <Section id="bibliotheque" eyebrow={t.eyebrow} title={t.title} lead={t.lead} action={{ href: localePath(locale, 'bibliotheque'), label: t.cta }}>
      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <Photo id="fatiha" locale={locale} sizes="(min-width: 1024px) 18rem, 100vw" className="aspect-[16/10] rounded-card lg:aspect-auto" imgClassName="object-top" />
        <figure className="rounded-card border border-line bg-paper">
          <dl className="divide-y divide-line">
            {rows.map((row) => (
              <div key={row.key} className="grid gap-1.5 px-5 py-3.5 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-6">
                <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted rtl:tracking-normal">
                  {row.key === 'commentary' ? <span className="rounded-full bg-ochre-soft px-2 py-0.5 text-ochre">{row.label}</span> : row.label}
                </dt>
                <dd>{row.content}</dd>
              </div>
            ))}
          </dl>
          <figcaption className="border-t border-line px-5 py-2.5 text-xs text-muted">{t.reference}</figcaption>
        </figure>
      </div>
    </Section>
  )
}

/* ---------- 8. En images ---------- */

const galleryImages: { id: MediaKey; className: string }[] = [
  { id: 'domeVert', className: 'col-span-2 row-span-2' },
  { id: 'manuscrit', className: 'col-span-2 md:col-span-1' },
  { id: 'bayeNiasse', className: '' },
  { id: 'khaima', className: '' },
  { id: 'medinaBaye', className: 'md:col-span-1' },
]

export function Gallery({ locale, dict }: SectionProps) {
  const t = dict.homePage.gallery
  return (
    <Section id="images" tone="sand" eyebrow={t.eyebrow} title={t.title} lead={t.lead} action={{ href: localePath(locale, 'jamah/contact'), label: t.cta }}>
      <div className="grid auto-rows-[9rem] grid-cols-2 gap-3 md:auto-rows-[11rem] md:grid-cols-4">
        {galleryImages.map(({ id, className }) => (
          <Photo key={id} id={id} locale={locale} sizes="(min-width: 768px) 25vw, 50vw" className={`rounded-card ${className}`} imgClassName={id === 'bayeNiasse' ? 'object-[50%_20%]' : ''} />
        ))}
      </div>
      <Link href={localePath(locale, 'credits')} className="mt-4 inline-block text-xs text-muted underline underline-offset-4 hover:text-forest-700">
        {dict.homePage.photoCredits}
      </Link>
    </Section>
  )
}

/* ---------- 9. Nous rejoindre ---------- */

export function Join({ locale, dict }: SectionProps) {
  const t = dict.homePage.join
  return (
    <Section id="rejoindre">
      <div className="flex flex-col items-start justify-between gap-5 rounded-card bg-ochre-soft p-6 md:flex-row md:items-center md:p-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl text-forest-900">{t.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/75 md:text-base">{t.body}</p>
        </div>
        <Link href={localePath(locale, 'jamah/contact')} className={`${primaryBtn} shrink-0`}>
          {t.cta}
          <ArrowIcon />
        </Link>
      </div>
    </Section>
  )
}
