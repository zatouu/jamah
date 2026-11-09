'use client'

import { useState } from 'react'

type Props = { id: string; title: string; startSeconds?: number; playLabel: string }

/**
 * Lecteur YouTube léger : seule la miniature est chargée ; l'iframe (youtube-nocookie) n'est créée qu'au clic.
 */
export function YouTubeLite({ id, title, startSeconds, playLabel }: Props) {
  const [active, setActive] = useState(false)
  const start = startSeconds ? `&start=${Math.floor(startSeconds)}` : ''

  if (active) {
    return (
      <iframe
        className="aspect-video w-full rounded-card"
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0${start}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={`${playLabel} : ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-card bg-forest-900"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- miniature distante, sans optimisation Next */}
      <img src={`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-14 place-items-center rounded-full bg-forest-900/80 text-ivory transition group-hover:scale-105">
          <svg viewBox="0 0 24 24" className="size-6 translate-x-px fill-current" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  )
}
