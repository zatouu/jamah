import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale } from '@/i18n/config'
import { Breadcrumb } from '@/components/breadcrumb'
import { Photo } from '@/components/photo'
import { getSiteContent, usedImages } from '@/content/site-content'
import { localePath } from '@/lib/paths'
import { localizedAlternates } from '@/lib/site'

type Params = { params: Promise<{ lang: string }> }

function sourceLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return host === 'commons.wikimedia.org' || host === 'upload.wikimedia.org' ? 'Wikimedia Commons' : host
  } catch {
    return url
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  return { title: (await getSiteContent(lang)).dict.credits.title, alternates: localizedAlternates(lang, 'credits') }
}

export default async function CreditsPage({ params }: Params) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const content = await getSiteContent(lang)
  const { dict } = content
  const t = dict.credits
  const images = usedImages(content).filter((image) => image.author || image.license || image.sourceUrl)

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumb items={[{ label: dict.home, href: localePath(lang) }, { label: t.title }]} label={dict.a11y.breadcrumb} />
      <h1 className="mt-10 font-display text-4xl text-forest-900 md:text-5xl">{t.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{t.lead}</p>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, i) => (
          <li key={i} className="overflow-hidden rounded-card border border-line bg-paper">
            <Photo image={image} credit={false} sizes="(min-width: 1024px) 33vw, 50vw" className="aspect-[4/3]" />
            <dl className="space-y-1.5 p-5 text-sm">
              <dd className="text-ink">{image.alt}</dd>
              {image.author && <div className="flex gap-2"><dt className="text-muted">{t.author} :</dt><dd dir="ltr">{image.author}</dd></div>}
              {image.license && (
                <div className="flex gap-2">
                  <dt className="text-muted">{t.license} :</dt>
                  <dd dir="ltr">{image.licenseUrl ? <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{image.license}</a> : image.license}</dd>
                </div>
              )}
              {image.sourceUrl && (
                <div className="flex gap-2">
                  <dt className="text-muted">{t.source} :</dt>
                  <dd><a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{sourceLabel(image.sourceUrl)}</a></dd>
                </div>
              )}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}
