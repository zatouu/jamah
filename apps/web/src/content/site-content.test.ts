import { describe, expect, it } from 'vitest'
import { getDictionary } from '@/i18n/get-dictionary'
import { fileImage, mergeSiteContent, sitePath, usedImages, type CmsSiteData } from './site-content'

const empty: CmsSiteData = { settings: null, home: null, sections: null, cards: null, events: null, gallery: null, pages: null }
const now = new Date('2026-03-01T10:00:00Z')
const uuid = (n: number) => `00000000-0000-4000-8000-00000000000${n}`
const file = (n: number, extra: object = {}) => ({ id: uuid(n), type: 'image/jpeg', alt_fr: `image ${n}`, ...extra })

describe('mergeSiteContent', () => {
  it('sans CMS, reprend le dictionnaire et les images par défaut', () => {
    const content = mergeSiteContent('fr', empty, now)
    expect(content.dict).toEqual(getDictionary('fr'))
    expect(content.gallery).toHaveLength(5)
    expect(content.images.masters).toHaveLength(4)
    expect(content.countdown?.label).toBe(getDictionary('fr').homePage.gatherings.countdownLabel)
    expect(content.contact).toEqual({ email: undefined, phone: undefined, address: undefined, links: [] })
    expect(content.published).toEqual({})
  })

  it('un champ saisi remplace le défaut, un champ vide le conserve, sans modifier le dictionnaire', () => {
    const content = mergeSiteContent('ar', { ...empty, settings: { site_name_ar: 'اسم', tagline_ar: '  ' }, home: { title_fr: 'Titre FR' } }, now)
    expect(content.dict.meta.siteName).toBe('اسم')
    expect(content.dict.footer.tagline).toBe(getDictionary('ar').footer.tagline)
    expect(content.dict.homePage.title).toBe(getDictionary('ar').homePage.title)
    expect(getDictionary('ar').meta.siteName).not.toBe('اسم')
  })

  it('les cartes du CMS remplacent la liste par défaut et ignorent les liens inconnus', () => {
    const content = mergeSiteContent('fr', {
      ...empty,
      cards: [
        { group: 'masters', href: '/fayda/', title_fr: 'Nom', title_ar: 'اسم', body_fr: 'Rôle', image: file(1) },
        { group: 'masters', href: 'inexistant', title_fr: 'Ignoré' },
        { group: 'life', href: 'jamah/galerie', title_fr: 'Vie' },
      ],
    }, now)
    expect(content.dict.homePage.masters.items).toEqual([{ href: 'fayda', nameAr: 'اسم', name: 'Nom', role: 'Rôle', meta: '' }])
    expect(content.images.masters[0]?.src).toBe(`/cms-assets/${uuid(1)}`)
    expect(content.dict.homePage.life.items).toHaveLength(1)
    expect(content.images.life).toEqual([null])
    expect(content.dict.homePage.progression.items).toEqual(getDictionary('fr').homePage.progression.items)
  })

  it('en anglais, une fiche de liste non traduite reprend le français, les champs isolés gardent le dictionnaire', () => {
    const content = mergeSiteContent('en', {
      ...empty,
      home: { title_fr: 'Titre FR' },
      cards: [
        { group: 'masters', href: 'fayda', title_fr: 'Nom', title_en: 'Name', title_ar: 'اسم', body_fr: 'Rôle' },
        { group: 'life', href: 'jamah', title_fr: 'Vie', title_en: 'Life', body_fr: 'Corps' },
      ],
      events: [{ show_on_home: true, title_fr: 'Gamou', place_fr: 'Boubacar' }],
    }, now)
    expect(content.dict.homePage.title).toBe(getDictionary('en').homePage.title)
    expect(content.dict.homePage.masters.items).toEqual([{ href: 'fayda', nameAr: 'اسم', name: 'Name', role: 'Rôle', meta: '' }])
    expect(content.dict.homePage.life.items).toEqual([{ href: 'jamah', title: 'Life', body: 'Corps' }])
    expect(content.dict.homePage.gatherings.items[0]).toMatchObject({ title: 'Gamou', place: 'Boubacar' })
  })

  it('le compte à rebours suit l’événement mis en avant le plus proche, ou disparaît', () => {
    const withEvents = (events: CmsSiteData['events']) => mergeSiteContent('fr', { ...empty, events }, now).countdown
    const soon = withEvents([
      { featured: true, date: '2026-03-11', title_fr: 'Ziarra' },
      { featured: true, date: '2026-03-04', countdown_label_fr: 'Magal' },
    ])
    expect(soon?.label).toBe('Magal')
    expect(soon?.daysLeft).toBe(3)
    expect(withEvents([{ featured: true, date: '2026-01-01', title_fr: 'Passé' }])).toBeNull()
    expect(withEvents([{ featured: true, annual: true, date: '2020-01-01', title_fr: 'Annuel' }])?.daysLeft).toBe(306)
  })

  it('les pages publiées surchargent libellés et couvertures, et ne sont indexées qu’avec un corps', () => {
    const content = mergeSiteContent('fr', {
      ...empty,
      pages: [
        { path: 'fayda/oeuvres', nav_label_fr: 'Œuvres', body_fr: 'Texte', date_updated: '2026-02-01T00:00:00Z', cover: file(2) },
        { path: 'fayda', summary_fr: 'Intro' },
        { path: 'inconnu/page', body_fr: 'x' },
      ],
    }, now)
    expect((content.dict.sections.fayda.children as Record<string, string>).oeuvres).toBe('Œuvres')
    expect(content.dict.sections.fayda.intro).toBe('Intro')
    expect(content.published).toEqual({ 'fayda/oeuvres': { updatedAt: '2026-02-01T00:00:00Z' } })
    expect(content.covers['fayda/oeuvres']?.alt).toBe('image 2')
  })

  it('les coordonnées invalides sont écartées', () => {
    const content = mergeSiteContent('fr', {
      ...empty,
      settings: { contact_email: 'pas un courriel', youtube_url: 'javascript:alert(1)', facebook_url: 'https://facebook.com/jamah' },
    }, now)
    expect(content.contact.email).toBeUndefined()
    expect(content.contact.links).toEqual([{ label: 'Facebook', url: 'https://facebook.com/jamah' }])
  })

  it('usedImages ne renvoie pas de doublon', () => {
    const images = usedImages(mergeSiteContent('fr', empty, now))
    expect(new Set(images.map((i) => i.src)).size).toBe(images.length)
  })
})

describe('fileImage / sitePath', () => {
  it('refuse les fichiers qui ne sont pas des images', () => {
    expect(fileImage(file(3, { type: 'application/pdf' }), 'fr')).toBeNull()
    expect(fileImage(null, 'fr')).toBeNull()
    expect(fileImage(file(4, { position: 'face' }), 'fr')?.position).toBe('50% 20%')
  })

  it('normalise les chemins connus', () => {
    expect(sitePath('/jamah/contact/')).toBe('jamah/contact')
    expect(sitePath('https://exemple.org')).toBeUndefined()
  })
})
