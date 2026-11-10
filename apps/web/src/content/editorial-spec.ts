import type { Dictionary } from '@/i18n/dictionaries/fr'
import type { SectionSlug } from '@/lib/navigation'

/**
 * Ce que chaque rubrique est appelée à accueillir (affiché tant qu'elle est en préparation).
 * Sert aussi de cahier des charges pour le futur modèle de contenu du CMS.
 */
export type ContentKind = keyof Dictionary['contentKinds']

const sectionDefaults: Record<SectionSlug, ContentKind[]> = {
  'comprendre-islam': ['article', 'reference', 'extract', 'translation', 'video', 'commentary'],
  tijaniyya: ['article', 'reference', 'document', 'extract', 'translation', 'commentary', 'video'],
  fayda: ['article', 'document', 'extract', 'translation', 'commentary', 'video'],
  'cheikh-ould-khayri': ['biography', 'chronology', 'speech', 'poem', 'testimony', 'document', 'photo'],
  'cheikh-ousmane-mbow': ['video', 'commentary', 'article', 'reference', 'document'],
  awliya: ['biography', 'document', 'poem', 'extract', 'translation', 'reference'],
  jamah: ['article', 'photo', 'event', 'video'],
  bibliotheque: ['document', 'extract', 'translation', 'commentary', 'video'],
  actualites: ['article', 'event', 'photo', 'video'],
}

const overrides: Partial<Record<`${SectionSlug}/${string}`, ContentKind[]>> = {
  'comprendre-islam/le-prophete': ['article', 'reference', 'extract', 'translation', 'commentary', 'video'],
  'tijaniyya/cheikh-ahmad-tijani': ['biography', 'chronology', 'document', 'reference', 'commentary'],
  'tijaniyya/questions': ['qa', 'reference', 'video'],
  'fayda/cheikh-ibrahim-niasse': ['biography', 'chronology', 'document', 'speech', 'photo', 'reference'],
  'fayda/oeuvres': ['document', 'poem', 'speech', 'extract', 'translation'],
  'cheikh-ould-khayri/biographie': ['biography', 'reference', 'testimony', 'photo'],
  'cheikh-ould-khayri/chronologie': ['chronology', 'reference', 'testimony'],
  'cheikh-ould-khayri/discours': ['speech', 'extract', 'translation', 'video'],
  'cheikh-ould-khayri/ecrits-poemes': ['poem', 'extract', 'translation', 'commentary'],
  'cheikh-ould-khayri/temoignages': ['testimony', 'reference', 'video'],
  'cheikh-ousmane-mbow/presentation': ['biography', 'photo', 'video'],
  'cheikh-ousmane-mbow/parcours-mission': ['biography', 'chronology'],
  'cheikh-ousmane-mbow/ouvrages': ['document', 'extract', 'commentary'],
  'cheikh-ousmane-mbow/videotheque': ['video'],
  'cheikh-ousmane-mbow/debats': ['video', 'reference', 'commentary'],
  'awliya/presentation': ['article', 'reference'],
  'awliya/ecrits-poemes': ['poem', 'document', 'extract', 'translation', 'commentary'],
  'jamah/rencontres': ['event', 'photo', 'video'],
  'jamah/galerie': ['photo', 'video'],
  'jamah/implantations': ['article', 'photo'],
  'bibliotheque/videos': ['video'],
  'bibliotheque/coran-hadith': ['extract', 'translation', 'reference'],
}

export function expectedContent(section: SectionSlug, child?: string): ContentKind[] {
  return (child && overrides[`${section}/${child}`]) || sectionDefaults[section]
}

/** Rubriques où la nature des informations doit être explicitée (biographies, récits). */
export const sourceSensitiveSections: ReadonlySet<SectionSlug> = new Set(['cheikh-ould-khayri', 'fayda', 'tijaniyya', 'cheikh-ousmane-mbow', 'awliya'])
