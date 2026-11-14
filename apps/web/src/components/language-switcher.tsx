'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getDirection, localeNames, locales, localeShortNames, type Locale } from '@/i18n/config'
import { switchLocalePath } from '@/lib/paths'

type Props = { locale: Locale; ariaLabel: string }

export function LanguageSwitcher({ locale, ariaLabel }: Props) {
  const pathname = usePathname() ?? `/${locale}`
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex items-center rounded-full border border-line p-0.5 text-sm">
        {locales.map((target) => (
          <li key={target}>
            {target === locale ? (
              <span aria-current="true" title={localeNames[target]} className="block rounded-full bg-forest-800 px-2.5 py-1 text-ivory">
                <span aria-hidden="true">{localeShortNames[target]}</span>
                <span className="sr-only">{localeNames[target]}</span>
              </span>
            ) : (
              <Link
                href={switchLocalePath(pathname, target)}
                hrefLang={target}
                lang={target}
                dir={getDirection(target)}
                title={localeNames[target]}
                className="block rounded-full px-2.5 py-1 text-ink transition-colors hover:text-forest-700"
              >
                <span aria-hidden="true">{localeShortNames[target]}</span>
                <span className="sr-only">{localeNames[target]}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
