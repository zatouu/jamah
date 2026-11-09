import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale, locales, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/get-dictionary'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import { Breadcrumb, type Crumb } from '@/components/breadcrumb'
import { ArrowIcon } from '@/components/icons'
import { Photo } from '@/components/photo'
import { ExpectedContent, ProvideDocuments, SourceNatureLegend, StatusBadge } from '@/components/rubric/rubric-parts'
import { VideoCatalog } from '@/components/rubric/video-catalog'
import { expectedContent, sourceSensitiveSections } from '@/content/editorial-spec'
import { sectionMedia } from '@/content/section-media'
import { personSections, resolveSitePath, siteSections, type SectionSlug } from '@/lib/navigation'
import { localePath } from '@/lib/paths'
import { localizedAlternates } from '@/lib/site'

/**
 * Gabarits des rubriques (phase 1) : vue d'ensemble et sous-rubrique.
 * Tant qu'aucun contenu validé n'est publié, la page reste `noindex` et décrit ce qu'elle accueillera.
 */
type Params = { params: Promise<{ lang: string; slug: string[] }> }

export const dynamicParams = false

const videoPages = new Set(['cheikh-ousmane-mbow/videotheque', 'bibliotheque/videos'])

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    Object.entries(siteSections).flatMap(([section, children]) => [
      { lang, slug: [section] },
      ...children.filter((child) => `${section}/${child}` !== 'bibliotheque/recherche').map((child) => ({ lang, slug: [section, child] })),
    ]),
  )
}

function resolve(lang: string, slug: string[]) {
  const target = resolveSitePath(slug)
  if (!isLocale(lang) || !target) return null
  const dict = getDictionary(lang)
  const section = dict.sections[target.section]
  const childLabels = section.children as Record<string, string>
  const title = target.child ? childLabels[target.child] : section.label
  return { lang, dict, target, section, childLabels, title }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params
  const page = resolve(lang, slug)
  if (!page) return {}
  return {
    title: page.title,
    description: page.section.intro,
    robots: { index: false, follow: true },
    alternates: localizedAlternates(page.lang, slug.join('/')),
  }
}

export default async function RubricPage({ params }: Params) {
  const { lang, slug } = await params
  const page = resolve(lang, slug)
  if (!page) notFound()
  return page.target.child ? <ChildPage {...page} child={page.target.child} /> : <SectionOverview {...page} />
}

type PageData = NonNullable<ReturnType<typeof resolve>>

function crumbs(page: PageData): Crumb[] {
  const items: Crumb[] = [{ label: page.dict.home, href: localePath(page.lang) }]
  const { section: slug, child } = page.target
  items.push(child ? { label: page.section.label, href: localePath(page.lang, slug) } : { label: page.section.label })
  if (child) items.push({ label: page.title })
  return items
}

/* ---------- Vue d'ensemble d'une rubrique ---------- */

