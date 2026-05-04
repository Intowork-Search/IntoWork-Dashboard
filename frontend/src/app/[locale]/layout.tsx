import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import SessionProvider from '@/components/SessionProvider';
import QueryProvider from '@/components/QueryProvider';
import ToastProvider from '@/components/ToastProvider';
import { routing } from '@/i18n/routing';
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "INTOWORK Search - Plateforme de Recrutement",
  description: "Plateforme B2B2C de recrutement avec matching IA pour l'Afrique Centrale",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Valider la locale
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  // L'arabe est RTL
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <SessionProvider>
              {children}
              <ToastProvider />
            </SessionProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
