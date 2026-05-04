import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'pt', 'ar'],
  defaultLocale: 'fr',
  // Le français (défaut) n'a pas de préfixe → /dashboard reste /dashboard
  // Les autres langues ont un préfixe → /en/dashboard, /pt/dashboard, /ar/dashboard
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
