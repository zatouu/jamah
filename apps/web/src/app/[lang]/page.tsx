import { notFound } from 'next/navigation'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/get-dictionary'
import {
  CommunityLife,
  Gallery,
  Gatherings,
  Hero,
  Join,
  LibraryPrinciple,
  Masters,
  Paths,
  QuoteBand,
} from '@/components/home/sections'

// Régénération quotidienne (compte à rebours du Gamou).
export const revalidate = 86400

type Params = { params: Promise<{ lang: string }> }

export default async function HomePage({ params }: Params) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const props = { locale: lang, dict: getDictionary(lang) }

  return (
    <>
      <Hero {...props} />
      <QuoteBand {...props} />
      <Masters {...props} />
      <CommunityLife {...props} />
      <Gatherings {...props} />
      <Paths {...props} />
      <LibraryPrinciple {...props} />
      <Gallery {...props} />
      <Join {...props} />
    </>
  )
}
