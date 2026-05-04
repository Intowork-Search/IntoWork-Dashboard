import { auth } from "@/auth"
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextRequest, NextResponse } from "next/server"

const handleI18nRouting = createIntlMiddleware(routing);

// Locales non-default (celles qui ont un préfixe dans l'URL)
const nonDefaultLocales = routing.locales.filter(l => l !== routing.defaultLocale);

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Gérer le routage i18n en premier
  const intlResponse = handleI18nRouting(req as NextRequest);

  // Extraire le pathname sans le préfixe de locale pour les vérifications auth
  let pathnameWithoutLocale = pathname;
  for (const locale of nonDefaultLocales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
      break;
    }
  }

  // Pages publiques (accessibles sans authentification)
  const publicPaths = [
    '/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/onboarding',
    '/terms',
    '/privacy',
    '/cookies',
    '/mentions-legales',
    '/about',
    '/contact',
    '/offres',
    '/entreprises',
    '/support',
  ]

  const isPublicPath = publicPaths.some(path =>
    pathnameWithoutLocale === path || pathnameWithoutLocale.startsWith(path + '/')
  )

  // Si page publique, laisser passer avec la réponse i18n
  if (isPublicPath) {
    // Redirect authenticated users away from auth pages
    const authPages = ['/signin', '/signup', '/forgot-password', '/reset-password'];
    if (isAuthenticated && authPages.some(p => pathnameWithoutLocale.startsWith(p))) {
      // Reconstruire l'URL /dashboard avec le préfixe de locale si nécessaire
      const localePrefix = pathname !== pathnameWithoutLocale
        ? pathname.replace(pathnameWithoutLocale, '')
        : '';
      return NextResponse.redirect(new URL(`${localePrefix}/dashboard`, req.url));
    }
    return intlResponse || NextResponse.next();
  }

  // Si non authentifié et route protégée, rediriger vers signin
  if (!isAuthenticated && pathnameWithoutLocale.startsWith('/dashboard')) {
    const localePrefix = pathname !== pathnameWithoutLocale
      ? pathname.replace(pathnameWithoutLocale, '')
      : '';
    const signInUrl = new URL(`${localePrefix}/signin`, req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Si authentifié mais pas admin et route admin, rediriger vers dashboard
  if (isAuthenticated && pathnameWithoutLocale.startsWith('/dashboard/admin')) {
    const role = req.auth?.user?.role
    if (role !== 'admin') {
      const localePrefix = pathname !== pathnameWithoutLocale
        ? pathname.replace(pathnameWithoutLocale, '')
        : '';
      return NextResponse.redirect(new URL(`${localePrefix}/dashboard`, req.url))
    }
  }

  return intlResponse || NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
