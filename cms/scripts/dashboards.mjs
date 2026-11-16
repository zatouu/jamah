#!/usr/bin/env node
// Tableaux de bord Insights de Directus : « À traiter », « Avancement du site », « Droits et images ».
// Idempotent : un tableau déjà présent n'est pas modifié (l'équipe peut l'ajuster dans Directus), sauf avec
// DASHBOARDS_REFRESH=1, qui recrée ses panneaux. Chaque panneau est ensuite interrogé pour vérifier sa requête.
//
// Usage (Node >= 22.18) : DIRECTUS_URL=... DIRECTUS_ADMIN_EMAIL=... DIRECTUS_ADMIN_PASSWORD=... node cms/scripts/dashboards.mjs
import { connect, sitePaths } from './lib.mjs'

const api = await connect()
const refresh = process.env.DASHBOARDS_REFRESH === '1'
const total = ` / ${(await sitePaths()).length}`

/* ---------- Filtres ---------- */

const status = (value) => ({ status: { _eq: value } })
const filled = (field) => ({ [field]: { _nempty: true } })
const empty = (field) => ({ [field]: { _empty: true } })
const and = (...rules) => ({ _and: rules })
const or = (...rules) => ({ _or: rules })
const published = status('published')
// Pas modifié depuis 30 jours (ou jamais modifié depuis sa création il y a plus de 30 jours)
const dormant = or(
  { date_updated: { _lt: '$NOW(-30 days)' } },
  and({ date_updated: { _null: true } }, { date_created: { _lt: '$NOW(-30 days)' } }),
)

/* ---------- Panneaux (grille : 12 unités = un compteur, 24 = une liste) ---------- */

const metric = (name, collection, filter, opts = {}) => ({
  type: 'metric', name, icon: opts.icon ?? 'functions', color: opts.color ?? null, note: opts.note ?? null, w: 12, h: 6,
  options: { collection, field: 'id', function: 'count', filter, textAlign: 'center', fontWeight: 600, ...(opts.suffix ? { suffix: opts.suffix } : {}) },
})

const list = (name, collection, filter, template, opts = {}) => ({
  type: 'list', name, icon: opts.icon ?? 'list', color: opts.color ?? null, note: opts.note ?? null, w: 24, h: opts.h ?? 16,
  options: {
    collection, filter, displayTemplate: template, linkToItem: true, limit: opts.limit ?? 20,
    sortField: opts.sort ?? 'date_updated', sortDirection: opts.direction ?? 'asc',
  },
})

const ORANGE = '#FFA439'
const BLUE = '#3399FF'
const GREEN = '#2ECDA7'
const RED = '#E35169'

