import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/get-dictionary'
import { Breadcrumb } from '@/components/breadcrumb'
import { mediaEntries } from '@/content/media'
import { localePath } from '@/lib/paths'
import { localizedAlternates } from '@/lib/site'

type Params = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  return { title: getDictionary(lang).credits.title, alternates: localizedAlternates(lang, 'credits') }
}

export default async function CreditsPage({ params }: Params) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const dict = getDictionary(lang)
  const t = dict.credits

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumb items={[{ label: dict.home, href: localePath(lang) }, { label: t.title }]} label={dict.a11y.breadcrumb} />
      <h1 className="mt-10 font-display text-4xl text-forest-900 md:text-5xl">{t.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{t.lead}</p>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mediaEntries.map(([key, entry]) => (
          <li key={key} className="overflow-hidden rounded-card border border-line bg-paper">
            <Image src={entry.src} alt={entry.alt[lang]} placeholder="blur" sizes="(min-width: 1024px) 33vw, 50vw" className="aspect-[4/3] w-full object-cover" />
            <dl className="space-y-1.5 p-5 text-sm">
              <dd className="text-ink">{entry.alt[lang]}</dd>
              <div className="flex gap-2"><dt className="text-muted">{t.author} :</dt><dd dir="ltr">{entry.author}</dd></div>
              <div className="flex gap-2">
                <dt className="text-muted">{t.license} :</dt>
                <dd dir="ltr">{entry.licenseUrl ? <a href={entry.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{entry.license}</a> : entry.license}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">{t.source} :</dt>
                <dd><a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Wikimedia Commons</a></dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}
