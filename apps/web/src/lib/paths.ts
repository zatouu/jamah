import type { Locale } from '@/i18n/config'

export function localePath(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '')
  return clean ? `/${locale}/${clean}` : `/${locale}`
}

/** Remplace le préfixe de langue d'un chemin existant. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const [, , ...rest] = pathname.split('/')
  return localePath(target, rest.join('/'))
}
