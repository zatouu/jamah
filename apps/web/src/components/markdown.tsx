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
      return <Tag key={i} dir="auto" className={headingClass[block.level]}>{renderInline(block.children)}</Tag>
    }
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

/** Texte Markdown venant du CMS, rendu sans jamais interpréter de HTML. */
export function Markdown({ source, className = '' }: { source: string; className?: string }) {
  return <div className={`text-ink/90 [&>*:first-child]:mt-0 ${className}`}>{parseMarkdown(source).map(renderBlock)}</div>
}
