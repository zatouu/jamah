import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import { localePath } from '@/lib/paths'
import { SearchIcon } from './icons'

type Props = { locale: Locale; dict: Dictionary; defaultValue?: string; withSuggestions?: boolean }

export function SearchForm({ locale, dict, defaultValue, withSuggestions = false }: Props) {
  const action = localePath(locale, 'bibliotheque/recherche')
  return (
    <div className="w-full">
      <form action={action} method="get" role="search" className="group relative">
        <label htmlFor="site-search" className="sr-only">
          {dict.search.label}
        </label>
        <span className="pointer-events-none absolute inset-y-0 start-5 grid place-items-center text-muted">
          <SearchIcon />
        </span>
        <input
          id="site-search"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={dict.search.placeholder}
          autoComplete="off"
          className="h-14 w-full rounded-full border border-line bg-paper ps-13 pe-32 text-base text-ink shadow-[0_1px_0_rgb(0_0_0/0.02)] outline-none transition placeholder:text-muted/80 focus:border-forest-600 focus:ring-4 focus:ring-forest-100"
        />
        <button
          type="submit"
          className="absolute inset-y-1.5 end-1.5 rounded-full bg-forest-800 px-5 text-sm font-medium text-ivory transition-colors hover:bg-forest-700"
        >
          {dict.search.submit}
        </button>
      </form>

      {withSuggestions && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">{dict.search.suggestionsLabel} :</span>
          {dict.search.suggestions.map((term) => (
            <Link
              key={term}
              href={`${action}?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-line bg-paper/70 px-3 py-1 text-ink/80 transition-colors hover:border-forest-600 hover:text-forest-800"
            >
              {term}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
