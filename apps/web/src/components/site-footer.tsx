import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import { siteSections, type SectionSlug } from '@/lib/navigation'
import { localePath } from '@/lib/paths'

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const sections = Object.keys(siteSections) as SectionSlug[]
  return (
    <footer className="border-t border-line bg-sand/60">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.2fr_2fr]">
        <div className="max-w-sm space-y-3">
          <p className="font-display text-xl text-forest-900">{dict.meta.siteName}</p>
          <p className="text-sm leading-relaxed text-muted">{dict.footer.tagline}</p>
          <p className="text-sm leading-relaxed text-muted">{dict.footer.editorial}</p>
        </div>
        <nav aria-label={dict.footer.explore}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-3">
            {sections.map((slug) => (
              <li key={slug}>
                <Link href={localePath(locale, slug)} className="text-ink/80 transition-colors hover:text-forest-700">
                  {dict.sections[slug].label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line/70">
        <div className="container-page flex flex-wrap justify-between gap-3 py-5 text-xs text-muted">
          <p>
            © {new Date().getFullYear()} {dict.meta.siteName}. {dict.footer.rights}
          </p>
          <Link href={localePath(locale, 'credits')} className="hover:text-forest-700">
            {dict.homePage.photoCredits}
          </Link>
        </div>
      </div>
    </footer>
  )
}
