import type { Dictionary } from '@/i18n/dictionaries/fr'
import { formatTimestamp, publicVideos, youtubeWatchUrl, type VideoEntry } from '@/content/videos'
import { YouTubeLite } from '@/components/youtube-lite'

export function VideoCard({ video, dict }: { video: VideoEntry; dict: Dictionary }) {
  const { youtube, editorial } = video
  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-line bg-paper">
      <YouTubeLite id={youtube.id} title={youtube.title} playLabel={dict.video.play} />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg leading-snug text-forest-900">{youtube.title}</h3>
        {editorial.summary && <p className="mt-1.5 line-clamp-3 text-sm text-muted">{editorial.summary}</p>}
        {editorial.chapters?.length ? (
          <ul className="mt-3 space-y-1 text-sm">
            {editorial.chapters.slice(0, 4).map((c) => (
              <li key={c.startSeconds}>
                <a href={youtubeWatchUrl(youtube.id, c.startSeconds)} target="_blank" rel="noopener noreferrer" className="text-forest-700 hover:underline">
                  <span className="tabular-nums text-muted" dir="ltr">{formatTimestamp(c.startSeconds)}</span> — {c.title}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        {!editorial.transcriptAvailable && <p className="mt-3 text-xs text-muted">{dict.video.notTranscribed}</p>}
        <a href={youtubeWatchUrl(youtube.id)} target="_blank" rel="noopener noreferrer" className="mt-auto pt-4 text-xs text-forest-700 hover:underline">
          {dict.video.onYoutube}
        </a>
      </div>
    </article>
  )
}

/** Catalogue : grille des vidéos publiées, ou état vide explicite. */
export function VideoCatalog({ dict, videos }: { dict: Dictionary; videos: VideoEntry[] }) {
  const list = publicVideos(videos)
  if (!list.length) {
    return (
      <section className="rounded-card border border-line bg-paper p-6">
        <h2 className="font-display text-xl text-forest-900">{dict.video.emptyTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{dict.video.emptyBody}</p>
      </section>
    )
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((video) => (
        <li key={video.youtube.id}>
          <VideoCard video={video} dict={dict} />
        </li>
      ))}
    </ul>
  )
}