function SectionOverview(page: PageData) {
  const { lang, dict, target, section, childLabels } = page
  const slug = target.section
  const media = sectionMedia[slug]
  const isPerson = personSections.has(slug)
  const fmt = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'fr', { minimumIntegerDigits: 2 })

  return (
    <>
      <header className="border-b border-line bg-paper">
        <div className="container-page grid gap-8 py-10 md:py-14 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <Breadcrumb items={crumbs(page)} label={dict.a11y.breadcrumb} />
            <div className="mt-6"><StatusBadge label={dict.placeholder.eyebrow} /></div>
            <h1 className="mt-4 font-display text-4xl text-forest-900 md:text-5xl rtl:leading-[1.4]">{section.label}</h1>
            {isPerson && lang === 'fr' && (
              <p lang="ar" dir="rtl" className="mt-2 font-quran text-2xl text-forest-700">{getDictionary('ar').sections[slug].label}</p>
            )}
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{section.intro}</p>
          </div>
          {media ? (
            <Photo id={media} locale={lang} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[16/10] rounded-card" imgClassName={media === 'bayeNiasse' ? 'object-[50%_20%]' : ''} />
          ) : (
            <div aria-hidden className="hidden aspect-[16/10] place-items-center rounded-card bg-forest-900 font-quran text-6xl text-ivory/80 lg:grid">
              {getDictionary('ar').sections[slug].label.replace('الشيخ ', '').slice(0, 1)}
            </div>
          )}
        </div>
      </header>

      <div className="container-page grid gap-8 py-10 md:py-12 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="sub-title">
          <h2 id="sub-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-ochre rtl:tracking-normal">{dict.placeholder.subsections}</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {siteSections[slug].map((child, i) => (
              <li key={child}>
                <Link
                  href={localePath(lang, `${slug}/${child}`)}
                  className="group flex h-full items-start gap-4 rounded-card border border-line bg-paper p-4 transition hover:-translate-y-0.5 hover:border-forest-600/40"
                >
                  <span className="pt-0.5 text-sm tabular-nums text-ochre">{fmt.format(i + 1)}</span>
                  <span className="flex-1 text-ink">{childLabels[child]}</span>
                  <span className="pt-1 text-forest-700 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"><ArrowIcon /></span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
        <aside className="space-y-4">
          <ExpectedContent kinds={expectedContent(slug)} dict={dict} />
          {sourceSensitiveSections.has(slug) && <SourceNatureLegend dict={dict} />}
          <ProvideDocuments locale={lang} dict={dict} />
        </aside>
      </div>
    </>
  )
}

/* ---------- Sous-rubrique ---------- */

function SiblingNav({ lang, slug, current, labels, dict }: { lang: Locale; slug: SectionSlug; current: string; labels: Record<string, string>; dict: Dictionary }) {
  const linkClass = (active: boolean) =>
    `block whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors lg:whitespace-normal ${
      active ? 'bg-forest-800 text-ivory' : 'text-ink/80 hover:bg-forest-50 hover:text-forest-800'
    }`
  return (
    <nav aria-label={dict.placeholder.subsections} className="lg:sticky lg:top-24">
      <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        <li>
          <Link href={localePath(lang, slug)} className={linkClass(false)}>{dict.placeholder.overview}</Link>
        </li>
        {siteSections[slug].map((child) => (
          <li key={child}>
            <Link href={localePath(lang, `${slug}/${child}`)} aria-current={child === current ? 'page' : undefined} className={linkClass(child === current)}>
              {labels[child]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function ChildPage(page: PageData & { child: string }) {
  const { lang, dict, target, childLabels, title, child } = page
  const slug = target.section
  const siblings = siteSections[slug] as readonly string[]
  const index = siblings.indexOf(child)
  const prev = siblings[index - 1]
  const next = siblings[index + 1]
  const isVideoPage = videoPages.has(`${slug}/${child}`)

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumb items={crumbs(page)} label={dict.a11y.breadcrumb} />
      <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <SiblingNav lang={lang} slug={slug} current={child} labels={childLabels} dict={dict} />
        <article className="min-w-0">
          <StatusBadge label={dict.placeholder.eyebrow} />
          <h1 className="mt-4 font-display text-3xl text-forest-900 md:text-[2.6rem] md:leading-tight rtl:leading-[1.4]">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{dict.placeholder.body}</p>

          <div className="mt-8 space-y-4">
            {isVideoPage && <VideoCatalog dict={dict} />}
            <ExpectedContent kinds={expectedContent(slug, child)} dict={dict} />
            <div className="grid gap-4 md:grid-cols-2">
              {sourceSensitiveSections.has(slug) && <SourceNatureLegend dict={dict} />}
              <ProvideDocuments locale={lang} dict={dict} />
            </div>
          </div>

          <nav className="mt-10 grid gap-3 border-t border-line pt-6 sm:grid-cols-2" aria-label={dict.placeholder.subsections}>
            {prev ? (
              <Link href={localePath(lang, `${slug}/${prev}`)} className="group rounded-card border border-line bg-paper p-4 hover:border-forest-600/40">
                <span className="flex items-center gap-2 text-forest-700"><span className="rotate-180"><ArrowIcon /></span></span>
                <span className="mt-1 block text-sm text-ink">{childLabels[prev]}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link href={localePath(lang, `${slug}/${next}`)} className="group rounded-card border border-line bg-paper p-4 text-end hover:border-forest-600/40">
                <span className="flex items-center justify-end gap-2 text-forest-700"><ArrowIcon /></span>
                <span className="mt-1 block text-sm text-ink">{childLabels[next]}</span>
              </Link>
            )}
          </nav>
        </article>
      </div>
    </div>
  )
}
