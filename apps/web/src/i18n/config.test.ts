import { describe, expect, it } from 'vitest'
import { getDirection, isLocale, negotiateLocale } from './config'

describe('i18n config', () => {
  it('reconnaît les langues prises en charge', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('ar')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('wo')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
  })

  it('donne la direction RTL pour l’arabe', () => {
    expect(getDirection('ar')).toBe('rtl')
    expect(getDirection('fr')).toBe('ltr')
    expect(getDirection('en')).toBe('ltr')
  })

  it('négocie la langue depuis Accept-Language', () => {
    expect(negotiateLocale('ar-SA,ar;q=0.9,fr;q=0.8')).toBe('ar')
    expect(negotiateLocale('en-US,en;q=0.9,fr;q=0.5')).toBe('en')
    expect(negotiateLocale('de,en;q=0.5,fr;q=0.8')).toBe('fr')
    expect(negotiateLocale('fr;q=0.4,ar;q=0.8')).toBe('ar')
    expect(negotiateLocale('de')).toBe('fr')
    expect(negotiateLocale(null)).toBe('fr')
  })
})