const dashboards = [
  {
    name: 'À traiter', icon: 'inbox', color: ORANGE,
    note: 'Ce qui attend une action : relectures, publications, brouillons oubliés.',
    rows: [
      [
        metric('Pages en relecture', 'pages', status('in_review'), { color: ORANGE, icon: 'article' }),
        metric('Vidéos en relecture', 'videos', status('in_review'), { color: ORANGE, icon: 'smart_display' }),
        metric('Documents en relecture', 'documents', status('in_review'), { color: ORANGE, icon: 'description' }),
        metric('Transcriptions en relecture', 'transcriptions', status('in_review'), { color: ORANGE, icon: 'subtitles' }),
        metric('Traductions en relecture', 'text_translations', status('in_review'), { color: ORANGE, icon: 'translate' }),
        metric('Rendez-vous en relecture', 'events', status('in_review'), { color: ORANGE, icon: 'event' }),
      ],
      [
        list('Pages à relire (les plus anciennes d’abord)', 'pages', status('in_review'), '/{{path}} — {{title_fr}}', { color: ORANGE }),
        list('Pages validées, pas encore publiées', 'pages', status('validated'), '/{{path}} — {{title_fr}}', { color: BLUE }),
        list('Mes pages en cours', 'pages', and({ user_updated: { _eq: '$CURRENT_USER' } }, { status: { _in: ['draft', 'in_review'] } }),
          '/{{path}} — {{status}}', { note: 'Pages que vous avez modifiées en dernier, en brouillon ou en relecture.', sort: 'date_updated', direction: 'desc' }),
      ],
      [
        list('Vidéos à relire', 'videos', status('in_review'), '{{title}}', { color: ORANGE }),
        list('Transcriptions à relire', 'transcriptions', status('in_review'), '{{video.title}}', { color: ORANGE }),
        list('Traductions de textes à relire', 'text_translations', status('in_review'), '{{title}}', { color: ORANGE }),
      ],
      [
        list('Brouillons sans modification depuis 30 jours', 'pages', and(status('draft'), filled('body_fr'), dormant),
          '/{{path}} — {{title_fr}}', { note: 'Pages commencées puis laissées de côté.' }),
      ],
    ],
  },
  {
    name: 'Avancement du site', icon: 'trending_up', color: GREEN,
    note: 'Où en est le contenu, par langue. Une rubrique compte comme publiée quand son texte est publié dans la langue.',
    rows: [
      [
        metric('Rubriques publiées en français', 'pages', and(published, filled('body_fr')), { color: GREEN, suffix: total }),
        metric('Rubriques publiées en arabe', 'pages', and(published, filled('body_ar')), { color: GREEN, suffix: total }),
        metric('Rubriques publiées en anglais', 'pages', and(published, filled('body_en')), { color: GREEN, suffix: total }),
        metric('Vidéos publiées', 'videos', and(published, { availability: { _eq: 'public' } }), { color: GREEN, icon: 'smart_display' }),
        metric('Documents publiés', 'documents', published, { color: GREEN, icon: 'description' }),
        metric('Transcriptions publiées', 'transcriptions', published, { color: GREEN, icon: 'subtitles' }),
      ],
      [
        list('Publiées en français, à traduire en arabe', 'pages', and(published, filled('body_fr'), empty('body_ar')),
          '/{{path}} — {{title_fr}}', { sort: 'path' }),
        list('Publiées en français, à traduire en anglais', 'pages', and(published, filled('body_fr'), empty('body_en')),
          '/{{path}} — {{title_fr}}', { sort: 'path' }),
        list('Publiées sans sources ou sans nature de l’information', 'pages',
          and(published, or({ sources: { _null: true } }, { source_nature: { _null: true } })),
          '/{{path}} — {{title_fr}}', { color: RED, sort: 'path', note: 'Règle éditoriale : toute page publiée cite ses sources et indique la nature de l’information.' }),
      ],
      [
        list('Rubriques encore sans texte français', 'pages', empty('body_fr'), '/{{path}}', { sort: 'path', limit: 100, h: 24 }),
        list('Vidéos publiées sans résumé', 'videos', and(published, empty('summary_fr')), '{{title}}', { sort: 'published_at', direction: 'desc' }),
      ],
    ],
  },
  {
    name: 'Droits et images', icon: 'copyright', color: RED,
    note: 'À vérifier avant la mise en ligne officielle : crédits, licences, accessibilité, autorisations.',
    rows: [
      [
        metric('Fichiers publics sans auteur', 'directus_files', and({ is_public: { _eq: true } }, empty('credit_author')), { color: RED, icon: 'person_off' }),
        metric('Fichiers publics sans licence', 'directus_files', and({ is_public: { _eq: true } }, empty('license')), { color: RED, icon: 'copyright' }),
        metric('Images publiques sans texte alternatif', 'directus_files',
          and({ is_public: { _eq: true } }, { type: { _starts_with: 'image/' } }, empty('alt_fr')), { color: ORANGE, icon: 'image_not_supported' }),
        metric('Documents publiés sans mention des droits', 'documents', and(published, empty('rights')), { color: RED, icon: 'gavel' }),
        metric('Débats non publiés (validation de la Jamah)', 'videos', and({ kind: { _eq: 'debat' } }, { status: { _neq: 'published' } }), { color: ORANGE, icon: 'forum' }),
      ],
      [
        list('Fichiers publics : crédit incomplet', 'directus_files',
          and({ is_public: { _eq: true } }, or(empty('credit_author'), empty('license'))),
          '{{title}} — {{credit_author}} — {{license}}', { color: RED, sort: 'uploaded_on', direction: 'desc', limit: 50 }),
        list('Images publiques sans texte alternatif', 'directus_files',
          and({ is_public: { _eq: true } }, { type: { _starts_with: 'image/' } }, empty('alt_fr')),
          '{{title}}', { color: ORANGE, sort: 'uploaded_on', direction: 'desc', limit: 50 }),
        list('Débats en attente de validation par la Jamah', 'videos', and({ kind: { _eq: 'debat' } }, { status: { _neq: 'published' } }),
          '{{title}} — {{status}}', { color: ORANGE, sort: 'published_at', direction: 'desc',
            note: 'Règle éditoriale : les vidéos de débat ne sont publiées qu’après validation de la Jamah.' }),
      ],
    ],
  },
]

/* ---------- Application ---------- */

const log = (msg) => console.log(msg)

async function ensureDashboard({ name, icon, color, note, rows }) {
  const found = (await api('GET', `/dashboards?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`))[0]
  if (found && !refresh) {
    log(`Tableau « ${name} » déjà présent (DASHBOARDS_REFRESH=1 pour recréer ses panneaux).`)
    return
  }
  const dashboard = found ?? (await api('POST', '/dashboards', { name, icon, color, note }))
  if (found) {
    await api('PATCH', `/dashboards/${found.id}`, { icon, color, note })
    const old = await api('GET', `/panels?filter[dashboard][_eq]=${found.id}&limit=-1&fields=id`)
    if (old.length) await api('DELETE', '/panels', old.map((p) => p.id))
  }
  let y = 1
  for (const row of rows) {
    let x = 1
    for (const p of row) {
      await api('POST', '/panels', {
        dashboard: dashboard.id, name: p.name, icon: p.icon, color: p.color, note: p.note, show_header: true,
        type: p.type, position_x: x, position_y: y, width: p.w, height: p.h, options: p.options,
      })
      x += p.w
    }
    y += Math.max(...row.map((p) => p.h))
  }
  log(`Tableau « ${name} » ${found ? 'recréé' : 'créé'} : ${rows.flat().length} panneaux.`)
}

for (const d of dashboards) await ensureDashboard(d)

// Vérification : chaque requête de panneau doit être acceptée par Directus (filtres, variables $NOW / $CURRENT_USER).
let errors = 0
for (const d of dashboards) {
  for (const p of d.rows.flat()) {
    const { collection, filter } = p.options
    const base = collection === 'directus_files' ? '/files' : `/items/${collection}`
    const query = `aggregate[count]=*&filter=${encodeURIComponent(JSON.stringify(filter))}`
    try {
      const [result] = await api('GET', `${base}?${query}`)
      log(`  ${d.name} › ${p.name} : ${result.count}`)
    } catch (error) {
      errors++
      console.error(`  ${d.name} › ${p.name} : ERREUR ${error.message}`)
    }
  }
}
if (errors) {
  console.error(`${errors} panneau(x) en erreur.`)
  process.exit(1)
}
log('Tableaux de bord prêts.')
