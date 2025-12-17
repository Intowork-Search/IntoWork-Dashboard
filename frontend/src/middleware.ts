import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Définir les routes protégées
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/jobs(.*)',
  '/applications(.*)',
  '/onboarding(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Protéger les routes qui nécessitent une authentification
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    String.raw`/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)`,
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
