import type { ContentKind } from '@/content/editorial-spec'

/** Client du Search Service (côté serveur uniquement). Renvoie null si le service est absent ou indisponible. */

export const MARK_START = '\ue000'
export const MARK_END = '\ue001'

export type SearchHit = {
  id: string
  kind: 'page' | 'document' | 'passage' | 'poem' | 'video' | 'quran' | 'hadith'
  title: string
  snippet: string
  lang: string
  url?: string | null
  anchor?: string | null
  author?: string | null
  work?: string | null
  source_nature?: 'documented' | 'testimony' | 'community' | 'interpretation' | 'jamah' | null
  refs: string[]
  match: 'lexical' | 'semantic' | 'both'
}

export type SearchResult = { query: string; mode: 'hybrid' | 'lexical'; total: number; hits: SearchHit[] }

export const hitKindLabel: Record<SearchHit['kind'], ContentKind> = {
  page: 'article',
  document: 'document',
  passage: 'extract',
  poem: 'poem',
  video: 'video',
  quran: 'reference',
  hadith: 'reference',
}

export async function searchLibrary(query: string, limit = 20): Promise<SearchResult | null> {
  const base = process.env.SEARCH_API_URL
  if (!base || !query) return null
  try {
    const url = new URL('/v1/search', base)
    url.searchParams.set('q', query)
    url.searchParams.set('limit', String(limit))
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(4000) })
    return res.ok ? ((await res.json()) as SearchResult) : null
  } catch {
    return null
  }
}

/** Découpe un extrait en segments à surligner, sans jamais interpréter de HTML. */
export function splitHighlights(snippet: string): { text: string; mark: boolean }[] {
  const parts: { text: string; mark: boolean }[] = []
  for (const chunk of snippet.split(MARK_START)) {
    const end = chunk.indexOf(MARK_END)
    if (end === -1) {
      if (chunk) parts.push({ text: chunk, mark: false })
      continue
    }
    if (end > 0) parts.push({ text: chunk.slice(0, end), mark: true })
    const rest = chunk.slice(end + 1)
    if (rest) parts.push({ text: rest, mark: false })
  }
  return parts
}

/** N'accepte que les liens internes ou http(s) venant de l'index. */
export function safeHitHref(url: string | null | undefined, anchor?: string | null): string | null {
  if (!url) return null
  if (!url.startsWith('/') && !/^https?:\/\//i.test(url)) return null
  if (url.startsWith('//')) return null
  return anchor ? `${url}#${encodeURIComponent(anchor)}` : url
}
