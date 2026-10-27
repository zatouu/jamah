/**
 * Arborescence du site (sitemap validé en phase 2 — provisoire).
 * Les libellés vivent dans les dictionnaires i18n, clés = slugs.
 */
export const siteSections = {
  jamah: ['histoire-mission', 'identite-spirituelle', 'activites', 'contact'],
  'comprendre-islam': ['coran', 'hadith-sunna', 'croyance', 'jurisprudence', 'spiritualite', 'ethique'],
  tijaniyya: ['histoire', 'cheikh-ahmad-tijani', 'wird-wazifa', 'adab', 'textes', 'questions'],
  fayda: ['cheikh-ibrahim-niasse', 'histoire', 'themes', 'oeuvres'],
  maitres: ['cheikh-ould-khayri', 'cheikh-ousmane-mbow'],
  bibliotheque: ['recherche', 'auteurs', 'ouvrages', 'videos'],
  actualites: ['articles', 'evenements', 'conferences', 'telechargements'],
} as const

export type SectionSlug = keyof typeof siteSections

/** Entrées du menu principal (Actualités reste accessible via l'accueil et le pied de page). */
export const primaryNav: SectionSlug[] = [
  'jamah',
  'comprendre-islam',
  'tijaniyya',
  'fayda',
  'maitres',
  'bibliotheque',
]

export function isSection(slug: string): slug is SectionSlug {
  return Object.hasOwn(siteSections, slug)
}

/** Résout un chemin de rubrique connu, ou null s'il n'appartient pas au sitemap. */
export function resolveSitePath(segments: string[]): { section: SectionSlug; child?: string } | null {
  const [section, child, ...rest] = segments
  if (rest.length || !section || !isSection(section)) return null
  if (child === undefined) return { section }
  return (siteSections[section] as readonly string[]).includes(child) ? { section, child } : null
}
