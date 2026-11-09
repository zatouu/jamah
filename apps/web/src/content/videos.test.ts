import { describe, expect, it } from 'vitest'
import { formatTimestamp, publicVideos, youtubeWatchUrl, type VideoEntry } from './videos'

const base = (over: Partial<VideoEntry['editorial']>, availability: VideoEntry['youtube']['availability'] = 'public'): VideoEntry => ({
  youtube: { id: 'FICTIF', title: 'FICTIF', publishedAt: '2026-01-01', availability },
  editorial: { status: 'published', themes: [], language: 'fr', transcriptAvailable: false, ...over },
})

describe('videos', () => {
  it('ne montre que les vidéos publiées et disponibles', () => {
    const list = [base({}), base({ status: 'validated' }), base({}, 'private'), base({ status: 'draft' })]
    expect(publicVideos(list)).toHaveLength(1)
  })

  it('formate les horodatages', () => {
    expect(formatTimestamp(515)).toBe('08:35')
    expect(formatTimestamp(3725)).toBe('1:02:05')
  })

  it('construit le lien YouTube au bon moment', () => {
    expect(youtubeWatchUrl('abc', 1160)).toBe('https://www.youtube.com/watch?v=abc&t=1160s')
    expect(youtubeWatchUrl('abc')).toBe('https://www.youtube.com/watch?v=abc')
  })
})
