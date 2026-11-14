import { cache } from 'react'
import { locales, type Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import { getDictionary } from '@/i18n/get-dictionary'
import { nextAnnualDate } from '@/lib/calendar'
import {
  asFile, cmsAssetPath, cmsItems, cmsSingleton, fileFields, pick, safeUrl, text, withFiles, type CmsFileRef,
} from '@/lib/cms'
import { isKnownPath, resolveSitePath } from '@/lib/navigation'
import { imageKey, staticImage, type MediaKey, type SiteImage } from './media'
import { sectionMedia } from './section-media'

/**
 * Contenu du site : textes des dictionnaires et images livrées avec le code, surchargés par Directus
 * dès qu'une valeur y est saisie. Un champ vide dans le CMS laisse la valeur par défaut.
 */

type Localized<K extends string> = Partial<Record<`${K}_${Locale}`, string | null>>

export type CmsSettings = Localized<'site_name' | 'seo_title' | 'seo_description' | 'tagline' | 'footer_editorial' | 'address'> & {
  contact_email?: string | null
  contact_phone?: string | null
  whatsapp_url?: string | null
  youtube_url?: string | null
  facebook_url?: string | null
}

export type CmsHome = Localized<
  'greeting' | 'title' | 'lead' | 'cta_primary' | 'cta_secondary' | 'search_title' |
  'quote_text' | 'quote_author' | 'quote_context' | 'quote_source_label' | 'quote_note'
> & { quote_source_url?: string | null; hero_image?: CmsFileRef }

export type CmsHomeSection = Localized<'eyebrow' | 'title' | 'lead' | 'note' | 'cta'> & { key: string; image?: CmsFileRef }

export type CmsHomeCard = Localized<'title' | 'body' | 'meta'> & { group: string; href?: string | null; image?: CmsFileRef }

export type CmsEvent = Localized<'title' | 'place' | 'body' | 'countdown_label' | 'source_label'> & {
  date?: string | null
  annual?: boolean | null
  featured?: boolean | null
  show_on_home?: boolean | null
  source_url?: string | null
  image?: CmsFileRef
}

export type CmsGalleryItem = { image?: CmsFileRef; size?: string | null }

export type CmsPageSummary = Localized<'title' | 'nav_label' | 'summary' | 'body'> & {
  path: string
  cover?: CmsFileRef
  date_updated?: string | null
  date_created?: string | null
}

export type CmsSiteData = {
  settings: CmsSettings | null
  home: CmsHome | null
  sections: CmsHomeSection[] | null
  cards: CmsHomeCard[] | null
  events: CmsEvent[] | null
  gallery: CmsGalleryItem[] | null
  pages: CmsPageSummary[] | null
}

export type GalleryTile = { image: SiteImage; size: 'large' | 'wide' | 'normal' }
export type Countdown = { label: string; date: Date; daysLeft: number }
export type Contact = { email?: string; phone?: string; address?: string; links: { label: string; url: string }[] }

export type SiteContent = {
  locale: Locale
  dict: Dictionary
  images: {
    hero: SiteImage
    khayri: SiteImage
    gatherings: SiteImage
    library: SiteImage
    masters: (SiteImage | null)[]
    life: (SiteImage | null)[]
  }
  gallery: GalleryTile[]
  countdown: Countdown | null
  /** Image d'en-tête par chemin de rubrique (`fayda`, `fayda/oeuvres`…). */
  covers: Record<string, SiteImage>
  /** Chemins de rubrique ayant un contenu publié dans le CMS (indexables, au sitemap). */
  published: Record<string, { updatedAt?: string }>
  contact: Contact
}

const positions: Record<string, string> = { top: 'top', bottom: 'bottom', left: 'left', right: 'right', face: '50% 20%' }

/** Image d'un fichier Directus, ou null si absent, non public ou pas une image. */
export function fileImage(ref: CmsFileRef, lang: Locale): SiteImage | null {
  const file = asFile(ref)
  if (!file || (file.type && !file.type.startsWith('image/'))) return null
  return {
    src: cmsAssetPath(file.id),
    alt: pick(file, 'alt', lang) ?? text(file.title) ?? '',
    author: text(file.credit_author),
    license: text(file.license),
    licenseUrl: safeUrl(file.license_url),
    sourceUrl: safeUrl(file.source_url),
    position: file.position ? positions[file.position] : undefined,
  }
}

/** Chemin interne de rubrique saisi dans le CMS, normalisé, ou undefined s'il n'existe pas. */
export function sitePath(value: unknown): string | undefined {
  const path = text(value)?.replace(/^\/+|\/+$/g, '')
  return path !== undefined && isKnownPath(path) ? path : undefined
}

function assign<T extends object>(target: T, key: string, value: string | undefined) {
  if (value !== undefined) (target as Record<string, unknown>)[key] = value
}

/** Champs des sections de l'accueil → clés du dictionnaire `homePage.<section>`. */
const homeSectionFields = {
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
} as const satisfies Record<string, Partial<Record<'eyebrow' | 'title' | 'lead' | 'note' | 'cta', string>>>

export type HomeSectionKey = keyof typeof homeSectionFields
export const homeSectionKeys = Object.keys(homeSectionFields) as HomeSectionKey[]

const defaultImages = {
  hero: 'khaima',
  khayri: 'dunes',
  gatherings: 'dunes',
  library: 'fatiha',
  masters: ['hilye', 'ainMadhi', 'bayeNiasse', 'dunes'],
  life: ['tasbih', 'medinaBaye', 'enseignement', 'dunes'],
  gallery: [
    { id: 'domeVert', size: 'large' },
    { id: 'manuscrit', size: 'normal' },
    { id: 'bayeNiasse', size: 'normal' },
    { id: 'khaima', size: 'normal' },
    { id: 'medinaBaye', size: 'normal' },
  ],
} as const satisfies {
  hero: MediaKey; khayri: MediaKey; gatherings: MediaKey; library: MediaKey; masters: readonly MediaKey[]; life: readonly MediaKey[]
  gallery: readonly { id: MediaKey; size: GalleryTile['size'] }[]
}

const DAY_MS = 86_400_000

/**
 * Texte d'une fiche de liste (cartes, rendez-vous). Une liste saisie dans le CMS remplace celle du
 * dictionnaire : en anglais, un champ pas encore traduit reprend le français plutôt que d'être vide.
 */
function pickItem(item: object, field: string, lang: Locale): string | undefined {
  return pick(item, field, lang) ?? (lang === 'en' ? pick(item, field, 'fr') : undefined)
}

function eventCountdown(event: CmsEvent, lang: Locale, now: Date): Countdown | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(event.date ?? '')
  const label = pickItem(event, 'countdown_label', lang) ?? pickItem(event, 'title', lang)
  if (!match || !label) return null
  const [year, month, day] = match.slice(1).map(Number)
  if (event.annual) return { label, ...nextAnnualDate(month, day, now) }
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const target = Date.UTC(year, month - 1, day)
  return target < today ? null : { label, date: new Date(target), daysLeft: Math.round((target - today) / DAY_MS) }
}

