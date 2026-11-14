/**
 * Modèle d'une vidéo du catalogue (hébergée sur YouTube, jamais réhébergée).
 * Phase 1 : registre vide, en attendant l'import officiel (YouTube Data API) et l'administration.
 * Les champs « youtube » sont synchronisés ; les champs « editorial » ne sont jamais écrasés par la synchronisation.
 */
export type VideoKind = 'enseignement' | 'explication-texte' | 'conference' | 'reponse' | 'debat' | 'temoignage'
export type EditorialStatus = 'draft' | 'in_review' | 'validated' | 'published' | 'archived'

export type VideoChapter = { startSeconds: number; title: string }

export type VideoEntry = {
  youtube: {
    id: string
    title: string
    description?: string
    publishedAt: string
    durationSeconds?: number
    playlistIds?: string[]
    availability: 'public' | 'private' | 'deleted'
  }
  editorial: {
    status: EditorialStatus
    kind?: VideoKind
    themes: string[]
    language: 'fr' | 'ar' | 'en' | 'wo' | 'mixed'
    summary?: string
    speakers?: string[]
    chapters?: VideoChapter[]
    transcriptAvailable: boolean
  }
}

export const videos: VideoEntry[] = []

/** Seules les vidéos publiées et disponibles sont montrées au public. */
export function publicVideos(list: VideoEntry[] = videos): VideoEntry[] {
  return list.filter((v) => v.editorial.status === 'published' && v.youtube.availability === 'public')
}

export function youtubeWatchUrl(id: string, startSeconds?: number): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}${startSeconds ? `&t=${Math.floor(startSeconds)}s` : ''}`
}

export function formatTimestamp(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${String(m).padStart(2, '0')}:${sec}`
}
