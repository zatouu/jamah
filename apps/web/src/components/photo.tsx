import Image from 'next/image'
import type { SiteImage } from '@/content/media'

type PhotoProps = {
  image: SiteImage
  className?: string
  imgClassName?: string
  sizes?: string
  priority?: boolean
  /** Affiche le crédit en surimpression (coin de l'image). */
  credit?: boolean
}

export function Photo({ image, className = '', imgClassName = '', sizes = '100vw', priority, credit = true }: PhotoProps) {
  const position = /(^|\s)!?absolute(\s|$)/.test(className) ? '' : 'relative'
  // Les fichiers du CMS n'ont pas de dimensions connues au build : ils remplissent leur cadre.
  const sizing = typeof image.src === 'string' ? { fill: true } : { placeholder: 'blur' as const }
  const caption = [image.author && `© ${image.author}`, image.license].filter(Boolean).join(' · ')
  return (
    <figure className={`${position} overflow-hidden ${className.replace('!absolute', 'absolute')}`}>
      <Image
        src={image.src}
        alt={image.alt}
        sizes={sizes}
        priority={priority}
        {...sizing}
        style={image.position ? { objectPosition: image.position } : undefined}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
      {credit && caption && (
        <figcaption className="absolute bottom-2 end-2 max-w-[80%] truncate rounded-full bg-black/45 px-2.5 py-0.5 text-[0.65rem] text-white/85 backdrop-blur-sm" dir="ltr">
          {image.sourceUrl ? (
            <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{caption}</a>
          ) : (
            caption
          )}
        </figcaption>
      )}
    </figure>
  )
}

/** Emplacement d'une photo authentique que la Jamah doit fournir (jamais de faux portrait). */
export function PhotoSlot({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-sand text-center ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgb(15 61 46 / 0.04) 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, rgb(15 61 46 / 0.04) 0 1px, transparent 1px 14px)',
      }}
    >
      <div className="flex flex-col items-center gap-3 px-6">
        <svg viewBox="0 0 24 24" className="size-8 text-forest-600/60" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.8" />
          <path d="m21 16-5-5-8 8" />
        </svg>
        <p className="max-w-[16rem] text-sm text-muted">{label}</p>
      </div>
    </div>
  )
}
