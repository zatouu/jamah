import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import type { RubricContent, RubricDocument } from '@/content/cms-pages'
import { Markdown } from '@/components/markdown'
import { SourceNatureBadge } from '@/components/rubric/rubric-parts'

/** Rendu des contenus publiés dans le CMS pour une rubrique. */

function formatDate(value: string, locale: Locale, withDay = true): string | undefined {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat(locale, {
    day: withDay ? 'numeric' : undefined,
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function RubricBody({ content, dict, locale }: { content: RubricContent; dict: Dictionary; locale: Locale }) {
  const t = dict.pageContent
  const updated = content.updatedAt ? formatDate(content.updatedAt, locale) : undefined
  return (
    <div className="space-y-6">
      {content.nature && <SourceNatureBadge nature={content.nature} dict={dict} />}
      {content.body && <Markdown source={content.body} className="max-w-3xl" />}
      {content.sources.length > 0 && (
        <section className="max-w-3xl border-t border-line pt-5">
          <h2 className="font-display text-lg text-forest-900">{t.sources}</h2>
          <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-sm text-ink/80">
            {content.sources.map((s, i) => (
              <li key={i} dir="auto">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-forest-700">
                    {s.label}
                  </a>
                ) : (
                  s.label
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
      {updated && (
        <p className="text-xs text-muted">
          {t.updated} {updated}
        </p>
      )}
    </div>
  )
}

export function DocumentList({ documents, dict, locale }: { documents: RubricDocument[]; dict: Dictionary; locale: Locale }) {
  if (!documents.length) return null
  const t = dict.pageContent
  return (
    <section className="rounded-card bg-paper p-5 shadow-soft ring-1 ring-line/60">
      <h2 className="font-display text-lg text-forest-900">{t.documents}</h2>
      <ul className="mt-4 divide-y divide-line">
        {documents.map((doc, i) => {
          const meta = [doc.author, doc.type, doc.language, doc.date ? formatDate(doc.date, locale) : undefined, doc.format].filter(Boolean)
          return (
            <li key={i} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p dir="auto" className="font-medium text-ink">{doc.title}</p>
                {meta.length > 0 && <p className="mt-0.5 text-xs text-muted">{meta.join(' · ')}</p>}
                {doc.summary && <p dir="auto" className="mt-1 text-sm text-muted">{doc.summary}</p>}
              </div>
              {doc.href ? (
                <a href={doc.href} className="shrink-0 rounded-full border border-forest-700/30 px-3 py-1 text-sm text-forest-800 hover:bg-forest-50">
                  {t.download}
                </a>
              ) : (
                <span className="shrink-0 text-xs text-muted">{t.onRequest}</span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
