import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Pages publiques (accessibles sans authentification)
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/terms',
    '/privacy',
  ]

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Si page publique, laisser passer
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Si non authentifié et route protégée, rediriger vers signin
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Si authentifié et sur page auth, rediriger vers dashboard
  if (isAuthenticated && pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
