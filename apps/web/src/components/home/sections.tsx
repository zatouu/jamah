import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import type { GalleryTile, SiteContent } from '@/content/site-content'
import type { VideoEntry } from '@/content/videos'
import { ArrowIcon } from '@/components/icons'
import { Photo } from '@/components/photo'
import { SearchForm } from '@/components/search-form'
import { VideoCard } from '@/components/rubric/video-catalog'
import { siteSections } from '@/lib/navigation'
import { localePath } from '@/lib/paths'

type SectionProps = { locale: Locale; dict: Dictionary; content: SiteContent }

/* ---------- Gabarit commun : espacement, fond, en-tête ---------- */

const tones = {
  ivory: 'bg-ivory',
  paper: 'mx-2 my-3 rounded-panel bg-paper shadow-soft md:mx-4',
  sand: 'mx-2 my-3 rounded-panel bg-sand/70 md:mx-4',
  dark: 'mx-2 my-3 rounded-panel bg-forest-900 text-ivory md:mx-4',
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
const cardLink = 'group block h-full rounded-card bg-paper shadow-soft ring-1 ring-line/60 transition duration-300 hover:-translate-y-1 hover:ring-forest-600/30 hover:shadow-[0_24px_48px_-24px_rgb(15_61_46/0.4)]'

/* ---------- 1. Accueil ---------- */

export function Hero({ locale, dict, content }: SectionProps) {
  const t = dict.homePage
  return (
    <section id="accueil" className="relative">
      <div className="relative isolate overflow-hidden">
        <Photo image={content.images.hero} priority className="absolute inset-0 -z-10" />
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
        <p dir="auto" className="font-display text-xl leading-snug text-forest-900 md:text-[1.75rem] md:leading-[1.4]">
          {q.text}
        </p>
        <footer className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <cite className="font-display text-base not-italic text-forest-800">{q.author}</cite>
          <span className="text-muted">{q.context}</span>
          {q.sourceUrl && (
            <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-forest-700">
              {q.sourceLabel}
            </a>
          )}
          {q.note && <span className="w-full text-xs text-muted">{q.note}</span>}
        </footer>
      </blockquote>
    </Section>
  )
}

/* ---------- 3. Du Prophète ﷺ à nos maîtres ---------- */

export function Masters({ locale, dict, content }: SectionProps) {
  const { masters } = dict.homePage
  return (
    <Section id="maitres" tone="paper" eyebrow={masters.eyebrow} title={masters.title} lead={masters.lead}>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {masters.items.map((item, i) => {
          const image = content.images.masters[i]
          return (
            <li key={`${item.href}-${i}`} className="relative">
              {i > 0 && (
                <span aria-hidden className="absolute -start-4 top-24 z-10 hidden size-4 -translate-x-1/2 rotate-45 border border-ochre bg-paper lg:block rtl:translate-x-1/2" />
              )}
              <Link href={localePath(locale, item.href)} className={`${cardLink} overflow-hidden`}>
                {image ? (
                  <Photo
                    image={image}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="aspect-[4/3] bg-sand"
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div aria-hidden className="grid aspect-[4/3] place-items-center bg-forest-900 font-quran text-5xl text-ivory/80">{item.nameAr.slice(0, 1)}</div>
                )}
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
          )
        })}
      </ol>
    </Section>
  )
}

/* ---------- 4. Le parcours : Islam → … → la Jamah ---------- */

export function Progression({ locale, dict }: SectionProps) {
  const t = dict.homePage.progression
  const fmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'fr')
  return (
    <Section id="parcours" eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {t.items.map((item, i) => (
          <li key={`${item.href}-${i}`} className="relative">
            <Link href={localePath(locale, item.href)} className={`${cardLink} flex flex-col p-5 lg:min-h-[11rem]`}>
              <span className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-forest-800 text-xs tabular-nums text-ivory">{fmt.format(i + 1)}</span>
                {i < t.items.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-gradient-to-r from-ochre/60 to-transparent lg:block rtl:bg-gradient-to-l" />}
              </span>
              <span className="mt-4 font-display text-lg leading-snug text-forest-900">{item.title}</span>
              <span className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/* ---------- 5. Cheikh Ould Khayri : pilier de la transmission ---------- */

export function KhayriSpotlight({ locale, dict, content }: SectionProps) {
  const t = dict.homePage.khayri
  const section = dict.sections['cheikh-ould-khayri']
  const labels = section.children as Record<string, string>
  return (
    <Section id="cheikh-ould-khayri" tone="paper">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Photo image={content.images.khayri} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[16/10] rounded-card" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ochre rtl:tracking-normal">{t.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-forest-900 md:text-[2.5rem] rtl:leading-[1.4]">{t.title}</h2>
          {locale === 'fr' && <p lang="ar" dir="rtl" className="mt-1 font-quran text-2xl text-forest-700">الشيخ ولد خيري</p>}
          <p className="mt-4 leading-relaxed text-muted">{t.body}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {siteSections['cheikh-ould-khayri'].map((child) => (
              <li key={child}>
                <Link href={localePath(locale, `cheikh-ould-khayri/${child}`)} className="inline-block rounded-full border border-line px-3 py-1.5 text-sm text-ink/80 hover:border-forest-600 hover:text-forest-800">
                  {labels[child]}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-s-2 border-ochre ps-3 text-xs leading-relaxed text-muted">{t.note}</p>
          <Link href={localePath(locale, 'cheikh-ould-khayri')} className={`${primaryBtn} mt-6`}>
            {t.cta}
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </Section>
  )
}

/* ---------- 6. Cheikh Ousmane Mbow : notre guide + vidéos ---------- */

export function MbowSpotlight({ locale, dict, videos: allVideos }: SectionProps & { videos: VideoEntry[] }) {
  const t = dict.homePage.mbow
  const labels = dict.sections['cheikh-ousmane-mbow'].children as Record<string, string>
  const videos = allVideos.slice(0, 3)
  return (
    <Section id="cheikh-ousmane-mbow" tone="dark">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-100/80 rtl:tracking-normal">{t.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl md:text-[2.5rem] rtl:leading-[1.4]">{t.title}</h2>
          {locale === 'fr' && <p lang="ar" dir="rtl" className="mt-1 font-quran text-2xl text-forest-100">الشيخ عثمان امبو</p>}
          <p className="mt-4 leading-relaxed text-ivory/80">{t.body}</p>
          <p className="mt-3 text-xs text-ivory/70">{t.note}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={localePath(locale, 'cheikh-ousmane-mbow')} className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-sm font-medium text-forest-900 hover:bg-forest-50">
              {t.cta}
              <ArrowIcon />
            </Link>
            <Link href={localePath(locale, 'cheikh-ousmane-mbow/videotheque')} className="inline-flex items-center rounded-full border border-ivory/30 px-5 py-2.5 text-sm text-ivory hover:bg-ivory/10">
              {t.catalogue}
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {t.groups.map((group) => (
            <div key={group.label} className="rounded-card border border-ivory/10 bg-forest-800/60 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-100/80 rtl:tracking-normal">{group.label}</h3>
              <ul className="mt-3 space-y-1">
                {group.items.map((child) => (
                  <li key={child}>
                    <Link href={localePath(locale, `cheikh-ousmane-mbow/${child}`)} className="block rounded-md py-1 text-sm text-ivory/90 hover:text-ivory hover:underline">
                      {labels[child]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {videos.length > 0 && (
        <div className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl">{dict.homePage.videos.title}</h3>
            <Link href={localePath(locale, 'cheikh-ousmane-mbow/videotheque')} className="text-sm text-ivory/80 hover:underline">{dict.homePage.videos.cta}</Link>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <li key={video.youtube.id} className="text-ink"><VideoCard video={video} dict={dict} /></li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  )
}

/* ---------- 7. Vie de la communauté ---------- */

export function CommunityLife({ locale, dict, content }: SectionProps) {
  const t = dict.homePage.life
  return (
    <Section id="vie" eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((item, i) => {
          const image = content.images.life[i]
          return (
            <li key={`${item.title}-${i}`}>
              <Link href={localePath(locale, item.href)} className={`${cardLink} overflow-hidden`}>
                {image ? (
                  <Photo image={image} credit={false} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="aspect-[16/10]" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div aria-hidden className="aspect-[16/10] bg-sand" />
                )}
                <div className="p-5">
                  <h3 className="font-display text-lg text-forest-900 group-hover:text-forest-700">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

/* ---------- 8. Rendez-vous ---------- */

export function Gatherings({ locale, dict, content }: SectionProps) {
  const t = dict.homePage.gatherings
  const { countdown } = content
  const fmtDate = new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'fr', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  const fmtNum = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'fr')
  const plural = countdown ? new Intl.PluralRules(locale === 'ar' ? 'ar' : 'fr').select(countdown.daysLeft) : 'other'
  const daysText = t.daysLeft[plural === 'zero' ? 'other' : plural]
  return (
    <Section id="rendez-vous" tone="dark" eyebrow={t.eyebrow} title={t.title}>
      <Photo image={content.images.gatherings} credit={false} className="absolute inset-0 -z-10 opacity-15" />
      <div className="grid gap-4 lg:grid-cols-3">
        {countdown && (
          <div className="rounded-card border border-ivory/15 bg-ivory/[0.07] p-6 backdrop-blur-sm">
            <p className="text-sm text-ivory/70">{countdown.label}</p>
            <p className="mt-2 font-display text-5xl tabular-nums">{countdown.daysLeft === 0 ? t.today : daysText.replace('{n}', fmtNum.format(countdown.daysLeft))}</p>
            <p className="mt-2 text-sm text-ivory/70">{fmtDate.format(countdown.date)}</p>
          </div>
        )}
        {t.items.map((item, i) => (
          <article key={`${item.title}-${i}`} className="flex flex-col rounded-card border border-ivory/10 bg-forest-800/70 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-xl">{item.title}</h3>
              <span className="text-xs text-forest-100/80">{item.place}</span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ivory/80">{item.body}</p>
            {item.sourceUrl && (
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 text-xs text-ivory/70 underline underline-offset-4 hover:text-ivory/80">
                {item.sourceLabel || item.sourceUrl}
              </a>
            )}
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs text-ivory/70">{t.note}</p>
    </Section>
  )
}

/* ---------- 9. Bibliothèque ---------- */

export function LibraryPrinciple({ locale, dict, content }: SectionProps) {
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
        <Photo image={content.images.library} sizes="(min-width: 1024px) 18rem, 100vw" className="aspect-[16/10] rounded-card lg:aspect-auto" />
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

/* ---------- 10. En images ---------- */

const tileClass: Record<GalleryTile['size'], string> = {
  large: 'col-span-2 row-span-2',
  wide: 'col-span-2',
  normal: '',
}

export function Gallery({ locale, dict, content }: SectionProps) {
  const t = dict.homePage.gallery
  return (
    <Section id="images" tone="sand" eyebrow={t.eyebrow} title={t.title} lead={t.lead} action={{ href: localePath(locale, 'jamah/contact'), label: t.cta }}>
      <div className="grid grid-flow-row-dense auto-rows-[9rem] grid-cols-2 gap-3 md:auto-rows-[11rem] md:grid-cols-4">
        {content.gallery.map(({ image, size }, i) => (
          <Photo key={i} image={image} sizes="(min-width: 768px) 25vw, 50vw" className={`rounded-card ${tileClass[size]}`} />
        ))}
      </div>
      <Link href={localePath(locale, 'credits')} className="mt-4 inline-block text-xs text-muted underline underline-offset-4 hover:text-forest-700">
        {dict.homePage.photoCredits}
      </Link>
    </Section>
  )
}

/* ---------- 11. Nous rejoindre ---------- */

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
