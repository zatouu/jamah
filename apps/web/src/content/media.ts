import type { StaticImageData } from 'next/image'
import type { Locale } from '@/i18n/config'
import ainMadhi from '@/assets/media/ain-madhi.jpg'
import bayeNiasse from '@/assets/media/baye-niasse.jpg'
import domeVert from '@/assets/media/dome-vert-medine.jpg'
import dunes from '@/assets/media/dunes-ajouer-trarza.jpg'
import enseignement from '@/assets/media/enseignement-coran.jpg'
import fatiha from '@/assets/media/fatiha-ecriture-soudanaise.jpg'
import hilye from '@/assets/media/hilye-hafiz-osman.jpg'
import khaima from '@/assets/media/khaima-dunes-ajouer.jpg'
import manuscrit from '@/assets/media/manuscrit-chinguetti.jpg'
import medinaBaye from '@/assets/media/mosquee-medina-baye.jpg'
import tasbih from '@/assets/media/tasbih.jpg'
import { mediaCatalog, type MediaKey, type MediaMeta } from './media-catalog'

export type { MediaKey } from './media-catalog'

/** Image prête à afficher : fichier livré avec le site (repli) ou fichier Directus (`/cms-assets/<id>`). */
export type SiteImage = {
  src: StaticImageData | string
  alt: string
  author?: string
  license?: string
  licenseUrl?: string
  sourceUrl?: string
  position?: string
}

const files: Record<MediaKey, StaticImageData> = {
  khaima, dunes, fatiha, manuscrit, tasbih, enseignement, medinaBaye, hilye, domeVert, ainMadhi, bayeNiasse,
}

export function staticImage(key: MediaKey, locale: Locale): SiteImage {
  const meta: MediaMeta = mediaCatalog[key]
  const { alt, author, license, licenseUrl, sourceUrl, position } = meta
  return { src: files[key], alt: alt[locale], author, license, licenseUrl, sourceUrl, position }
}

export function imageKey(image: SiteImage): string {
  return typeof image.src === 'string' ? image.src : image.src.src
}
