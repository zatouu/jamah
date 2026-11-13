import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Amiri, Inter, Noto_Naskh_Arabic, Source_Serif_4 } from 'next/font/google'
import { getDirection, isLocale, locales } from '@/i18n/config'
import { getSiteContent } from '@/content/site-content'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { localizedAlternates, siteUrl } from '@/lib/site'
import { jsonLdScript, siteJsonLd } from '@/lib/structured-data'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif', display: 'swap' })
const naskh = Noto_Naskh_Arabic({ subsets: ['arabic'], variable: '--font-naskh', display: 'swap' })
const amiri = Amiri({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-amiri', display: 'swap' })

type Params = { params: Promise<{ lang: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export const viewport: Viewport = { themeColor: '#0f3d2e' }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const { meta } = (await getSiteContent(lang)).dict
  return {
    metadataBase: new URL(siteUrl),
    title: { default: meta.title, template: `%s — ${meta.siteName}` },
    description: meta.description,
    alternates: localizedAlternates(lang),
    openGraph: {
      type: 'website',
      siteName: meta.siteName,
      title: meta.title,
      description: meta.description,
      locale: lang === 'ar' ? 'ar_AR' : 'fr_FR',
    },
  }
}

export default async function LocaleLayout({ children, params }: Params & { children: React.ReactNode }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const content = await getSiteContent(lang)
  const { dict } = content

  return (
    <html
      lang={lang}
      dir={getDirection(lang)}
      className={`${inter.variable} ${sourceSerif.variable} ${naskh.variable} ${amiri.variable} antialiased`}
    >
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest-800 focus:px-4 focus:py-2 focus:text-sm focus:text-ivory"
        >
          {dict.a11y.skip}
        </a>
        <SiteHeader locale={lang} dict={dict} />
        <main id="main">{children}</main>
        <SiteFooter locale={lang} dict={dict} contact={content.contact} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd(lang, dict)) }} />
      </body>
    </html>
  )
}
