import { isUuid } from '@/lib/cms'

/**
 * Sert les fichiers Directus depuis le domaine du site : Directus reste privé, et seuls les fichiers
 * que le rôle Public peut lire (`is_public`) sont accessibles. Images en ligne, autres fichiers en téléchargement.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const base = process.env.CMS_URL
  if (!base || !isUuid(id)) return new Response('Not found', { status: 404 })

  const download = new URL(request.url).searchParams.has('download')
  const upstream = new URL(`${base.replace(/\/+$/, '')}/assets/${id}`)
  if (download) {
    upstream.searchParams.set('download', '')
  } else {
    // Limite la taille transmise à l'optimiseur d'images de Next.js.
    upstream.searchParams.set('width', '2400')
    upstream.searchParams.set('fit', 'inside')
    upstream.searchParams.set('withoutEnlargement', 'true')
  }

  let res: Response
  try {
    res = await fetch(upstream, { cache: 'no-store', signal: AbortSignal.timeout(15000) })
  } catch {
    return new Response('Bad gateway', { status: 502 })
  }
  if (!res.ok || !res.body) return new Response('Not found', { status: res.status >= 500 ? 502 : 404 })

  const type = res.headers.get('content-type') ?? 'application/octet-stream'
  if (!download && (!type.startsWith('image/') || type.includes('svg'))) return new Response('Not found', { status: 404 })

  const headers = new Headers({
    'Content-Type': type,
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
  })
  const length = res.headers.get('content-length')
  if (length) headers.set('Content-Length', length)
  if (download) {
    const disposition = res.headers.get('content-disposition')
    headers.set('Content-Disposition', disposition?.startsWith('attachment') ? disposition : 'attachment')
  }
  return new Response(res.body, { headers })
}
