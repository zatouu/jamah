import type { NextConfig } from 'next'

const csp = [
  "default-src 'self'",
  // Next.js injecte des scripts inline (hydratation) ; JSON-LD inline.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://i.ytimg.com",
  "font-src 'self'",
  "connect-src 'self'",
  'frame-src https://www.youtube-nocookie.com',
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  // Anciennes adresses (avant la refonte du plan du site) → nouvelles rubriques.
  async redirects() {
    const lang = ':lang(fr|ar)'
    return [
      { source: `/${lang}/maitres`, destination: '/:lang/cheikh-ould-khayri', permanent: true },
      { source: `/${lang}/maitres/:person(cheikh-ould-khayri|cheikh-ousmane-mbow)`, destination: '/:lang/:person', permanent: true },
      { source: `/${lang}/comprendre-islam/hadith-sunna`, destination: '/:lang/comprendre-islam/sunna-hadith', permanent: true },
      { source: `/${lang}/comprendre-islam/croyance`, destination: '/:lang/comprendre-islam/tawhid', permanent: true },
      { source: `/${lang}/comprendre-islam/jurisprudence`, destination: '/:lang/comprendre-islam/fiqh', permanent: true },
      { source: `/${lang}/comprendre-islam/spiritualite`, destination: '/:lang/comprendre-islam/tazkiya', permanent: true },
      { source: `/${lang}/tijaniyya/textes`, destination: '/:lang/tijaniyya/references', permanent: true },
      { source: `/${lang}/fayda/histoire`, destination: '/:lang/fayda/presentation', permanent: true },
      { source: `/${lang}/fayda/themes`, destination: '/:lang/fayda/tawhid-marifa', permanent: true },
      { source: `/${lang}/jamah/histoire-mission`, destination: '/:lang/jamah/histoire', permanent: true },
      { source: `/${lang}/jamah/identite-spirituelle`, destination: '/:lang/jamah/presentation', permanent: true },
      { source: `/${lang}/jamah/activites`, destination: '/:lang/jamah/organisation', permanent: true },
      { source: `/${lang}/bibliotheque/ouvrages`, destination: '/:lang/bibliotheque/documents', permanent: true },
    ]
  },
}

export default nextConfig
