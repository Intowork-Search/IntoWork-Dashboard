import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

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

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Si page publique, laisser passer
  if (isPublicPath) {
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && ['/signin', '/signup', '/forgot-password', '/reset-password'].some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Si non authentifié et route protégée, rediriger vers signin
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    const signInUrl = new URL('/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Si authentifié mais pas admin et route admin, rediriger vers dashboard
  if (isAuthenticated && pathname.startsWith('/dashboard/admin')) {
    const role = req.auth?.user?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }


  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
