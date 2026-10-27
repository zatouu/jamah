import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import { primaryNav } from '@/lib/navigation'
import { localePath } from '@/lib/paths'
import { LanguageSwitcher } from './language-switcher'
import { MenuIcon, SearchIcon } from './icons'

type Props = { locale: Locale; dict: Dictionary }

export function SiteHeader({ locale, dict }: Props) {
  const navLinks = primaryNav.map((slug) => (
    <li key={slug}>
      <Link
        href={localePath(locale, slug)}
        className="block rounded-lg px-3 py-2 text-[0.95rem] text-ink/80 transition-colors hover:bg-forest-50 hover:text-forest-800"
      >
        {dict.sections[slug].label}
      </Link>
    </li>
  ))

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href={localePath(locale)} className="group flex items-center gap-3" aria-label={dict.meta.siteName}>
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-forest-800 font-display text-sm text-ivory">
            {dict.brand.mark}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted rtl:tracking-normal">
              {dict.brand.prefix}
            </span>
            <span className="font-display text-[1.05rem] text-forest-900">{dict.brand.name}</span>
          </span>
        </Link>

        <nav aria-label={dict.a11y.mainNav} className="ms-auto hidden lg:block">
          <ul className="flex items-center gap-0.5">{navLinks}</ul>
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-2">
          <Link
            href={localePath(locale, 'bibliotheque/recherche')}
            aria-label={dict.search.label}
            className="grid size-9 place-items-center rounded-full text-ink/80 transition-colors hover:bg-forest-50 hover:text-forest-800"
          >
            <SearchIcon />
          </Link>
          <LanguageSwitcher locale={locale} label={dict.langLabel} ariaLabel={dict.a11y.switchLanguage} />

          <details className="group relative lg:hidden">
            <summary
              aria-label={dict.a11y.menu}
              className="grid size-9 cursor-pointer list-none place-items-center rounded-full text-ink hover:bg-forest-50 [&::-webkit-details-marker]:hidden"
            >
              <MenuIcon />
            </summary>
            <nav
              aria-label={dict.a11y.mainNav}
              className="absolute end-0 top-12 w-64 rounded-card border border-line bg-paper p-2 shadow-[0_12px_40px_-12px_rgb(15_61_46/0.25)]"
            >
              <ul>{navLinks}</ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  )
}
