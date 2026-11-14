import Link from 'next/link'
import { getDirection, locales } from '@/i18n/config'
import { getDictionary } from '@/i18n/get-dictionary'

// not-found ne reçoit pas les paramètres de route : message dans toutes les langues.
export default function NotFound() {
  return (
    <div className="container-page grid gap-10 py-24 md:grid-cols-3">
      {locales.map((lang) => ({ dict: getDictionary(lang), lang, dir: getDirection(lang) })).map(({ dict, lang, dir }) => (
        <div key={lang} lang={lang} dir={dir}>
          <h1 className="font-display text-4xl text-forest-900">{dict.notFound.title}</h1>
          <p className="mt-4 text-lg text-muted">{dict.notFound.body}</p>
          <Link href={`/${lang}`} className="mt-6 inline-block text-forest-700 hover:underline">
            {dict.placeholder.back}
          </Link>
        </div>
      ))}
    </div>
  )
}
