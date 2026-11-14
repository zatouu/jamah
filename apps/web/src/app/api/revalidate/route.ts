import { timingSafeEqual } from 'node:crypto'
import { revalidatePath } from 'next/cache'

/** Appelé par le flow Directus « Mise à jour du site » : régénère les pages après une modification. */
export async function POST(request: Request) {
  const token = process.env.REVALIDATE_TOKEN
  if (!token) return Response.json({ error: 'REVALIDATE_TOKEN absent' }, { status: 503 })

  const given = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${token}`)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return Response.json({ error: 'Jeton invalide' }, { status: 401 })
  }

  revalidatePath('/', 'layout')
  return Response.json({ revalidated: true })
}
