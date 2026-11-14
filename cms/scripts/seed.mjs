#!/usr/bin/env node
// Pré-remplit Directus avec les textes et images actuels du site, pour que tout soit modifiable depuis le CMS.
// Ne remplace jamais une valeur déjà saisie : seuls les champs vides et les collections vides sont complétés.
// À lancer après bootstrap.mjs (Node >= 22.18, mêmes variables DIRECTUS_*).
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { connect, siteModule, sitePath, sitePaths } from './lib.mjs'

const api = await connect()
const { fr } = await siteModule('i18n/dictionaries/fr.ts')
const { ar } = await siteModule('i18n/dictionaries/ar.ts')
const { mediaCatalog } = await siteModule('content/media-catalog.ts')
const dict = { fr, ar }
const log = (msg) => console.log(msg)

/** Valeur bilingue : { champ_fr, champ_ar } à partir d'un accès au dictionnaire. */
const both = (field, get) => ({ [`${field}_fr`]: get(fr), [`${field}_ar`]: get(ar) })
const empty = (v) => v === null || v === undefined || v === ''

/* ---------- Images ---------- */

const positions = { top: 'top', bottom: 'bottom', left: 'left', right: 'right', '50% 20%': 'face' }
const fileIds = {}
for (const [key, meta] of Object.entries(mediaCatalog)) {
  const name = path.basename(meta.file)
  const found = await api('GET', `/files?filter[filename_download][_eq]=${encodeURIComponent(name)}&fields=id&limit=1`)
  if (found.length) {
    fileIds[key] = found[0].id
    continue
  }
  const form = new FormData()
  // Les métadonnées doivent précéder le fichier dans le formulaire.
  const fields = {
    title: meta.alt.fr, alt_fr: meta.alt.fr, alt_ar: meta.alt.ar, credit_author: meta.author, license: meta.license,
    license_url: meta.licenseUrl ?? '', source_url: meta.sourceUrl, position: positions[meta.position] ?? 'center', is_public: 'true',
  }
  for (const [k, v] of Object.entries(fields)) form.append(k, v)
  const bytes = await readFile(sitePath(`assets/media/${name}`))
  form.append('file', new Blob([bytes], { type: 'image/jpeg' }), name)
  fileIds[key] = (await api('POST', '/files', form)).id
  log(`Image importée : ${name}`)
}

/* ---------- Singletons ---------- */

async function fillSingleton(collection, values) {
  const current = (await api('GET', `/items/${collection}`)) ?? {}
  const patch = Object.fromEntries(Object.entries(values).filter(([k, v]) => !empty(v) && empty(current[k])))
  if (Object.keys(patch).length) {
    await api('PATCH', `/items/${collection}`, patch)
    log(`${collection} : ${Object.keys(patch).length} champ(s) renseigné(s)`)
  }
}

await fillSingleton('site_settings', {
  ...both('site_name', (d) => d.meta.siteName),
  ...both('seo_title', (d) => d.meta.title),
  ...both('seo_description', (d) => d.meta.description),
  ...both('tagline', (d) => d.footer.tagline),
  ...both('footer_editorial', (d) => d.footer.editorial),
})

await fillSingleton('home', {
  hero_image: fileIds.khaima,
  ...both('greeting', (d) => d.homePage.greeting),
  ...both('title', (d) => d.homePage.title),
  ...both('lead', (d) => d.homePage.lead),
  ...both('cta_primary', (d) => d.homePage.ctaPrimary),
  ...both('cta_secondary', (d) => d.homePage.ctaSecondary),
  ...both('search_title', (d) => d.homePage.searchTitle),
  ...both('quote_text', (d) => d.homePage.quote.text),
  ...both('quote_author', (d) => d.homePage.quote.author),
  ...both('quote_context', (d) => d.homePage.quote.context),
  ...both('quote_source_label', (d) => d.homePage.quote.sourceLabel),
  ...both('quote_note', (d) => d.homePage.quote.note),
  quote_source_url: fr.homePage.quote.sourceUrl,
})

/* ---------- Collections (remplies seulement si vides) ---------- */

async function seedCollection(collection, items) {
  const existing = await api('GET', `/items/${collection}?limit=1&fields=id`)
  if (existing.length) return log(`${collection} : déjà renseignée, inchangée`)
  await api('POST', `/items/${collection}`, items)
  log(`${collection} : ${items.length} fiche(s) créée(s)`)
}

