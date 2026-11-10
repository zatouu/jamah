import { describe, expect, it } from 'vitest'
import { MARK_END, MARK_START, safeHitHref, splitHighlights } from './search'

describe('splitHighlights', () => {
  it('isole les mots trouvés', () => {
    expect(splitHighlights(`Le ${MARK_START}dhikr${MARK_END} du vendredi`)).toEqual([
      { text: 'Le ', mark: false },
      { text: 'dhikr', mark: true },
      { text: ' du vendredi', mark: false },
    ])
  })

  it('laisse le HTML sous forme de texte', () => {
    expect(splitHighlights('<script>x</script>')).toEqual([{ text: '<script>x</script>', mark: false }])
  })
})

describe('safeHitHref', () => {
  it('accepte les liens internes et http(s)', () => {
    expect(safeHitHref('/fr/fayda/oeuvres', 'p-12')).toBe('/fr/fayda/oeuvres#p-12')
    expect(safeHitHref('https://www.youtube.com/watch?v=abc')).toBe('https://www.youtube.com/watch?v=abc')
  })

  it('refuse les schémas dangereux', () => {
    expect(safeHitHref('javascript:alert(1)')).toBeNull()
    expect(safeHitHref('//evil.example')).toBeNull()
    expect(safeHitHref(null)).toBeNull()
  })
})
