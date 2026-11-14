/**
 * Client Directus (côté serveur uniquement), en accès Public : Directus ne renvoie que ce que
 * le rôle Public peut lire (contenus `published`, fichiers `is_public`). Aucun jeton côté site.
 *
 * - `CMS_URL` absent : le site affiche le contenu livré avec le code (dictionnaires, images locales).
 * - CMS injoignable pendant le build : même repli, pour ne jamais bloquer un déploiement.
 * - CMS injoignable à l'exécution : l'erreur remonte, Next.js continue de servir la dernière page valide.
 */

export const CMS_REVALIDATE_SECONDS = 300
export const CMS_CACHE_TAG = 'cms'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type CmsStatus = 'draft' | 'in_review' | 'validated' | 'published' | 'archived'

export type CmsFile = {
  id: string
  type?: string | null
  title?: string | null
  filename_download?: string | null
  filesize?: string | number | null
  alt_fr?: string | null
  alt_ar?: string | null
  credit_author?: string | null
  license?: string | null
  license_url?: string | null
  source_url?: string | null
  position?: string | null
}

/** Relation vers un fichier : objet si lisible, identifiant ou null sinon. */
export type CmsFileRef = CmsFile | string | null | undefined

export function cmsConfigured(): boolean {
  return !!process.env.CMS_URL
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value)
}

/** Chemin public d'un fichier Directus, servi par la route `/cms-assets/[id]` du site. */
export function cmsAssetPath(id: string, download = false): string {
  return `/cms-assets/${id}${download ? '?download=1' : ''}`
}

export function asFile(ref: CmsFileRef): CmsFile | null {
  return ref && typeof ref === 'object' && isUuid(ref.id) ? ref : null
}

async function cmsFetch<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const base = process.env.CMS_URL
  if (!base) return null
  const url = new URL(`${base.replace(/\/+$/, '')}${path}`)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  try {
    const res = await fetch(url, {
      next: { revalidate: CMS_REVALIDATE_SECONDS, tags: [CMS_CACHE_TAG] },
      signal: AbortSignal.timeout(5000),
    })
    // Directus répond 403 pour une collection absente ou non publique : contenu non géré par le CMS.
    if (res.status === 403 || res.status === 404) return null
    if (!res.ok) throw new Error(`CMS ${res.status} sur ${url.pathname}`)
    return ((await res.json()) as { data: T }).data ?? null
  } catch (error) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(`[cms] ${url.pathname} indisponible pendant le build, contenu par défaut utilisé.`)
      return null
    }
    throw error
  }
}

const FILE_FIELDS = ['id', 'type', 'title', 'filename_download', 'filesize', 'alt_fr', 'alt_ar', 'credit_author', 'license', 'license_url', 'source_url', 'position']

export function fileFields(relation: string): string[] {
  return FILE_FIELDS.map((f) => `${relation}.${f}`)
}

/** Champs à demander : `*` plus le détail des relations fichier listées. */
export function withFiles(...relations: string[]): string {
  return ['*', ...relations.flatMap(fileFields)].join(',')
}

export function cmsSingleton<T>(collection: string, fields = '*'): Promise<T | null> {
  return cmsFetch<T>(`/items/${collection}`, { fields })
}

/** Éléments publiés d'une collection (le filtre double celui du rôle Public). */
export function cmsItems<T>(collection: string, params: Record<string, string> = {}, published = true): Promise<T[] | null> {
  return cmsFetch<T[]>(`/items/${collection}`, {
    limit: '-1',
    ...(published ? { 'filter[status][_eq]': 'published' } : {}),
    ...params,
  })
}

/** Texte localisé `<champ>_fr` / `<champ>_ar`, ou undefined s'il est vide. */
export function pick(item: object | null | undefined, field: string, lang: string): string | undefined {
  const value = (item as Record<string, unknown> | null | undefined)?.[`${field}_${lang}`]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

/** N'accepte que les URL http(s) absolues. */
export function safeUrl(value: unknown): string | undefined {
  const url = text(value)
  return url && /^https?:\/\/[^\s/]/i.test(url) ? url : undefined
}
