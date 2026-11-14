import { describe, expect, it } from 'vitest'
import { fr } from '@/i18n/dictionaries/fr'
import { ar } from '@/i18n/dictionaries/ar'
import { en } from '@/i18n/dictionaries/en'
import { expectedContent } from '@/content/editorial-spec'
import { isKnownPath, resolveSitePath, siteSections, type SectionSlug } from './navigation'

describe('resolveSitePath', () => {
  it('résout les rubriques et sous-rubriques connues', () => {
    expect(resolveSitePath(['tijaniyya'])).toEqual({ section: 'tijaniyya' })
    expect(resolveSitePath(['cheikh-ousmane-mbow', 'videotheque'])).toEqual({ section: 'cheikh-ousmane-mbow', child: 'videotheque' })
  })

  it('rejette les chemins hors sitemap', () => {
    expect(resolveSitePath(['maitres'])).toBeNull()
    expect(resolveSitePath(['fayda', 'inconnu'])).toBeNull()
    expect(resolveSitePath(['fayda', 'presentation', 'trop-profond'])).toBeNull()
    expect(resolveSitePath(['__proto__'])).toBeNull()
  })

  it('reconnaît les pages autonomes', () => {
    expect(isKnownPath('')).toBe(true)
    expect(isKnownPath('credits')).toBe(true)
    expect(isKnownPath('bibliotheque/recherche?q=dhikr')).toBe(true)
    expect(isKnownPath('maitres/cheikh-ould-khayri')).toBe(false)
  })
})

/** Collecte toutes les valeurs `href` internes d'un dictionnaire. */
function collectHrefs(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((n) => collectHrefs(n, out))
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'href' && typeof value === 'string') out.push(value)
      else collectHrefs(value, out)
    }
  }
  return out
}

describe.each([
  ['fr', fr],
  ['ar', ar],
  ['en', en],
])('dictionnaire %s', (_, dict) => {
  it('couvre toutes les rubriques du sitemap', () => {
    for (const [section, children] of Object.entries(siteSections)) {
      const entry = dict.sections[section as SectionSlug]
      expect(entry?.label, section).toBeTruthy()
      expect(entry?.intro, section).toBeTruthy()
      for (const child of children) {
        expect((entry.children as Record<string, string>)[child], `${section}/${child}`).toBeTruthy()
      }
      expect(Object.keys(entry.children).sort(), section).toEqual([...children].sort())
    }
  })

  it('ne contient que des liens internes valides', () => {
    for (const href of collectHrefs(dict.homePage)) expect(isKnownPath(href), href).toBe(true)
    for (const group of dict.homePage.mbow.groups) {
      for (const child of group.items) expect(isKnownPath(`cheikh-ousmane-mbow/${child}`), child).toBe(true)
    }
  })

  it('décrit les types de contenus attendus de chaque rubrique', () => {
    for (const [section, children] of Object.entries(siteSections)) {
      for (const child of [undefined, ...children]) {
        for (const kind of expectedContent(section as SectionSlug, child)) expect(dict.contentKinds[kind], kind).toBeTruthy()
      }
    }
  })
})

it('les dictionnaires FR et AR ont la même structure', () => {
  const shape = (node: unknown): unknown =>
    Array.isArray(node) ? node.map(shape) : node && typeof node === 'object' ? Object.fromEntries(Object.entries(node).map(([k, v]) => [k, shape(v)])) : typeof node
  expect(shape(ar)).toEqual(shape(fr))
})
