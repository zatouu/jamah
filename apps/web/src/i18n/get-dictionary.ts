import type { Locale } from './config'
import { ar } from './dictionaries/ar'
import { fr, type Dictionary } from './dictionaries/fr'

const dictionaries: Record<Locale, Dictionary> = { fr, ar }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
