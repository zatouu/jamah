import { describe, expect, it } from 'vitest'
import { fr } from '@/i18n/dictionaries/fr'
import { ar } from '@/i18n/dictionaries/ar'
import { resolveSitePath, siteSections } from './navigation'

describe('resolveSitePath', () => {
  it('résout les rubriques et sous-rubriques connues', () => {
    expect(resolveSitePath(['tijaniyya'])).toEqual({ section: 'tijaniyya' })
    expect(resolveSitePath(['maitres', 'cheikh-ousmane-mbow'])).toEqual({
      section: 'maitres',
      child: 'cheikh-ousmane-mbow',
    })
  })

  it('rejette les chemins hors sitemap', () => {
    expect(resolveSitePath(['inconnu'])).toBeNull()
    expect(resolveSitePath(['fayda', 'inconnu'])).toBeNull()
    expect(resolveSitePath(['fayda', 'histoire', 'trop-profond'])).toBeNull()
    expect(resolveSitePath(['__proto__'])).toBeNull()
  })
})

describe('dictionnaires', () => {
  it.each([
    ['fr', fr],
    ['ar', ar],
  ])('%s couvre toutes les rubriques du sitemap', (_, dict) => {
    for (const [section, children] of Object.entries(siteSections)) {
      const entry = dict.sections[section as keyof typeof dict.sections]
      expect(entry?.label, section).toBeTruthy()
      for (const child of children) {
        expect((entry.children as Record<string, string>)[child], `${section}/${child}`).toBeTruthy()
      }
    }
  })
})
