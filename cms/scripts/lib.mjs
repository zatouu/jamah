// Outils communs aux scripts d'administration Directus (aucune dépendance npm, Node >= 22.18).
import { fileURLToPath } from 'node:url'

export const DIRECTUS_URL = (process.env.DIRECTUS_URL ?? 'http://localhost:8055').replace(/\/+$/, '')

export function fail(message) {
  console.error(`ERREUR : ${message}`)
  process.exit(1)
}

/** Client REST authentifié (jeton statique DIRECTUS_TOKEN, sinon connexion administrateur). */
export async function connect() {
  let token = process.env.DIRECTUS_TOKEN
  if (!token) {
    const email = process.env.DIRECTUS_ADMIN_EMAIL
    const password = process.env.DIRECTUS_ADMIN_PASSWORD
    if (!email || !password) fail('définir DIRECTUS_TOKEN, ou DIRECTUS_ADMIN_EMAIL et DIRECTUS_ADMIN_PASSWORD')
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).catch((error) => fail(`Directus injoignable sur ${DIRECTUS_URL} (${error.message})`))
    if (!res.ok) fail(`connexion à Directus refusée (HTTP ${res.status})`)
    token = (await res.json()).data.access_token
  }

  return async function api(method, path, body) {
    const init = { method, headers: { authorization: `Bearer ${token}` } }
    if (body instanceof FormData) init.body = body
    else if (body !== undefined) {
      init.headers['content-type'] = 'application/json'
      init.body = JSON.stringify(body)
    }
    const res = await fetch(`${DIRECTUS_URL}${path}`, init)
    const text = await res.text()
    if (!res.ok) throw new Error(`${method} ${path} -> HTTP ${res.status} ${text.slice(0, 600)}`)
    return text ? JSON.parse(text).data : null
  }
}

/** Fichiers TypeScript du site (dictionnaires, navigation, catalogue d'images), lus par effacement des types. */
export function sitePath(relative) {
  return fileURLToPath(new URL(`../../apps/web/src/${relative}`, import.meta.url))
}

export async function siteModule(relative) {
  return import(new URL(`../../apps/web/src/${relative}`, import.meta.url))
}

/** Chemins de rubriques du site (`fayda`, `fayda/oeuvres`…), hors recherche. */
export async function sitePaths() {
  const { siteSections } = await siteModule('lib/navigation.ts')
  return Object.entries(siteSections).flatMap(([section, children]) => [
    section,
    ...children.map((child) => `${section}/${child}`).filter((p) => p !== 'bibliotheque/recherche'),
  ])
}
