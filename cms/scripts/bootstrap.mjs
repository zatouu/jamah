#!/usr/bin/env node
// Crée (ou complète) le modèle de contenu Directus du site, les rôles éditoriaux, les droits publics
// et le flow de mise à jour du site. Idempotent : rien n'est supprimé ; ce qui existe n'est pas modifié, sauf les
// droits de lecture publics, qui reçoivent les champs ajoutés depuis (ex. traductions anglaises).
//
// Usage (Node >= 22.18) :
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_ADMIN_EMAIL=... DIRECTUS_ADMIN_PASSWORD=... \
//   SITE_REVALIDATE_URL=http://web:3000/api/revalidate REVALIDATE_TOKEN=... node cms/scripts/bootstrap.mjs
import { connect, sitePaths } from './lib.mjs'

const api = await connect()
const paths = await sitePaths()

/* ---------- Constructeurs de champs ---------- */

const label = (fr) => [{ language: 'fr-FR', translation: fr }]
const choices = (entries) => entries.map(([value, text]) => ({ value, text }))

const statusChoices = [
  ['draft', 'Brouillon'], ['in_review', 'En relecture'], ['validated', 'Validé'], ['published', 'Publié'], ['archived', 'Archivé'],
]

const F = {
  status: () => ({
    field: 'status', type: 'string',
    meta: {
      interface: 'select-dropdown', display: 'labels', width: 'half', translations: label('Statut'),
      options: { choices: choices(statusChoices) },
      display_options: {
        showAsDot: true,
        choices: [
          { value: 'draft', background: '#A2B5CD' }, { value: 'in_review', background: '#FFA439' },
          { value: 'validated', background: '#3399FF' }, { value: 'published', background: '#2ECDA7' }, { value: 'archived', background: '#666666' },
        ],
      },
      note: 'Seuls les contenus « Publié » apparaissent sur le site.',
    },
    schema: { default_value: 'draft', is_nullable: false },
  }),
  sort: () => ({ field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } }),
  string: (field, fr, opts = {}) => ({
    field, type: 'string',
    meta: { interface: 'input', width: opts.width ?? 'full', translations: label(fr), note: opts.note, options: opts.options },
    schema: opts.unique ? { is_unique: true } : {},
  }),
  textarea: (field, fr, opts = {}) => ({
    field, type: 'text', meta: { interface: 'input-multiline', width: opts.width ?? 'full', translations: label(fr), note: opts.note },
  }),
  markdown: (field, fr, opts = {}) => ({
    field, type: 'text',
    meta: {
      interface: 'input-rich-text-md', width: 'full', translations: label(fr), note: opts.note,
      options: { toolbar: ['heading', 'bold', 'italic', 'bullist', 'numlist', 'blockquote', 'link', 'hr'] },
    },
  }),
  select: (field, fr, entries, opts = {}) => ({
    field, type: 'string',
    meta: {
      interface: 'select-dropdown', display: 'formatted-value', width: opts.width ?? 'half', translations: label(fr), note: opts.note,
      options: { choices: choices(entries), allowOther: false }, required: opts.required ?? false,
    },
    schema: { ...(opts.unique ? { is_unique: true } : {}), ...(opts.default ? { default_value: opts.default } : {}) },
  }),
  bool: (field, fr, opts = {}) => ({
    field, type: 'boolean',
    meta: { interface: 'boolean', special: ['cast-boolean'], width: 'half', translations: label(fr), note: opts.note },
    schema: { default_value: opts.default ?? false },
  }),
  integer: (field, fr, opts = {}) => ({ field, type: 'integer', meta: { interface: 'input', width: 'half', translations: label(fr), note: opts.note } }),
  date: (field, fr, opts = {}) => ({ field, type: 'date', meta: { interface: 'datetime', width: 'half', translations: label(fr), note: opts.note } }),
  datetime: (field, fr, opts = {}) => ({ field, type: 'timestamp', meta: { interface: 'datetime', width: 'half', translations: label(fr), note: opts.note } }),
  url: (field, fr, opts = {}) => ({
    field, type: 'string',
    meta: { interface: 'input', width: opts.width ?? 'half', translations: label(fr), note: opts.note ?? 'Adresse complète commençant par https://', options: { placeholder: 'https://' } },
  }),
  tags: (field, fr, opts = {}) => ({
    field, type: 'json', meta: { interface: 'tags', special: ['cast-json'], width: opts.width ?? 'half', translations: label(fr), note: opts.note },
  }),
  list: (field, fr, subfields, template, opts = {}) => ({
    field, type: 'json',
    meta: {
      interface: 'list', special: ['cast-json'], width: 'full', translations: label(fr), note: opts.note,
      options: { template, addLabel: 'Ajouter', fields: subfields },
    },
  }),
  file: (field, fr, opts = {}) => ({
    field, type: 'uuid', relation: 'directus_files',
    meta: {
      interface: opts.image === false ? 'file' : 'file-image', special: ['file'], display: opts.image === false ? 'file' : 'image',
      width: opts.width ?? 'half', translations: label(fr),
      note: opts.note ?? 'Renseigner le texte alternatif, l’auteur et la licence dans la fiche du fichier, et cocher « Visible sur le site ».',
    },
  }),
  m2o: (field, fr, related, template, opts = {}) => ({
    field, type: 'integer', relation: related,
    meta: {
      interface: 'select-dropdown-m2o', special: ['m2o'], display: 'related-values', display_options: { template },
      options: { template }, width: opts.width ?? 'half', translations: label(fr), note: opts.note, required: opts.required ?? false,
    },
    schema: opts.unique ? { is_unique: true } : {},
  }),
  /** Champ multilingue : `<field>_fr`, `<field>_ar` et `<field>_en`. */
  i18n: (kind, field, fr, opts = {}) => [
    { ...F[kind](`${field}_fr`, `${fr} (français)`, { ...opts, width: kind === 'markdown' ? 'full' : 'half' }) },
    { ...F[kind](`${field}_ar`, `${fr} (arabe)`, { ...opts, width: kind === 'markdown' ? 'full' : 'half' }) },
    { ...F[kind](`${field}_en`, `${fr} (anglais)`, { ...opts, width: kind === 'markdown' ? 'full' : 'half' }) },
  ].flat(),
  audit: () => [
    { field: 'user_created', type: 'uuid', relation: 'directus_users', meta: { special: ['user-created'], interface: 'select-dropdown-m2o', display: 'user', readonly: true, hidden: true, width: 'half' } },
    { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], interface: 'datetime', display: 'datetime', readonly: true, hidden: true, width: 'half' } },
    { field: 'user_updated', type: 'uuid', relation: 'directus_users', meta: { special: ['user-updated'], interface: 'select-dropdown-m2o', display: 'user', readonly: true, hidden: true, width: 'half' } },
    { field: 'date_updated', type: 'timestamp', meta: { special: ['date-updated'], interface: 'datetime', display: 'datetime', readonly: true, hidden: true, width: 'half' } },
  ],
}

