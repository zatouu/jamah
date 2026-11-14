import type { Locale } from './config'
import { ar } from './dictionaries/ar'
import { en } from './dictionaries/en'
import { fr, type Dictionary } from './dictionaries/fr'

const dictionaries: Record<Locale, Dictionary> = { fr, ar, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
