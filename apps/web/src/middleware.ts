/**
 * @file middleware.ts
 * @package @islamic/web
 * @description Internationalized routing middleware for Next.js App Router.
 *              Directs requests to localized paths (/en, /ar, /ur) while preserving
 *              un-prefixed API routes and static assets.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '@islamic/ui';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Bypass robots.txt and sitemap.xml from localized route rewriting
  if (
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }

  // 1. Check if the pathname begins with a supported locale
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 2. Determine target locale from cookie, Accept-Language, or fallback to DEFAULT_LOCALE
  let targetLocale: Locale = DEFAULT_LOCALE;

  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale)) {
    targetLocale = cookieLocale as Locale;
  } else {
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      if (acceptLanguage.includes('ar')) {
        targetLocale = 'ar';
      } else if (acceptLanguage.includes('ur')) {
        targetLocale = 'ur';
      }
    }
  }

  // 3. Rewrite / redirect to localized route
  const targetPath = `/${targetLocale}${pathname === '/' ? '' : pathname}`;
  const redirectUrl = new URL(targetPath, request.url);
  redirectUrl.search = request.nextUrl.search;

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/* (API routes)
     * 2. /_next/* (Next.js internals)
     * 3. Static files (favicon.ico, robots.txt, sitemap.xml, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|xml|txt)$).*)',
  ],
};
