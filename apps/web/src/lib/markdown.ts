/**
 * Markdown restreint pour les textes saisis dans le CMS. Aucun HTML n'est interprété :
 * le résultat est un arbre rendu en éléments React (pas de dangerouslySetInnerHTML).
 * Pris en charge : titres (#, ##, ###), paragraphes (un retour à la ligne est conservé, utile pour les poèmes),
 * listes (-, *, 1.), citations (>), séparateur (---), **gras**, *italique*, [liens](https://…).
 */

export type Inline =
  | { type: 'text'; value: string }
  | { type: 'strong' | 'em'; children: Inline[] }
  | { type: 'link'; href: string; external: boolean; children: Inline[] }
  | { type: 'br' }

export type Block =
  | { type: 'heading'; level: 2 | 3 | 4; children: Inline[] }
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] }
  | { type: 'quote'; children: Block[] }
  | { type: 'hr' }

const INLINE = /\*\*(.+?)\*\*|__(.+?)__|\*(?![\s*])(.+?)\*|(?<![\p{L}\p{N}_])_(?![\s_])(.+?)_(?![\p{L}\p{N}_])|\[([^\]\n]+)\]\(([^)\s]+)\)|\n/u

/** Liens acceptés : http(s), mailto et chemins internes (« /fr/… »). */
export function safeLink(href: string): { href: string; external: boolean } | null {
  if (/^https?:\/\/[^\s/]/i.test(href)) return { href, external: true }
  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(href)) return { href, external: true }
  if (/^\/(?!\/)/.test(href)) return { href, external: false }
  return null
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
    if (m[0] === '\n') {
      out.push({ type: 'br' })
    } else if (m[1] !== undefined || m[2] !== undefined) {
      out.push({ type: 'strong', children: parseInline(m[1] ?? m[2]) })
    } else if (m[3] !== undefined || m[4] !== undefined) {
      out.push({ type: 'em', children: parseInline(m[3] ?? m[4]) })
    } else {
      const link = safeLink(m[6])
      if (link) out.push({ type: 'link', ...link, children: parseInline(m[5]) })
      else for (const node of parseInline(m[5])) {
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

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const blocks: Block[] = []
  let paragraph: string[] = []

  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', children: parseInline(paragraph.join('\n').trim()) })
    paragraph = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) {
      flush()
      continue
    }
    const heading = HEADING.exec(line)
    if (heading) {
      flush()
      const level = Math.min(heading[1].length + 1, 4) as 2 | 3 | 4
      blocks.push({ type: 'heading', level, children: parseInline(heading[2]) })
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
      blocks.push({ type: 'quote', children: parseMarkdown(quoted.join('\n')) })
      continue
    }
    const listPattern = BULLET.test(line) ? BULLET : ORDERED.test(line) ? ORDERED : null
    if (listPattern) {
      flush()
      const items: Inline[][] = []
      while (i < lines.length && listPattern.test(lines[i])) items.push(parseInline(listPattern.exec(lines[i++])![1].trim()))
      i--
      blocks.push({ type: 'list', ordered: listPattern === ORDERED, items })
      continue
    }
    paragraph.push(line.trim())
  }
  flush()
  return blocks
}
