import type { Locale } from '@/i18n/config'
import { asFile, cmsAssetPath, cmsItems, pick, safeUrl, text, withFiles, type CmsFileRef } from '@/lib/cms'
import { fileImage } from './site-content'
import type { SiteImage } from './media'
import { videos as defaultVideos, type EditorialStatus, type VideoEntry, type VideoKind } from './videos'

/** Contenus éditoriaux des rubriques : page, documents et vidéos publiés dans Directus. */

export type SourceNature = 'documented' | 'testimony' | 'community' | 'interpretation' | 'jamah'
const sourceNatures: ReadonlySet<string> = new Set(['documented', 'testimony', 'community', 'interpretation', 'jamah'])

type Localized<K extends string> = Partial<Record<`${K}_fr` | `${K}_ar`, string | null>>

type CmsPage = Localized<'title' | 'summary' | 'body'> & {
  path: string
  source_nature?: string | null
  sources?: { label?: string | null; url?: string | null }[] | null
  cover?: CmsFileRef
  date_updated?: string | null
  date_created?: string | null
}

export type RubricContent = {
  title?: string
  summary?: string
  body?: string
  nature?: SourceNature
  sources: { label: string; url?: string }[]
  cover: SiteImage | null
  updatedAt?: string
}

export async function getRubricContent(path: string, lang: Locale): Promise<RubricContent | null> {
  const items = await cmsItems<CmsPage>('pages', { fields: withFiles('cover'), 'filter[path][_eq]': path, limit: '1' })
  const page = items?.[0]
  if (!page) return null
  return {
    title: pick(page, 'title', lang),
    summary: pick(page, 'summary', lang),
    body: pick(page, 'body', lang),
    nature: page.source_nature && sourceNatures.has(page.source_nature) ? (page.source_nature as SourceNature) : undefined,
    sources: (Array.isArray(page.sources) ? page.sources : []).flatMap((s) => {
      const label = text(s?.label)
      return label ? [{ label, url: safeUrl(s?.url) }] : []
    }),
    cover: fileImage(page.cover, lang),
    updatedAt: page.date_updated ?? page.date_created ?? undefined,
  }
}

type CmsDocument = Localized<'title' | 'summary'> & {
  author?: string | null
  language?: string | null
  doc_type?: string | null
  date?: string | null
  file?: CmsFileRef
}

export type RubricDocument = {
  title: string
  summary?: string
  author?: string
  language?: string
  type?: string
  date?: string
  href?: string
  format?: string
}

export async function getRubricDocuments(path: string, lang: Locale): Promise<RubricDocument[]> {
  const items = await cmsItems<CmsDocument>('documents', { fields: withFiles('file'), 'filter[page_path][_eq]': path, sort: '-date' })
  return (items ?? []).flatMap((doc) => {
    const title = pick(doc, 'title', lang) ?? pick(doc, 'title', lang === 'fr' ? 'ar' : 'fr')
    if (!title) return []
    const file = asFile(doc.file)
    const ext = text(file?.filename_download)?.split('.').pop()
    return [{
      title,
      summary: pick(doc, 'summary', lang),
      author: text(doc.author),
      language: text(doc.language),
      type: text(doc.doc_type),
      date: text(doc.date),
      href: file ? cmsAssetPath(file.id, true) : undefined,
      format: ext && ext.length <= 5 ? ext.toUpperCase() : undefined,
    }]
  })
}

type CmsVideo = Localized<'summary'> & {
  status: EditorialStatus
  youtube_id: string
  title?: string | null
  description?: string | null
  published_at?: string | null
  duration_seconds?: number | null
  availability?: 'public' | 'private' | 'deleted' | null
  kind?: VideoKind | null
  themes?: string[] | null
  language?: VideoEntry['editorial']['language'] | null
  speakers?: string[] | null
  chapters?: { start?: string | number | null; title?: string | null }[] | null
  transcript_available?: boolean | null
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

/** « 1:02:03 », « 12:30 » ou un nombre de secondes. */
export function parseTimestamp(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? Math.floor(value) : null
  const match = typeof value === 'string' ? /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s*$|^\s*(\d+)\s*$/.exec(value) : null
  if (!match) return null
  if (match[4] !== undefined) return Number(match[4])
  return Number(match[1] ?? 0) * 3600 + Number(match[2]) * 60 + Number(match[3])
}

export function toVideoEntry(video: CmsVideo, lang: Locale): VideoEntry | null {
  if (!YOUTUBE_ID.test(video.youtube_id ?? '')) return null
  return {
    youtube: {
      id: video.youtube_id,
      title: text(video.title) ?? video.youtube_id,
      description: text(video.description),
      publishedAt: video.published_at ?? '',
      durationSeconds: video.duration_seconds ?? undefined,
      availability: video.availability ?? 'public',
    },
    editorial: {
      status: video.status,
      kind: video.kind ?? undefined,
      themes: video.themes ?? [],
      language: video.language ?? 'fr',
      summary: pick(video, 'summary', lang),
      speakers: video.speakers ?? undefined,
      chapters: (video.chapters ?? []).flatMap((c) => {
        const start = parseTimestamp(c?.start)
        const title = text(c?.title)
        return start !== null && title ? [{ startSeconds: start, title }] : []
      }),
      transcriptAvailable: !!video.transcript_available,
    },
  }
}

/** Vidéos publiées (CMS, sinon registre du code), des plus récentes aux plus anciennes. */
export async function getVideos(lang: Locale): Promise<VideoEntry[]> {
  const items = await cmsItems<CmsVideo>('videos', { sort: '-published_at', 'filter[availability][_eq]': 'public' })
  if (!items) return defaultVideos
  return items.flatMap((v) => toVideoEntry(v, lang) ?? [])
}
