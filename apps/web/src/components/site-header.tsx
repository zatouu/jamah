import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import { primaryNav, siteSections } from '@/lib/navigation'
import { localePath } from '@/lib/paths'
import { LanguageSwitcher } from './language-switcher'
import { SearchIcon } from './icons'
import { DesktopNav, MobileNav, type NavItem } from './site-nav'

type Props = { locale: Locale; dict: Dictionary }

export function SiteHeader({ locale, dict }: Props) {
  const items: NavItem[] = primaryNav.map((slug) => {
    const section = dict.sections[slug]
    const children = section.children as Record<string, string>
    return {
      href: localePath(locale, slug),
      label: section.label,
      children: siteSections[slug].map((child) => ({ href: localePath(locale, `${slug}/${child}`), label: children[child] })),
    }
  })
  const labels = { mainNav: dict.a11y.mainNav, openMenu: dict.nav.openMenu, closeMenu: dict.nav.closeMenu, overview: dict.placeholder.overview }

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href={localePath(locale)} className="flex shrink-0 items-center gap-3" aria-label={dict.meta.siteName}>
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-forest-800 font-display text-sm text-ivory">
            {dict.brand.mark}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted rtl:tracking-normal">{dict.brand.prefix}</span>
            <span className="font-display text-[1.05rem] text-forest-900">{dict.brand.name}</span>
          </span>
        </Link>

        <DesktopNav items={items} labels={labels} />

        <div className="ms-auto flex items-center gap-2 xl:ms-2">
          <Link
            href={localePath(locale, 'bibliotheque/recherche')}
            aria-label={dict.search.label}
            className="grid size-9 place-items-center rounded-full text-ink/80 transition-colors hover:bg-forest-50 hover:text-forest-800"
          >
            <SearchIcon />
          </Link>
          <LanguageSwitcher locale={locale} ariaLabel={dict.a11y.switchLanguage} />
          <MobileNav items={items} labels={labels} />
        </div>
      </div>
    </header>
  )
}