export function mergeSiteContent(lang: Locale, data: CmsSiteData, now: Date = new Date()): SiteContent {
  const dict = structuredClone(getDictionary(lang))
  const home = dict.homePage
  const { settings, home: cmsHome } = data

  // Réglages généraux
  assign(dict.meta, 'siteName', pick(settings, 'site_name', lang))
  assign(dict.meta, 'title', pick(settings, 'seo_title', lang))
  assign(dict.meta, 'description', pick(settings, 'seo_description', lang))
  assign(dict.footer, 'tagline', pick(settings, 'tagline', lang))
  assign(dict.footer, 'editorial', pick(settings, 'footer_editorial', lang))

  // Accueil : bandeau et citation
  for (const [cms, key] of [['greeting', 'greeting'], ['title', 'title'], ['lead', 'lead'], ['cta_primary', 'ctaPrimary'], ['cta_secondary', 'ctaSecondary'], ['search_title', 'searchTitle']] as const) {
    assign(home, key, pick(cmsHome, cms, lang))
  }
  for (const [cms, key] of [['quote_text', 'text'], ['quote_author', 'author'], ['quote_context', 'context'], ['quote_source_label', 'sourceLabel'], ['quote_note', 'note']] as const) {
    assign(home.quote, key, pick(cmsHome, cms, lang))
  }
  assign(home.quote, 'sourceUrl', safeUrl(cmsHome?.quote_source_url))

  const images: SiteContent['images'] = {
    hero: fileImage(cmsHome?.hero_image, lang) ?? staticImage(defaultImages.hero, lang),
    khayri: staticImage(defaultImages.khayri, lang),
    gatherings: staticImage(defaultImages.gatherings, lang),
    library: staticImage(defaultImages.library, lang),
    masters: defaultImages.masters.map((key) => staticImage(key, lang)),
    life: defaultImages.life.map((key) => staticImage(key, lang)),
  }

  // Accueil : en-têtes de sections
  for (const section of data.sections ?? []) {
    if (!(section.key in homeSectionFields)) continue
    const key = section.key as HomeSectionKey
    const target = home[key] as Record<string, unknown>
    for (const [cms, dictKey] of Object.entries(homeSectionFields[key])) assign(target, dictKey, pick(section, cms, lang))
    if (key === 'khayri' || key === 'gatherings' || key === 'library') images[key] = fileImage(section.image, lang) ?? images[key]
  }

  // Accueil : cartes (une liste saisie dans le CMS remplace entièrement celle par défaut)
  const cards = (group: string) => (data.cards ?? []).flatMap((card) => {
    const href = card.group === group ? sitePath(card.href) : undefined
    return href === undefined ? [] : [{ card, href }]
  })
  const masters = cards('masters')
  if (masters.length) {
    home.masters.items = masters.map(({ card, href }) => ({
      href,
      nameAr: text(card.title_ar) ?? '',
      name: (lang === 'en' ? pick(card, 'title', 'en') : undefined) ?? text(card.title_fr) ?? '',
      role: pickItem(card, 'body', lang) ?? '',
      meta: pickItem(card, 'meta', lang) ?? '',
    }))
    images.masters = masters.map(({ card }) => fileImage(card.image, lang))
  }
  const progression = cards('progression')
  if (progression.length) {
    home.progression.items = progression.map(({ card, href }) => ({ href, title: pickItem(card, 'title', lang) ?? '', body: pickItem(card, 'body', lang) ?? '' }))
  }
  const life = cards('life')
  if (life.length) {
    home.life.items = life.map(({ card, href }) => ({ href, title: pickItem(card, 'title', lang) ?? '', body: pickItem(card, 'body', lang) ?? '' }))
    images.life = life.map(({ card }) => fileImage(card.image, lang))
  }

  // Rendez-vous
  let countdown: Countdown | null = { label: home.gatherings.countdownLabel, ...nextAnnualDate(4, 20, now) }
  const events = data.events ?? []
  if (events.length) {
    const shown = events.filter((e) => e.show_on_home && pickItem(e, 'title', lang))
    if (shown.length) {
      home.gatherings.items = shown.map((e) => ({
        title: pickItem(e, 'title', lang) ?? '',
        place: pickItem(e, 'place', lang) ?? '',
        body: pickItem(e, 'body', lang) ?? '',
        sourceLabel: pickItem(e, 'source_label', lang) ?? '',
        sourceUrl: safeUrl(e.source_url) ?? '',
      }))
    }
    const upcoming = events
      .filter((e) => e.featured)
      .map((e) => eventCountdown(e, lang, now))
      .filter((c): c is Countdown => c !== null)
      .sort((a, b) => a.daysLeft - b.daysLeft)
    countdown = upcoming[0] ?? null
  }

  // Galerie
  const cmsGallery = (data.gallery ?? []).flatMap((item): GalleryTile[] => {
    const image = fileImage(item.image, lang)
    const size = item.size === 'large' || item.size === 'wide' ? item.size : 'normal'
    return image ? [{ image, size }] : []
  })
  const gallery = cmsGallery.length ? cmsGallery : defaultImages.gallery.map(({ id, size }) => ({ image: staticImage(id, lang), size }))

  // Rubriques : libellés, introductions, images d'en-tête, pages publiées
  const covers: Record<string, SiteImage> = {}
  for (const [slug, key] of Object.entries(sectionMedia)) if (key) covers[slug] = staticImage(key, lang)
  const published: SiteContent['published'] = {}
  for (const page of data.pages ?? []) {
    const path = sitePath(page.path)
    const target = path ? resolveSitePath(path.split('/')) : null
    if (!path || !target) continue
    if (pick(page, 'body', lang)) published[path] = { updatedAt: page.date_updated ?? page.date_created ?? undefined }
    const section = dict.sections[target.section]
    const label = pick(page, 'nav_label', lang)
    if (target.child) {
      assign(section.children, target.child, label)
    } else {
      assign(section, 'label', label)
      assign(section, 'intro', pick(page, 'summary', lang))
    }
    const cover = fileImage(page.cover, lang)
    if (cover) covers[path] = cover
  }

  const links = [
    { label: 'YouTube', url: safeUrl(settings?.youtube_url) },
    { label: 'Facebook', url: safeUrl(settings?.facebook_url) },
    { label: 'WhatsApp', url: safeUrl(settings?.whatsapp_url) },
  ].filter((l): l is { label: string; url: string } => !!l.url)
  const email = text(settings?.contact_email)
  const contact: Contact = {
    email: email && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : undefined,
    phone: text(settings?.contact_phone),
    address: pick(settings, 'address', lang),
    links,
  }

  return { locale: lang, dict, images, gallery, countdown, covers, published, contact }
}

