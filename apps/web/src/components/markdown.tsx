import type { ReactNode } from 'react'
import { parseMarkdown, type Block, type Inline } from '@/lib/markdown'

function renderInline(nodes: Inline[]): ReactNode[] {
  return nodes.map((node, i) => {
    switch (node.type) {
      case 'text':
        return node.value
      case 'br':
        return <br key={i} />
      case 'strong':
        return <strong key={i} className="font-semibold text-ink">{renderInline(node.children)}</strong>
      case 'em':
        return <em key={i}>{renderInline(node.children)}</em>
      case 'code':
        return <code key={i} dir="ltr" className="rounded bg-forest-50 px-1.5 py-0.5 font-mono text-[0.9em] text-forest-900 [overflow-wrap:anywhere]">{node.value}</code>
      case 'link':
        return (
          <a key={i} href={node.href} className="text-forest-700 underline underline-offset-4 hover:text-forest-900"
            {...(node.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {renderInline(node.children)}
          </a>
        )
    }
  })
}

const headingClass = {
  2: 'mt-10 font-display text-2xl text-forest-900 md:text-3xl',
  3: 'mt-8 font-display text-xl text-forest-900',
  4: 'mt-6 text-base font-semibold text-forest-900',
} as const

function renderBlock(block: Block, i: number): ReactNode {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as const
      return <Tag key={i} id={block.id} dir="auto" className={`${headingClass[block.level]} scroll-mt-24`}>{renderInline(block.children)}</Tag>
    }
    case 'table':
      return (
        <div key={i} className="mt-6 overflow-x-auto rounded-xl ring-1 ring-line">
          <table className="w-full min-w-[32rem] border-collapse text-start text-sm">
            <thead className="bg-forest-50 text-forest-900">
              <tr>{block.header.map((cell, j) => <th key={j} dir="auto" className="px-3 py-2 text-start font-semibold">{renderInline(cell)}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-line">
              {block.rows.map((row, j) => (
                <tr key={j}>{row.map((cell, k) => <td key={k} dir="auto" className="px-3 py-2 align-top">{renderInline(cell)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'code':
      return <pre key={i} dir="ltr" className="mt-6 overflow-x-auto rounded-xl bg-forest-900 p-4 font-mono text-xs leading-relaxed text-ivory md:text-sm">{block.value}</pre>
    case 'paragraph':
      return <p key={i} dir="auto" className="mt-4 leading-relaxed">{renderInline(block.children)}</p>
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag key={i} className={`mt-4 space-y-1.5 ps-6 ${block.ordered ? 'list-decimal' : 'list-disc'} marker:text-ochre`}>
          {block.items.map((item, j) => <li key={j} dir="auto">{renderInline(item)}</li>)}
        </Tag>
      )
    }
    case 'quote':
      return <blockquote key={i} className="mt-6 border-s-2 border-ochre ps-5 text-forest-900">{block.children.map(renderBlock)}</blockquote>
    case 'hr':
      return <hr key={i} className="my-8 border-line" />
  }
}

/** Texte Markdown (CMS, guide), rendu sans jamais interpréter de HTML. `breaks` : voir `MarkdownOptions`. */
export function Markdown({ source, className = '', breaks = true }: { source: string; className?: string; breaks?: boolean }) {
  return <div className={`text-ink/90 [&>*:first-child]:mt-0 ${className}`}>{parseMarkdown(source, { breaks }).map(renderBlock)}</div>
}
