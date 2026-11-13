import { NextResponse, type NextRequest } from 'next/server'
import { isLocale, negotiateLocale } from '@/i18n/config'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const first = pathname.split('/')[1]
  if (isLocale(first)) return NextResponse.next()

  const locale = negotiateLocale(request.headers.get('accept-language'))
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|cms-assets|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}
