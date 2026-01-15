import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SessionProvider from '@/components/SessionProvider';
import QueryProvider from '@/components/QueryProvider';
import ToastProvider from '@/components/ToastProvider';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "INTOWORK Search - Plateforme de Recrutement",
  description: "Plateforme B2B2C de recrutement avec matching IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50`}
      >
        <QueryProvider>
          <SessionProvider>
            {children}
            <ToastProvider />
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
