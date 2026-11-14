import { notFound } from 'next/navigation'
import { isLocale } from '@/i18n/config'
import { getSiteContent } from '@/content/site-content'
import { getVideos } from '@/content/cms-pages'
import { publicVideos } from '@/content/videos'
import {
  CommunityLife,
  Gallery,
  Gatherings,
  Hero,
  Join,
  KhayriSpotlight,
  LibraryPrinciple,
  Masters,
  MbowSpotlight,
  Progression,
  QuoteBand,
} from '@/components/home/sections'

// Régénération quotidienne au minimum (compte à rebours) ; les contenus CMS
// ont leur propre durée de cache (5 min) et une invalidation à la publication.
export const revalidate = 86400

type Params = { params: Promise<{ lang: string }> }

export default async function HomePage({ params }: Params) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const [content, videos] = await Promise.all([getSiteContent(lang), getVideos(lang)])
  const props = { locale: lang, dict: content.dict, content }

  return (
    <>
      <Hero {...props} />
      <QuoteBand {...props} />
      <Progression {...props} />
      <Masters {...props} />
      <KhayriSpotlight {...props} />
      <MbowSpotlight {...props} videos={publicVideos(videos)} />
      <CommunityLife {...props} />
      <Gatherings {...props} />
      <LibraryPrinciple {...props} />
      <Gallery {...props} />
      <Join {...props} />
    </>
  )
}
