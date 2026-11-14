import { describe, expect, it } from 'vitest'
import { parseInline, parseMarkdown, safeLink } from './markdown'

describe('parseMarkdown', () => {
  it('reconnaît titres, listes, citations et séparateurs', () => {
    const blocks = parseMarkdown('# Titre\n\nTexte\n\n- un\n- deux\n\n1. premier\n\n> cité\n\n---')
    expect(blocks.map((b) => b.type)).toEqual(['heading', 'paragraph', 'list', 'list', 'quote', 'hr'])
    expect(blocks[0]).toEqual({ type: 'heading', level: 2, children: [{ type: 'text', value: 'Titre' }] })
    expect(blocks[2]).toMatchObject({ ordered: false, items: [[{ value: 'un' }], [{ value: 'deux' }]] })
    expect(blocks[3]).toMatchObject({ ordered: true })
  })

  it('conserve les retours à la ligne (poèmes)', () => {
    expect(parseMarkdown('vers un\nvers deux')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', value: 'vers un' }, { type: 'br' }, { type: 'text', value: 'vers deux' }] },
    ])
  })

  it('laisse le HTML sous forme de texte', () => {
    expect(parseMarkdown('<script>alert(1)</script>')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', value: '<script>alert(1)</script>' }] },
    ])
  })
})

describe('parseInline', () => {
  it('gère gras, italique et liens', () => {
    expect(parseInline('**gras** et *italique* [lien](https://exemple.org)')).toEqual([
      { type: 'strong', children: [{ type: 'text', value: 'gras' }] },
      { type: 'text', value: ' et ' },
      { type: 'em', children: [{ type: 'text', value: 'italique' }] },
      { type: 'text', value: ' ' },
      { type: 'link', href: 'https://exemple.org', external: true, children: [{ type: 'text', value: 'lien' }] },
    ])
  })

  it('ignore le soulignement à l’intérieur des mots', () => {
    expect(parseInline('snake_case_name')).toEqual([{ type: 'text', value: 'snake_case_name' }])
  })

  it('neutralise les liens dangereux', () => {
    expect(parseInline('[clic](javascript:alert(1))')).toEqual([{ type: 'text', value: 'clic)' }])
  })
})

describe('safeLink', () => {
  it('accepte http(s), mailto et chemins internes', () => {
    expect(safeLink('https://a.org')).toEqual({ href: 'https://a.org', external: true })
    expect(safeLink('mailto:contact@jamah.org')).toEqual({ href: 'mailto:contact@jamah.org', external: true })
    expect(safeLink('/fr/fayda')).toEqual({ href: '/fr/fayda', external: false })
  })

  it('refuse les autres schémas', () => {
    expect(safeLink('javascript:alert(1)')).toBeNull()
    expect(safeLink('//evil.example')).toBeNull()
    expect(safeLink('data:text/html,x')).toBeNull()
  })
})
