'use client';

import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
});

const templates = [
  {
    id: 13,
    name: 'LinkedIn Professional',
    inspiration: 'LinkedIn · Indeed · Silicon Valley',
    description: 'Design enterprise professionnel avec dashboard preview flottant, compteurs animés et social proof. Inspiré des meilleures plateformes de la Silicon Valley.',
    gradient: 'bg-gradient-to-br from-gray-50 to-[#6B9B5F]/10',
    textColor: 'text-gray-900',
    tags: ['Enterprise', 'Dashboard Preview', 'Animated Counters'],
  },
  {
    id: 14,
    name: 'Notion Minimal',
    inspiration: 'Notion · Stripe · Linear',
    description: 'Ultra-clean avec texte gradient animé, bento grid pour les features et design minimaliste européen. Typographie comme signature.',
    gradient: 'bg-gradient-to-br from-white to-gray-50',
    textColor: 'text-gray-900',
    tags: ['Minimal', 'Bento Grid', 'Gradient Text'],
  },
  {
    id: 15,
    name: 'Welcome to the Jungle',
    inspiration: 'Welcome to the Jungle · Hired · Workable',
    description: 'Bold et coloré avec cartes empilées, dividers SVG ondulés et palette pastel chaleureuse. L\'énergie du recrutement européen.',
    gradient: 'bg-gradient-to-br from-[#FDFBF7] to-[#6B9B5F]/10',
    textColor: 'text-gray-900',
    tags: ['Bold', 'Wavy Dividers', 'Stacked Cards'],
  },
  {
    id: 16,
    name: 'Greenhouse Enterprise',
    inspiration: 'Greenhouse · Lever · BambooHR',
    description: 'Product showcase avec mockup navigateur, pipeline de recrutement visuel et chat intégré. Le standard B2B SaaS enterprise.',
    gradient: 'bg-gradient-to-br from-white to-[#6B9B5F]/5',
    textColor: 'text-gray-900',
    tags: ['B2B SaaS', 'Product Mockup', 'Pipeline'],
  },
  {
    id: 17,
    name: 'Vercel Dark',
    inspiration: 'Vercel · Raycast · Linear Dark',
    description: 'Dark mode premium avec glow effects verts, grille en arrière-plan et cartes translucides. L\'esthétique tech cutting-edge.',
    gradient: 'bg-gradient-to-br from-[#09090B] to-[#1a1a2e]',
    textColor: 'text-white',
    tags: ['Dark Mode', 'Glow Effects', 'Premium Tech'],
  },
];

export default function TemplatesFinalGallery() {
  return (
    <div className={`${plusJakarta.variable} font-sans min-h-screen bg-[#09090B]`}>
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-50 bg-[#09090B]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-intowork.png" alt="INTOWORK" className="h-12 w-auto" />
            </Link>
            <div className="h-8 w-px bg-white/10"></div>
            <div>
              <h1 className="text-lg font-bold text-white">Templates V3 — Final</h1>
              <p className="text-xs text-gray-500">5 designs premium optimisés</p>
            </div>
          </div>
          <Link href="/templates" className="text-sm font-medium text-gray-400 hover:text-[#6B9B5F] transition-colors">
            Voir les V1 →
          </Link>
        </div>
      </header>

      {/* Intro */}
      <section className="py-16 sm:py-20 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#6B9B5F]/10 rounded-full blur-[120px]"></div>
        <div className="relative max-w-3xl mx-auto px-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6B9B5F]/10 border border-[#6B9B5F]/20 text-[#6B9B5F] text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-[#6B9B5F] animate-pulse"></span>
            5 Templates Premium
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Inspirés des meilleurs
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Chaque template est inspiré des meilleures plateformes de recrutement — Silicon Valley, Europe, et adapté pour l&apos;Afrique francophone.
          </p>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-6">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/templates-final/template-${template.id}`}
              className="group block bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#6B9B5F]/40 hover:shadow-[0_0_60px_-15px_rgba(107,155,95,0.2)] transition-all duration-500"
            >
              <div className="grid md:grid-cols-[300px_1fr] items-stretch">
                {/* Preview swatch */}
                <div className={`h-48 md:h-auto ${template.gradient} flex items-center justify-center relative overflow-hidden`}>
                  <span className={`text-5xl font-extrabold ${template.textColor} opacity-60 group-hover:scale-110 transition-transform duration-500`}>
                    #{template.id}
                  </span>
                </div>

                {/* Info */}
                <div className="p-6 sm:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-[#6B9B5F] uppercase tracking-wider">Template {template.id}</span>
                    <span className="text-xs text-gray-500">·</span>
                    <span className="text-xs text-gray-500">{template.inspiration}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#6B9B5F] transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="ml-auto text-[#6B9B5F] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                      Voir le template
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-sm text-gray-600">
          INTOWORK Templates V3 — Inspirés de LinkedIn, Notion, Welcome to the Jungle, Greenhouse, Vercel
        </p>
      </footer>
    </div>
  );
}
