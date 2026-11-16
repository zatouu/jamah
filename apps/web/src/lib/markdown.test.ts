import { describe, expect, it } from 'vitest'
import { parseInline, parseMarkdown, safeLink } from './markdown'

describe('parseMarkdown', () => {
  it('reconnaît titres, listes, citations et séparateurs', () => {
    const blocks = parseMarkdown('# Titre\n\nTexte\n\n- un\n- deux\n\n1. premier\n\n> cité\n\n---')
    expect(blocks.map((b) => b.type)).toEqual(['heading', 'paragraph', 'list', 'list', 'quote', 'hr'])
    expect(blocks[0]).toEqual({ type: 'heading', level: 2, id: 'titre', children: [{ type: 'text', value: 'Titre' }] })
    expect(blocks[2]).toMatchObject({ ordered: false, items: [[{ value: 'un' }], [{ value: 'deux' }]] })
    expect(blocks[3]).toMatchObject({ ordered: true })
  })

  it('conserve les retours à la ligne (poèmes)', () => {
    expect(parseMarkdown('vers un\nvers deux')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', value: 'vers un' }, { type: 'br' }, { type: 'text', value: 'vers deux' }] },
    ])
  })

  it('lit un retour à la ligne comme une espace avec breaks: false, gras compris', () => {
    expect(parseMarkdown('un **gras\nsur deux** lignes', { breaks: false })).toEqual([
      { type: 'paragraph', children: [
        { type: 'text', value: 'un ' },
        { type: 'strong', children: [{ type: 'text', value: 'gras sur deux' }] },
        { type: 'text', value: ' lignes' },
      ] },
    ])
  })

  it('garde un gras sur deux lignes avec son retour à la ligne (poèmes)', () => {
    expect(parseMarkdown('**vers un\nvers deux**')).toEqual([
      { type: 'paragraph', children: [{ type: 'strong', children: [{ type: 'text', value: 'vers un' }, { type: 'br' }, { type: 'text', value: 'vers deux' }] }] },
    ])
  })

  it('donne aux titres des ancres uniques, comme GitHub', () => {
    const ids = parseMarkdown("## 1. Découvrir l'interface\n\n## Annexe : la technique\n\n## Annexe : la technique")
      .map((b) => (b.type === 'heading' ? b.id : null))
    expect(ids).toEqual(['1-découvrir-linterface', 'annexe--la-technique', 'annexe--la-technique-1'])
  })

  it('lit les tableaux, y compris une cellule vide', () => {
    expect(parseMarkdown('| | Adresse |\n|---|---|\n| Site | **https** |\n\nfin')).toEqual([
      {
        type: 'table',
        header: [[], [{ type: 'text', value: 'Adresse' }]],
        rows: [[[{ type: 'text', value: 'Site' }], [{ type: 'strong', children: [{ type: 'text', value: 'https' }] }]]],
      },
      { type: 'paragraph', children: [{ type: 'text', value: 'fin' }] },
    ])
  })

  it('garde les blocs de code tels quels', () => {
    expect(parseMarkdown('```\n  **pas du gras**\n# pas un titre\n```')).toEqual([{ type: 'code', value: '  **pas du gras**\n# pas un titre' }])
  })

  it('prolonge un élément de liste par une ligne indentée', () => {
    expect(parseMarkdown('1. un\n   suite\n2. deux\n  - puce')).toEqual([
      { type: 'list', ordered: true, items: [[{ type: 'text', value: 'un suite' }], [{ type: 'text', value: 'deux' }]] },
      { type: 'list', ordered: false, items: [[{ type: 'text', value: 'puce' }]] },
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

  it('n’interprète rien dans le code en ligne', () => {
    expect(parseInline('`**mot**` puis **gras**')).toEqual([
      { type: 'code', value: '**mot**' },
      { type: 'text', value: ' puis ' },
      { type: 'strong', children: [{ type: 'text', value: 'gras' }] },
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
    expect(safeLink('#a b')).toBeNull()
  })

  it('accepte les ancres de la page', () => {
    expect(safeLink('#10-fonctionnalités-à-venir')).toEqual({ href: '#10-fonctionnalités-à-venir', external: false })
  })
})
