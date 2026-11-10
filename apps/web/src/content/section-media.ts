import type { MediaKey } from './media'
import type { SectionSlug } from '@/lib/navigation'

/** Image d'en-tête de chaque rubrique. Pas d'image générique pour Cheikh Ousmane Mbow (portrait à fournir). */
export const sectionMedia: Partial<Record<SectionSlug, MediaKey>> = {
  'comprendre-islam': 'domeVert',
  tijaniyya: 'ainMadhi',
  fayda: 'bayeNiasse',
  'cheikh-ould-khayri': 'dunes',
  awliya: 'manuscrit',
  jamah: 'khaima',
  bibliotheque: 'fatiha',
  actualites: 'medinaBaye',
}
