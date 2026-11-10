import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import type { ContentKind } from '@/content/editorial-spec'
import { ArrowIcon } from '@/components/icons'
import { localePath } from '@/lib/paths'

const natureTone: Record<string, string> = {
  documented: 'bg-forest-50 text-forest-800 border-forest-100',
  testimony: 'bg-sand text-ink border-line',
  community: 'bg-ochre-soft text-ochre border-ochre/20',
  interpretation: 'bg-paper text-forest-700 border-forest-100',
  jamah: 'bg-forest-800 text-ivory border-forest-800',
}

/** Badge de nature d'une information (réutilisé par les futures fiches, chronologies et récits). */
export function SourceNatureBadge({ nature, dict }: { nature: keyof Dictionary['sourceNatures']['items']; dict: Dictionary }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${natureTone[nature]}`}>
      {dict.sourceNatures.items[nature].label}
    </span>
  )
}

export function SourceNatureLegend({ dict }: { dict: Dictionary }) {
  const t = dict.sourceNatures
  return (
    <section className="rounded-card bg-paper p-5 shadow-soft ring-1 ring-line/60">
      <h2 className="font-display text-lg text-forest-900">{t.title}</h2>
      <p className="mt-1 text-sm text-muted">{t.lead}</p>
      <dl className="mt-4 space-y-3">
        {(Object.keys(t.items) as (keyof typeof t.items)[]).map((key) => (
          <div key={key} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
            <dt className="shrink-0"><SourceNatureBadge nature={key} dict={dict} /></dt>
            <dd className="text-sm text-muted">{t.items[key].body}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function ExpectedContent({ kinds, dict }: { kinds: ContentKind[]; dict: Dictionary }) {
  return (
    <section className="rounded-card bg-forest-50/70 p-5">
      <h2 className="font-display text-lg text-forest-900">{dict.placeholder.expected}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {kinds.map((kind) => (
          <li key={kind} className="rounded-full border border-line bg-paper px-3 py-1 text-sm text-ink/80">
            {dict.contentKinds[kind]}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ProvideDocuments({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.placeholder
  return (
    <section className="rounded-card bg-ochre-soft p-5">
      <h2 className="font-display text-lg text-forest-900">{t.provideTitle}</h2>
      <p className="mt-1 text-sm leading-relaxed text-ink/75">{t.provideBody}</p>
      <Link href={localePath(locale, 'jamah/contact')} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-forest-800 hover:underline">
        {t.provideCta}
        <ArrowIcon />
      </Link>
    </section>
  )
}

export function StatusBadge({ label }: { label: string }) {
  return <span className="inline-flex rounded-full bg-ochre-soft px-3 py-1 text-xs font-medium text-ochre">{label}</span>
}