const PAGE_SUMMARY_FIELDS = [
  'path',
  ...['title', 'nav_label', 'summary', 'body'].flatMap((field) => locales.map((l) => `${field}_${l}`)),
  'date_updated', 'date_created', ...fileFields('cover'),
].join(',')

const loadSiteData = cache(async (): Promise<CmsSiteData> => {
  const [settings, home, sections, cards, events, gallery, pages] = await Promise.all([
    cmsSingleton<CmsSettings>('site_settings'),
    cmsSingleton<CmsHome>('home', withFiles('hero_image')),
    cmsItems<CmsHomeSection>('home_sections', { fields: withFiles('image') }, false),
    cmsItems<CmsHomeCard>('home_cards', { fields: withFiles('image'), sort: 'sort' }),
    cmsItems<CmsEvent>('events', { fields: withFiles('image'), sort: 'date' }),
    cmsItems<CmsGalleryItem>('gallery', { fields: withFiles('image'), sort: 'sort' }),
    cmsItems<CmsPageSummary>('pages', { fields: PAGE_SUMMARY_FIELDS }),
  ])
  return { settings, home, sections, cards, events, gallery, pages }
})

export const getSiteContent = cache(async (lang: Locale): Promise<SiteContent> => mergeSiteContent(lang, await loadSiteData()))

/** Toutes les images affichées par le site, sans doublon (page des crédits). */
export function usedImages(content: SiteContent): SiteImage[] {
  const all = [
    content.images.hero, content.images.khayri, content.images.gatherings, content.images.library,
    ...content.images.masters, ...content.images.life, ...content.gallery.map((t) => t.image), ...Object.values(content.covers),
  ].filter((image): image is SiteImage => image !== null)
  return [...new Map(all.map((image) => [imageKey(image), image])).values()]
}
