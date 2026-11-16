/**
 * Markdown restreint pour les textes saisis dans le CMS. Aucun HTML n'est interprété :
 * le résultat est un arbre rendu en éléments React (pas de dangerouslySetInnerHTML).
 * Pris en charge : titres (#, ##, ###, avec ancre), paragraphes (un retour à la ligne est conservé, utile pour les
 * poèmes), listes (-, *, 1. ; une ligne indentée prolonge l'élément), citations (>), séparateur (---), tableaux (| a | b |),
 * blocs de code (```), **gras**, *italique*, `code`, [liens](https://…) et ancres ([…](#titre)).
 */

export type Inline =
  | { type: 'text'; value: string }
  | { type: 'strong' | 'em'; children: Inline[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; external: boolean; children: Inline[] }
  | { type: 'br' }

export type Block =
  | { type: 'heading'; level: 2 | 3 | 4; id: string; children: Inline[] }
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] }
  | { type: 'quote'; children: Block[] }
  | { type: 'table'; header: Inline[][]; rows: Inline[][][] }
  | { type: 'code'; value: string }
  | { type: 'hr' }

// Gras et italique peuvent s'étendre sur plusieurs lignes d'un même paragraphe.
const INLINE = /`(?<code>[^`\n]+)`|\*\*(?<b1>[\s\S]+?)\*\*|__(?<b2>[\s\S]+?)__|\*(?![\s*])(?<i1>[\s\S]+?)\*|(?<![\p{L}\p{N}_])_(?![\s_])(?<i2>[\s\S]+?)_(?![\p{L}\p{N}_])|\[(?<label>[^\]\n]+)\]\((?<href>[^)\s]+)\)|\n/u

/** Liens acceptés : http(s), mailto, chemins internes (« /fr/… ») et ancres de la page (« #titre »). */
export function safeLink(href: string): { href: string; external: boolean } | null {
  if (/^https?:\/\/[^\s/]/i.test(href)) return { href, external: true }
  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(href)) return { href, external: true }
  if (/^\/(?!\/)/.test(href)) return { href, external: false }
  if (/^#[\p{L}\p{N}_-]+$/u.test(href)) return { href, external: false }
  return null
}

/** Ancre d'un titre, comme GitHub : minuscules, ponctuation retirée, espaces -> tirets. */
export function headingId(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-')
}

function pushText(out: Inline[], value: string) {
  if (!value) return
  const last = out[out.length - 1]
  if (last?.type === 'text') last.value += value
  else out.push({ type: 'text', value })
}

export function parseInline(source: string): Inline[] {
  const out: Inline[] = []
  let rest = source
  while (rest) {
    const m = INLINE.exec(rest)
    if (!m) {
      pushText(out, rest)
      break
    }
    pushText(out, rest.slice(0, m.index))
    const g = m.groups!
    if (m[0] === '\n') {
      out.push({ type: 'br' })
    } else if (g.code !== undefined) {
      out.push({ type: 'code', value: g.code })
    } else if (g.b1 !== undefined || g.b2 !== undefined) {
      out.push({ type: 'strong', children: parseInline(g.b1 ?? g.b2) })
    } else if (g.i1 !== undefined || g.i2 !== undefined) {
      out.push({ type: 'em', children: parseInline(g.i1 ?? g.i2) })
    } else {
      const link = safeLink(g.href)
      if (link) out.push({ type: 'link', ...link, children: parseInline(g.label) })
      else for (const node of parseInline(g.label)) {
        if (node.type === 'text') pushText(out, node.value)
        else out.push(node)
      }
    }
    rest = rest.slice(m.index + m[0].length)
  }
  return out
}

const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/
const HR = /^\s*([-*_])(\s*\1){2,}\s*$/
const QUOTE = /^\s*>\s?(.*)$/
const BULLET = /^\s*[-*+]\s+(.*)$/
const ORDERED = /^\s*\d+[.)]\s+(.*)$/
const FENCE = /^\s*```/
const TABLE_ROW = /^\s*\|.*\|\s*$/
const TABLE_RULE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/
const CONTINUATION = /^\s{2,}\S/

function tableCells(line: string): Inline[][] {
  return line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => parseInline(cell.trim()))
}

export type MarkdownOptions = {
  /** true (CMS, poèmes) : un retour à la ligne est conservé ; false : il est lu comme une espace (texte coupé à la main). */
  breaks?: boolean
  ids?: Map<string, number>
}

export function parseMarkdown(source: string, options: MarkdownOptions = {}): Block[] {
  const { breaks = true, ids = new Map<string, number>() } = options
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const blocks: Block[] = []
  let paragraph: string[] = []

  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', children: parseInline(paragraph.join(breaks ? '\n' : ' ').trim()) })
    paragraph = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) {
      flush()
      continue
    }
    if (FENCE.test(line)) {
      flush()
      const code: string[] = []
      while (++i < lines.length && !FENCE.test(lines[i])) code.push(lines[i])
      blocks.push({ type: 'code', value: code.join('\n') })
      continue
    }
    const heading = HEADING.exec(line)
    if (heading) {
      flush()
      const level = Math.min(heading[1].length + 1, 4) as 2 | 3 | 4
      // Ancre unique dans le document (« titre », « titre-1 »…)
      const base = headingId(heading[2]) || 'section'
      const seen = ids.get(base) ?? 0
      ids.set(base, seen + 1)
      blocks.push({ type: 'heading', level, id: seen ? `${base}-${seen}` : base, children: parseInline(heading[2]) })
      continue
    }
    if (TABLE_ROW.test(line) && TABLE_RULE.test(lines[i + 1] ?? '')) {
      flush()
      const header = tableCells(line)
      const rows: Inline[][][] = []
      i += 2
      while (i < lines.length && TABLE_ROW.test(lines[i])) rows.push(tableCells(lines[i++]))
      i--
      blocks.push({ type: 'table', header, rows })
      continue
    }
    if (HR.test(line)) {
      flush()
      blocks.push({ type: 'hr' })
      continue
    }
    if (QUOTE.test(line)) {
      flush()
      const quoted: string[] = []
      while (i < lines.length && QUOTE.test(lines[i])) quoted.push(QUOTE.exec(lines[i++])![1])
      i--
      blocks.push({ type: 'quote', children: parseMarkdown(quoted.join('\n'), { breaks, ids }) })
      continue
    }
    const listPattern = BULLET.test(line) ? BULLET : ORDERED.test(line) ? ORDERED : null
    if (listPattern) {
      flush()
      const items: string[] = []
      for (; i < lines.length; i++) {
        const item = listPattern.exec(lines[i])
        if (item) items.push(item[1].trim())
        else if (CONTINUATION.test(lines[i]) && !BULLET.test(lines[i]) && !ORDERED.test(lines[i])) items[items.length - 1] += ` ${lines[i].trim()}`
        else break
      }
      i--
      blocks.push({ type: 'list', ordered: listPattern === ORDERED, items: items.map(parseInline) })
      continue
    }
    paragraph.push(line.trim())
  }
  flush()
  return blocks
}
