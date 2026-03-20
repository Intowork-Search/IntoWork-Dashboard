'use client';

import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

const MOCKUPS = [
  {
    id: 1,
    title: 'Impact Humain',
    description: 'Hero 2 colonnes avec photo de professionnel africain, stories de réussite, témoignages avec photos réelles.',
    href: '/demo/mockup-1',
    accent: '#6B9B5F',
    bg: '#F0F7EE',
    badge: 'Chaleureux & Authentique',
  },
  {
    id: 2,
    title: 'Corporate Premium',
    description: 'Hero plein écran photo + overlay glassmorphism stats, design sobre et professionnel haut de gamme.',
    href: '/demo/mockup-2',
    accent: '#003DA5',
    bg: '#EEF2FB',
    badge: 'Luxueux & Confiant',
  },
  {
    id: 3,
    title: 'Double Public',
    description: 'Split-screen candidats / recruteurs, deux univers visuels distincts qui coexistent harmonieusement.',
    href: '/demo/mockup-3',
    accent: '#7C3AED',
    bg: '#F5F3FF',
    badge: 'Inclusif & Clair',
  },
  {
    id: 4,
    title: 'Bold & Stories',
    description: 'Cascade de photos empilées dans le hero, badges flottants animés, success stories horizontales.',
    href: '/demo/mockup-4',
    accent: '#F59E0B',
    bg: '#FFFBEA',
    badge: 'Dynamique & Inspirant',
  },
];

export default function DemoIndex() {
  return (
    <div
      className={`${plusJakartaSans.variable} font-sans antialiased min-h-screen bg-gray-50`}
      style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif' }}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← Retour au site
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-900">Maquettes INTOWORK</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-semibold text-[#6B9B5F]">
            4 concepts
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Landing Page — Maquettes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            4 concepts de redesign premium pour intowork.co avec photos de professionnels africains réels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCKUPS.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Color band */}
              <div
                className="h-3 w-full"
                style={{ backgroundColor: m.accent }}
              />

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm"
                      style={{ backgroundColor: m.accent }}
                    >
                      {m.id}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mockup {m.id}</p>
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {m.title}
                      </h2>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={{ backgroundColor: m.bg, color: m.accent, borderColor: `${m.accent}30` }}
                  >
                    {m.badge}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {m.description}
                </p>

                <div
                  className="flex items-center gap-2 text-sm font-semibold transition-all duration-200"
                  style={{ color: m.accent }}
                >
                  Voir la maquette
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Back to main site */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6B9B5F] text-white font-semibold text-sm hover:bg-[#5A8A4E] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Site principal
          </Link>
        </div>
      </div>
    </div>
  );
}
