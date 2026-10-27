'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/i18n/config'
import { switchLocalePath } from '@/lib/paths'

type Props = { locale: Locale; label: string; ariaLabel: string }

export function LanguageSwitcher({ locale, label, ariaLabel }: Props) {
  const pathname = usePathname() ?? `/${locale}`
  const target: Locale = locale === 'fr' ? 'ar' : 'fr'
  return (
    <Link
      href={switchLocalePath(pathname, target)}
      hrefLang={target}
      lang={target}
      aria-label={ariaLabel}
      className="rounded-full border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-forest-600 hover:text-forest-700"
    >
      {label}
    </Link>
  )
}