// Même correspondance que apps/web/src/content/site-content.ts (homeSectionFields).
const sectionFields = {
  masters: { eyebrow: 'eyebrow', title: 'title', lead: 'lead', cta: 'more' },
  progression: { eyebrow: 'eyebrow', title: 'title', lead: 'lead' },
  khayri: { eyebrow: 'eyebrow', title: 'title', lead: 'body', note: 'note', cta: 'cta' },
  mbow: { eyebrow: 'eyebrow', title: 'title', lead: 'body', note: 'note', cta: 'cta' },
  videos: { eyebrow: 'eyebrow', title: 'title', cta: 'cta' },
  life: { eyebrow: 'eyebrow', title: 'title', lead: 'lead' },
  gatherings: { eyebrow: 'eyebrow', title: 'title', note: 'note' },
  library: { eyebrow: 'eyebrow', title: 'title', lead: 'lead', cta: 'cta' },
  gallery: { eyebrow: 'eyebrow', title: 'title', lead: 'lead', cta: 'cta' },
  join: { title: 'title', lead: 'body', cta: 'cta' },
}
const sectionImages = { khayri: 'dunes', gatherings: 'dunes', library: 'fatiha' }
await seedCollection('home_sections', Object.entries(sectionFields).map(([key, map]) => ({
  key,
  image: sectionImages[key] ? fileIds[sectionImages[key]] : null,
  ...Object.assign({}, ...Object.entries(map).map(([cms, k]) => both(cms, (d) => d.homePage[key][k]))),
})))

const masterImages = ['hilye', 'ainMadhi', 'bayeNiasse', 'dunes']
const lifeImages = ['tasbih', 'medinaBaye', 'enseignement', 'dunes']
await seedCollection('home_cards', [
  ...fr.homePage.masters.items.map((item, i) => ({
    status: 'published', group: 'masters', sort: i + 1, href: item.href, title_fr: item.name, title_ar: item.nameAr,
    ...both('body', (d) => d.homePage.masters.items[i].role),
    ...both('meta', (d) => d.homePage.masters.items[i].meta),
    image: fileIds[masterImages[i]] ?? null,
  })),
  ...fr.homePage.progression.items.map((item, i) => ({
    status: 'published', group: 'progression', sort: i + 1, href: item.href,
    ...both('title', (d) => d.homePage.progression.items[i].title),
    ...both('body', (d) => d.homePage.progression.items[i].body),
  })),
  ...fr.homePage.life.items.map((item, i) => ({
    status: 'published', group: 'life', sort: i + 1, href: item.href,
    ...both('title', (d) => d.homePage.life.items[i].title),
    ...both('body', (d) => d.homePage.life.items[i].body),
    image: fileIds[lifeImages[i]] ?? null,
  })),
])

await seedCollection('events', [
  {
    status: 'published', featured: true, annual: true, show_on_home: false, date: `${new Date().getUTCFullYear()}-04-20`,
    ...both('title', (d) => d.homePage.gatherings.countdownLabel),
    ...both('countdown_label', (d) => d.homePage.gatherings.countdownLabel),
  },
  ...fr.homePage.gatherings.items.map((item, i) => ({
    status: 'published', show_on_home: true, source_url: item.sourceUrl || null,
    ...both('title', (d) => d.homePage.gatherings.items[i].title),
    ...both('place', (d) => d.homePage.gatherings.items[i].place),
    ...both('body', (d) => d.homePage.gatherings.items[i].body),
    ...both('source_label', (d) => d.homePage.gatherings.items[i].sourceLabel),
  })),
])

await seedCollection('gallery', [
  ['domeVert', 'large'], ['manuscrit', 'normal'], ['bayeNiasse', 'normal'], ['khaima', 'normal'], ['medinaBaye', 'normal'],
].map(([key, size], i) => ({ status: 'published', sort: i + 1, image: fileIds[key], size })))

// Pages des rubriques : créées en brouillon (invisibles) avec titre et résumé actuels, prêtes à rédiger.
const label = (d, p) => {
  const [section, child] = p.split('/')
  return child ? d.sections[section].children[child] : d.sections[section].label
}
await seedCollection('pages', (await sitePaths()).map((p) => ({
  status: 'draft', path: p,
  ...both('title', (d) => label(d, p)),
  ...(p.includes('/') ? {} : both('summary', (d) => d.sections[p].intro)),
})))

log('Import terminé. Vérifier les fiches puis publier depuis Directus.')
