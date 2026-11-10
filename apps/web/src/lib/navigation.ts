/**
 * Arborescence du site — source unique des rubriques.
 * Les libellés vivent dans les dictionnaires i18n (clés = slugs) ; les contenus viendront du CMS.
 * Progression pédagogique : Islam → Tijâniyya → Fayḍa → Cheikh Ould Khayri → Cheikh Ousmane Mbow → la Jamah.
 */
export const siteSections = {
  'comprendre-islam': ['le-prophete', 'coran', 'sunna-hadith', 'tawhid', 'fiqh', 'tazkiya', 'dhikr', 'ethique', 'relations-sociales'],
  tijaniyya: ['histoire', 'cheikh-ahmad-tijani', 'fondements', 'wird-wazifa', 'dhikr-pratiques', 'adab', 'references', 'questions', 'enseignements'],
  fayda: ['presentation', 'cheikh-ibrahim-niasse', 'parcours-oeuvre', 'tawhid-marifa', 'education-spirituelle', 'oeuvres', 'heritage'],
  'cheikh-ould-khayri': ['biographie', 'parcours-spirituel', 'relation-baye-niasse', 'transmission', 'chronologie', 'discours', 'ecrits-poemes', 'temoignages', 'heritage'],
  'cheikh-ousmane-mbow': [
    'presentation', 'parcours-mission', 'methodologie', 'enseignements-religieux', 'tijaniyya-fayda', 'cheikh-ibrahim-niasse',
    'cheikh-ould-khayri', 'explications-textes', 'conferences', 'debats', 'ouvrages', 'videotheque',
  ],
  awliya: ['presentation', 'compagnons-ahl-al-bayt', 'figures-tijaniyya', 'afrique-ouest', 'autres-voies', 'ecrits-poemes'],
  jamah: ['presentation', 'histoire', 'mission', 'organisation', 'implantations', 'rencontres', 'vie-communautaire', 'galerie', 'contact'],
  bibliotheque: ['recherche', 'documents', 'auteurs', 'videos', 'coran-hadith'],
  actualites: ['articles', 'evenements', 'conferences', 'telechargements'],
} as const

export type SectionSlug = keyof typeof siteSections

/** Rubriques consacrées à une personne : gabarit « personne » (sous-navigation, nature des sources). */
export const personSections: ReadonlySet<SectionSlug> = new Set(['cheikh-ould-khayri', 'cheikh-ousmane-mbow'])

/** Menu principal (Actualités reste accessible depuis l'accueil et le pied de page). */
export const primaryNav: SectionSlug[] = [
  'jamah',
  'comprendre-islam',
  'tijaniyya',
  'fayda',
  'cheikh-ould-khayri',
  'cheikh-ousmane-mbow',
  'awliya',
  'bibliotheque',
]

/** Pages hors rubriques (routes dédiées). */
export const standalonePages = ['credits'] as const

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

/** Vrai si un chemin interne (sans langue) correspond à une page existante. */
export function isKnownPath(path: string): boolean {
  const clean = path.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '')
  if (clean === '' || (standalonePages as readonly string[]).includes(clean)) return true
  return resolveSitePath(clean.split('/')) !== null
}