const pathChoices = paths.map((p) => [p, `/${p}`])
const homeSectionKeys = [
  ['masters', 'Les maîtres'], ['progression', 'Parcours'], ['khayri', 'Cheikh Ould Khayri'], ['mbow', 'Cheikh Ousmane Mbow'],
  ['videos', 'Vidéos'], ['life', 'Vie de la Jamah'], ['gatherings', 'Rendez-vous'], ['library', 'Bibliothèque'],
  ['gallery', 'Galerie'], ['join', 'Rejoindre'],
]
const languages = [['fr', 'Français'], ['ar', 'Arabe'], ['en', 'Anglais'], ['wo', 'Wolof'], ['mixed', 'Plusieurs langues']]

/* ---------- Modèle de contenu ---------- */

const collections = [
  {
    collection: 'site_settings', singleton: true, icon: 'settings', name: 'Réglages du site',
    note: 'Nom du site, référencement, pied de page et coordonnées.',
    fields: [
      ...F.i18n('string', 'site_name', 'Nom du site'),
      ...F.i18n('string', 'seo_title', 'Titre pour les moteurs de recherche'),
      ...F.i18n('textarea', 'seo_description', 'Description pour les moteurs de recherche'),
      ...F.i18n('textarea', 'tagline', 'Présentation (pied de page)'),
      ...F.i18n('textarea', 'footer_editorial', 'Mention éditoriale (pied de page)'),
      ...F.i18n('textarea', 'address', 'Adresse'),
      F.string('contact_email', 'Courriel de contact', { width: 'half' }),
      F.string('contact_phone', 'Téléphone', { width: 'half' }),
      F.url('youtube_url', 'Chaîne YouTube'),
      F.url('facebook_url', 'Page Facebook'),
      F.url('whatsapp_url', 'Lien WhatsApp'),
    ],
  },
  {
    collection: 'home', singleton: true, icon: 'home', name: 'Accueil',
    note: 'Bandeau d’accueil et citation. Un champ vide garde le texte par défaut du site.',
    fields: [
      F.file('hero_image', 'Image du bandeau', { width: 'full' }),
      ...F.i18n('string', 'greeting', 'Salutation'),
      ...F.i18n('string', 'title', 'Titre'),
      ...F.i18n('textarea', 'lead', 'Introduction'),
      ...F.i18n('string', 'cta_primary', 'Bouton principal'),
      ...F.i18n('string', 'cta_secondary', 'Bouton secondaire'),
      ...F.i18n('string', 'search_title', 'Titre de la recherche'),
      ...F.i18n('textarea', 'quote_text', 'Citation'),
      ...F.i18n('string', 'quote_author', 'Auteur de la citation'),
      ...F.i18n('string', 'quote_context', 'Contexte de la citation'),
      ...F.i18n('string', 'quote_source_label', 'Libellé de la source'),
      F.url('quote_source_url', 'Lien de la source', { width: 'full' }),
      ...F.i18n('textarea', 'quote_note', 'Note sur la citation'),
    ],
  },
  {
    collection: 'home_sections', icon: 'view_agenda', name: 'Accueil : sections', display: '{{key}}',
    note: 'En-têtes des sections de la page d’accueil (une fiche par section).',
    fields: [
      F.select('key', 'Section', homeSectionKeys, { unique: true, required: true, width: 'full' }),
      ...F.i18n('string', 'eyebrow', 'Surtitre'),
      ...F.i18n('string', 'title', 'Titre'),
      ...F.i18n('textarea', 'lead', 'Texte'),
      ...F.i18n('textarea', 'note', 'Note'),
      ...F.i18n('string', 'cta', 'Libellé du lien'),
      F.file('image', 'Image (sections Khayri, Rendez-vous, Bibliothèque)', { width: 'full' }),
      ...F.audit(),
    ],
  },
  {
    collection: 'home_cards', icon: 'dashboard', name: 'Accueil : cartes', sort: true, status: true, display: '{{group}} — {{title_fr}}',
    note: 'Cartes « Les maîtres », « Parcours » et « Vie de la Jamah ». Dès qu’une carte d’un groupe est publiée, elle remplace les cartes par défaut de ce groupe.',
    fields: [
      F.status(),
      F.sort(),
      F.select('group', 'Groupe', [['masters', 'Les maîtres'], ['progression', 'Parcours'], ['life', 'Vie de la Jamah']], { required: true }),
      F.select('href', 'Page liée', pathChoices, { required: true }),
      ...F.i18n('string', 'title', 'Titre (pour un maître : son nom)'),
      ...F.i18n('textarea', 'body', 'Texte'),
      ...F.i18n('string', 'meta', 'Mention (dates, lieu…)'),
      F.file('image', 'Image', { width: 'full' }),
      ...F.audit(),
    ],
  },
  {
    collection: 'events', icon: 'event', name: 'Rendez-vous', status: true, display: '{{title_fr}} ({{date}})',
    note: 'Rencontres de la Jamah. « Mis en avant » alimente le compte à rebours de l’accueil.',
    fields: [
      F.status(),
      F.date('date', 'Date'),
      F.bool('annual', 'Revient chaque année', { note: 'Le compte à rebours vise la prochaine occurrence du jour et du mois.' }),
      F.bool('featured', 'Mis en avant (compte à rebours)'),
      F.bool('show_on_home', 'Afficher sur l’accueil'),
      ...F.i18n('string', 'title', 'Titre'),
      ...F.i18n('string', 'countdown_label', 'Libellé du compte à rebours'),
      ...F.i18n('string', 'place', 'Lieu'),
      ...F.i18n('textarea', 'body', 'Description'),
      ...F.i18n('string', 'source_label', 'Libellé de la source'),
      F.url('source_url', 'Lien de la source'),
      F.file('image', 'Image'),
      ...F.audit(),
    ],
  },
  {
    collection: 'gallery', icon: 'photo_library', name: 'Galerie (accueil)', sort: true, status: true, display: '{{image.title}}',
    note: 'Images de la galerie de l’accueil, dans l’ordre choisi. Une galerie publiée remplace la galerie par défaut.',
    fields: [
      F.status(),
      F.sort(),
      F.file('image', 'Image', { width: 'full' }),
      F.select('size', 'Taille', [['normal', 'Normale'], ['wide', 'Large'], ['large', 'Grande']], { default: 'normal' }),
      ...F.audit(),
    ],
  },
  {
    collection: 'pages', icon: 'article', name: 'Pages des rubriques', status: true, display: '/{{path}} — {{title_fr}}',
    note: 'Contenu d’une rubrique ou sous-rubrique. Une page publiée avec un texte devient indexable par les moteurs de recherche.',
    fields: [
      F.status(),
      F.select('path', 'Rubrique', pathChoices, { unique: true, required: true }),
      F.select('source_nature', 'Nature de l’information', [
        ['documented', 'Documenté'], ['testimony', 'Témoignage'], ['community', 'Tradition de la communauté'],
        ['interpretation', 'Interprétation'], ['jamah', 'Position de la Jamah'],
      ]),
      ...F.i18n('string', 'title', 'Titre de la page'),
      ...F.i18n('string', 'nav_label', 'Libellé dans les menus'),
      ...F.i18n('textarea', 'summary', 'Résumé'),
      ...F.i18n('markdown', 'body', 'Texte'),
      F.file('cover', 'Image d’en-tête', { width: 'full' }),
      F.list('sources', 'Sources', [
        { field: 'label', name: 'Référence', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
        { field: 'url', name: 'Lien (facultatif)', type: 'string', meta: { interface: 'input', width: 'half', options: { placeholder: 'https://' } } },
      ], '{{label}}'),
      ...F.audit(),
    ],
  },
  {
    collection: 'videos', icon: 'smart_display', name: 'Vidéos', status: true, display: '{{title}}',
    note: 'Vidéos YouTube référencées (jamais réhébergées).',
    fields: [
      F.status(),
      F.string('youtube_id', 'Identifiant YouTube', { width: 'half', unique: true, note: '11 caractères, après « v= » dans l’adresse de la vidéo.' }),
      F.select('availability', 'Disponibilité', [['public', 'Publique'], ['private', 'Privée'], ['deleted', 'Supprimée']], { default: 'public' }),
      F.string('title', 'Titre YouTube'),
      F.textarea('description', 'Description YouTube'),
      F.datetime('published_at', 'Publiée le'),
      F.integer('duration_seconds', 'Durée (secondes)'),
      F.select('kind', 'Type', [
        ['enseignement', 'Enseignement'], ['explication-texte', 'Explication de texte'], ['conference', 'Conférence'],
        ['reponse', 'Réponse'], ['debat', 'Débat'], ['temoignage', 'Témoignage'],
      ]),
      F.select('language', 'Langue', languages, { default: 'fr' }),
      F.tags('themes', 'Thèmes'),
      F.tags('speakers', 'Intervenants'),
      ...F.i18n('textarea', 'summary', 'Résumé'),
      F.list('chapters', 'Chapitres', [
        { field: 'start', name: 'Début (ex. 12:30)', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
        { field: 'title', name: 'Titre', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
      ], '{{start}} {{title}}'),
      F.bool('transcript_available', 'Transcription disponible'),
      F.file('media_file', 'Fichier vidéo ou audio (hors YouTube)', {
        image: false, width: 'full', note: 'Enregistrement à transcrire quand il n’est pas sur YouTube. Laisser « Visible sur le site » décoché.',
      }),
      ...F.audit(),
    ],
  },
  {
    collection: 'transcriptions', icon: 'subtitles', name: 'Transcriptions', status: true, display: '{{video.title}}',
    note: 'Transcription et traduction d’une vidéo, segment par segment, en regardant la vidéo.',
    fields: [
      F.status(),
      F.m2o('video', 'Vidéo', 'videos', '{{title}}', { unique: true, required: true, note: 'YouTube ou fichier joint à la fiche vidéo.' }),
      F.select('spoken_language', 'Langue parlée', languages, { default: 'wo' }),
      {
        field: 'segments', type: 'json',
        meta: {
          interface: 'jamah-transcription', special: ['cast-json'], width: 'full', translations: label('Segments'),
          note: 'Ctrl+Entrée : nouveau segment au temps de lecture. Ctrl+Espace : lecture / pause. Alt+← / Alt+→ : 5 secondes.',
        },
      },
      F.textarea('notes', 'Notes de traduction (internes)'),
      ...F.audit(),
    ],
  },
  {
    collection: 'documents', icon: 'description', name: 'Documents', status: true, display: '{{title_fr}}',
    note: 'Documents rattachés à une rubrique. Le fichier doit être coché « Visible sur le site » pour être téléchargeable.',
    fields: [
      F.status(),
      F.select('page_path', 'Rubrique', pathChoices, { required: true }),
      ...F.i18n('string', 'title', 'Titre'),
      ...F.i18n('textarea', 'summary', 'Résumé'),
      F.string('author', 'Auteur', { width: 'half' }),
      F.select('language', 'Langue', languages),
      F.string('doc_type', 'Type (manuscrit, livre, article…)', { width: 'half' }),
      F.string('date', 'Date (AAAA ou AAAA-MM-JJ)', { width: 'half' }),
      F.file('file', 'Fichier', { image: false, width: 'full' }),
      F.textarea('rights', 'Droits et autorisation de diffusion'),
      ...F.audit(),
    ],
  },
  {
    collection: 'text_translations', icon: 'translate', name: 'Traductions de textes', status: true, display: '{{title}}',
    note: 'Traduction et correction d’un texte, paragraphe par paragraphe : original à gauche, traductions à droite.',
    fields: [
      F.status(),
      F.string('title', 'Titre', { width: 'half' }),
      F.select('source_language', 'Langue de l’original', languages, { default: 'ar' }),
      F.m2o('document', 'Document de la bibliothèque (facultatif)', 'documents', '{{title_fr}}'),
      F.file('source_file', 'Fichier original (PDF ou image)', {
        image: false, note: 'Affiché à côté du texte pour vérifier la saisie. Laisser « Visible sur le site » décoché.',
      }),
      {
        field: 'segments', type: 'json',
        meta: {
          interface: 'jamah-text-translation', special: ['cast-json'], width: 'full', translations: label('Paragraphes'),
          note: '« Importer un texte » découpe l’original en paragraphes. Cocher « Relu » quand la traduction d’un paragraphe est validée.',
        },
      },
      F.textarea('notes', 'Notes de traduction (internes)'),
      ...F.audit(),
    ],
  },
]

/** Métadonnées ajoutées aux fichiers (crédits, accessibilité, visibilité publique). */
const fileFields = [
  ...F.i18n('string', 'alt', 'Texte alternatif'),
  F.string('credit_author', 'Auteur / crédit', { width: 'half' }),
  F.string('license', 'Licence', { width: 'half' }),
  F.url('license_url', 'Lien de la licence'),
  F.url('source_url', 'Source'),
  F.select('position', 'Cadrage', [['center', 'Centre'], ['top', 'Haut'], ['bottom', 'Bas'], ['left', 'Gauche'], ['right', 'Droite'], ['face', 'Visage (haut du tiers)']], { default: 'center' }),
  F.bool('is_public', 'Visible sur le site', { note: 'Sans cette case, le fichier n’est jamais servi au public.' }),
]

/* ---------- Application ---------- */

const log = (msg) => console.log(msg)

async function ensureFields(collection, fields) {
  const existing = new Set((await api('GET', `/fields/${collection}`)).map((f) => f.field))
  for (const [i, { relation, ...field }] of fields.entries()) {
    if (existing.has(field.field)) continue
    await api('POST', `/fields/${collection}`, { ...field, meta: { ...field.meta, sort: i + 2 } })
    if (relation) {
      await api('POST', '/relations', {
        collection, field: field.field, related_collection: relation, schema: { on_delete: 'SET NULL' },
      })
    }
    log(`  + ${collection}.${field.field}`)
  }
}

const existingCollections = new Set((await api('GET', '/collections')).map((c) => c.collection))
for (const c of collections) {
  if (!existingCollections.has(c.collection)) {
    await api('POST', '/collections', {
      collection: c.collection,
      meta: {
        icon: c.icon, note: c.note, singleton: !!c.singleton, translations: [{ language: 'fr-FR', translation: c.name, singular: c.name, plural: c.name }],
        display_template: c.display ?? null, sort_field: c.sort ? 'sort' : null,
        ...(c.status ? { archive_field: 'status', archive_value: 'archived', unarchive_value: 'draft' } : {}),
      },
      schema: {},
      fields: [{ field: 'id', type: 'integer', meta: { hidden: true, readonly: true, interface: 'input' }, schema: { is_primary_key: true, has_auto_increment: true } }],
    })
    log(`Collection créée : ${c.collection}`)
  }
  await ensureFields(c.collection, c.fields)
}
await ensureFields('directus_files', fileFields)

/* ---------- Droits ---------- */

const contentCollections = collections.filter((c) => c.status).map((c) => c.collection)
const structureCollections = collections.filter((c) => !c.status).map((c) => c.collection)
const editable = ['draft', 'in_review']
const publicFileFields = [
  'id', 'type', 'title', 'filename_download', 'filesize', 'width', 'height',
  'alt_fr', 'alt_ar', 'alt_en', 'credit_author', 'license', 'license_url', 'source_url', 'position',
]
const internalFields = new Set(['notes', 'media_file', 'source_file'])
const publicFields = (c) => ['id', ...c.fields.map((f) => f.field).filter((f) => !f.startsWith('user_') && !internalFields.has(f))]

async function ensurePolicy(name, description, icon) {
  const found = await api('GET', `/policies?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`)
  if (found.length) return found[0].id
  const policy = await api('POST', '/policies', { name, description, icon, admin_access: false, app_access: true, enforce_tfa: false })
  log(`Politique créée : ${name}`)
  return policy.id
}

async function ensureRole(name, description, icon, policyId) {
  const found = await api('GET', `/roles?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`)
  if (found.length) return
  await api('POST', '/roles', { name, description, icon, policies: [{ policy: policyId }] })
  log(`Rôle créé : ${name}`)
}

async function ensurePermissions(policyId, permissions) {
  const existing = await api('GET', `/permissions?filter[policy][_eq]=${policyId}&limit=-1&fields=id,collection,action,fields`)
  const has = new Map(existing.map((p) => [`${p.collection}:${p.action}`, p]))
  for (const p of permissions) {
    const current = has.get(`${p.collection}:${p.action}`)
    if (current) {
      // Droit déjà présent avec une liste de champs : on y ajoute les nouveaux champs (ex. `_en`), sans rien retirer.
      const fields = Array.isArray(current.fields) ? current.fields : []
      const missing = Array.isArray(p.fields) && !fields.includes('*') ? p.fields.filter((f) => !fields.includes(f)) : []
      if (missing.length) {
        await api('PATCH', `/permissions/${current.id}`, { fields: [...fields, ...missing] })
        log(`  ~ droit ${p.action} sur ${p.collection} : ${missing.length} champ(s) ajouté(s)`)
      }
      continue
    }
    await api('POST', '/permissions', { policy: policyId, fields: ['*'], permissions: {}, validation: {}, ...p })
    log(`  + droit ${p.action} sur ${p.collection}`)
  }
}

// Public (visiteurs du site, sans jeton) : lecture des seuls contenus publiés et des fichiers marqués publics.
const publicPolicy = (await api('GET', `/policies?filter[name][_eq]=${encodeURIComponent('$t:public_label')}&limit=1`))[0]
if (!publicPolicy) throw new Error('Politique publique introuvable (Directus 11 attendu).')
await ensurePermissions(publicPolicy.id, [
  ...collections.map((c) => ({
    collection: c.collection, action: 'read', fields: publicFields(c),
    permissions: c.status ? { status: { _eq: 'published' } } : {},
  })),
  { collection: 'directus_files', action: 'read', fields: publicFileFields, permissions: { is_public: { _eq: true } } },
])

// Rédaction : crée et modifie des brouillons, propose en relecture ; ne publie ni ne supprime.
const redaction = await ensurePolicy('Rédaction', 'Rédiger et proposer des contenus en relecture.', 'edit_note')
await ensurePermissions(redaction, [
  ...[...contentCollections, ...structureCollections].map((collection) => ({ collection, action: 'read' })),
  ...contentCollections.flatMap((collection) => [
    { collection, action: 'create', validation: { status: { _in: editable } } },
    { collection, action: 'update', permissions: { status: { _in: editable } }, validation: { status: { _in: editable } } },
  ]),
  { collection: 'directus_files', action: 'read' },
  { collection: 'directus_files', action: 'create' },
  { collection: 'directus_files', action: 'update' },
  { collection: 'directus_folders', action: 'read' },
])
await ensureRole('Rédacteur', 'Rédige les contenus (brouillon, en relecture).', 'edit_note', redaction)

// Relecture : valide, publie, archive ; gère l'accueil, les réglages et les fichiers.
const relecture = await ensurePolicy('Relecture', 'Relire, valider et publier ; gérer l’accueil et les fichiers.', 'verified')
await ensurePermissions(relecture, [
  ...[...contentCollections, ...structureCollections].flatMap((collection) =>
    ['create', 'read', 'update', 'delete'].map((action) => ({ collection, action }))),
  ...['create', 'read', 'update', 'delete'].map((action) => ({ collection: 'directus_files', action })),
  ...['create', 'read', 'update'].map((action) => ({ collection: 'directus_folders', action })),
])
await ensureRole('Relecteur', 'Valide et publie les contenus.', 'verified', relecture)

/* ---------- Flow : mise à jour du site ---------- */

const revalidateUrl = process.env.SITE_REVALIDATE_URL
const revalidateToken = process.env.REVALIDATE_TOKEN
const flowName = 'Mise à jour du site'
const flows = await api('GET', `/flows?filter[name][_eq]=${encodeURIComponent(flowName)}&limit=1`)
if (flows.length) {
  log(`Flow « ${flowName} » déjà présent.`)
} else if (!revalidateUrl || !revalidateToken) {
  log(`Flow « ${flowName} » non créé : définir SITE_REVALIDATE_URL et REVALIDATE_TOKEN (sinon le site se met à jour sous 5 minutes).`)
} else {
  const flow = await api('POST', '/flows', {
    name: flowName, icon: 'sync', color: '#2ECDA7', status: 'active', accountability: 'all',
    description: 'Demande au site de régénérer ses pages après chaque modification.',
    trigger: 'event',
    options: { type: 'action', scope: ['items.create', 'items.update', 'items.delete'], collections: [...collections.map((c) => c.collection), 'directus_files'] },
  })
  const operation = await api('POST', '/operations', {
    flow: flow.id, key: 'revalidate', name: 'Régénérer le site', type: 'request', position_x: 19, position_y: 1,
    options: { method: 'POST', url: revalidateUrl, headers: [{ header: 'Authorization', value: `Bearer ${revalidateToken}` }], body: '{}' },
  })
  await api('PATCH', `/flows/${flow.id}`, { operation: operation.id })
  log(`Flow « ${flowName} » créé.`)
}

log('Modèle Directus prêt.')
