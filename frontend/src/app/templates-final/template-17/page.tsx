'use client';

import { useState } from 'react';
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

export default function Template17() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className={`${plusJakarta.variable} font-sans antialiased`}
      style={{ backgroundColor: '#09090B', color: '#ffffff' }}
    >
      {/* ================================================================= */}
      {/*  GLOBAL GRID BACKGROUND                                          */}
      {/* ================================================================= */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ================================================================= */}
      {/*  NAVIGATION                                                       */}
      {/* ================================================================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ backgroundColor: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-intowork.png" alt="INTOWORK" className="h-28 sm:h-36 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Fonctionnalites</a>
              <a href="#security" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Securite</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Temoignages</a>
              <a href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Tarifs</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/signin" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Se connecter
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white transition-all duration-300"
                style={{
                  backgroundColor: '#6B9B5F',
                  boxShadow: '0 0 20px -5px rgba(107,155,95,0.4)',
                }}
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/5 space-y-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-400 hover:text-white py-2">Fonctionnalites</a>
              <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-400 hover:text-white py-2">Securite</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-400 hover:text-white py-2">Temoignages</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-400 hover:text-white py-2">Tarifs</a>
              <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                <Link href="/auth/signin" className="text-sm text-gray-300 py-2">Se connecter</Link>
                <Link href="/auth/signup" className="text-sm font-semibold text-white py-2.5 px-4 rounded-lg text-center" style={{ backgroundColor: '#6B9B5F' }}>
                  Commencer gratuitement
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ================================================================= */}
      {/*  HERO SECTION                                                     */}
      {/* ================================================================= */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden">
        {/* Green radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{ background: 'rgba(107,155,95,0.15)', filter: 'blur(120px)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 mb-8" style={{ backgroundColor: 'rgba(107,155,95,0.1)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#6B9B5F' }} />
            <span className="text-sm font-medium text-gray-300">La plateforme IA de recrutement</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold mb-6 leading-[1.05] tracking-tight">
            <span className="text-white">Recrutement.</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #6B9B5F, #9BCF8B)' }}
            >
              Simplifie.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connectez talents et opportunites grace a notre technologie de matching intelligent.
            INTOWORK facilite les rencontres entre candidats qualifies et entreprises qui recrutent
            en Afrique francophone.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: '#6B9B5F',
                boxShadow: '0 0 60px -15px rgba(107,155,95,0.5)',
              }}
            >
              Commencer gratuitement
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/offres"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-300 border border-white/10 rounded-lg transition-all duration-300 hover:border-white/30 hover:text-white hover:bg-white/5"
            >
              Voir les offres
            </Link>
          </div>

          {/* Floating mini cards */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Job card */}
            <div className="rounded-xl border border-white/10 p-5 text-left backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #6B9B5F, #4a7a3f)' }}>OT</div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">Ingenieur Logiciel</h4>
                  <p className="text-xs text-gray-500">Orange CI . Abidjan</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">800K-1.2M FCFA</span>
                <span className="text-xs font-bold" style={{ color: '#6B9B5F' }}>94% match</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(107,155,95,0.15)' }}>
                <div className="h-full rounded-full" style={{ width: '94%', background: 'linear-gradient(90deg, #6B9B5F, #9BCF8B)' }} />
              </div>
            </div>

            {/* Profile card */}
            <div className="rounded-xl border border-white/10 p-5 text-left backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#7C3AED' }}>AK</div>
                <div>
                  <h4 className="font-bold text-white text-sm">Aminata K.</h4>
                  <p className="text-xs text-gray-500">Dev Full Stack</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Profil complete</span>
                <span className="text-xs font-bold" style={{ color: '#7C3AED' }}>92%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(124,58,237,0.15)' }}>
                <div className="h-full rounded-full" style={{ width: '92%', background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }} />
              </div>
            </div>

            {/* Stats card */}
            <div className="rounded-xl border border-white/10 p-5 text-left backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}>
                  <svg className="w-4 h-4" style={{ color: '#F59E0B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-300">Candidatures</span>
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <div className="text-2xl font-extrabold text-white">8</div>
                  <div className="text-xs text-gray-500">envoyees</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold" style={{ color: '#6B9B5F' }}>3</div>
                  <div className="text-xs text-gray-500">acceptees</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold" style={{ color: '#F59E0B' }}>5</div>
                  <div className="text-xs text-gray-500">en cours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  STATS SECTION                                                    */}
      {/* ================================================================= */}
      <section className="relative py-16 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Candidats actifs' },
              { value: '500+', label: 'Entreprises partenaires' },
              { value: '95%', label: 'Taux de satisfaction' },
              { value: '15+', label: 'Pays couverts' },
            ].map((stat, i) => (
              <div key={i}>
                <div
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #6B9B5F, #9BCF8B)' }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  FEATURES                                                         */}
      {/* ================================================================= */}
      <section id="features" className="relative py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Une plateforme pensee pour vous
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Decouvrez comment INTOWORK transforme le recrutement avec des outils intelligents et intuitifs.
            </p>
          </div>

          <div className="space-y-20">
            {/* Feature 1 - Matching IA */}
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(107,155,95,0.1)' }}>
                  <svg className="w-6 h-6" style={{ color: '#6B9B5F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Matching IA precis</h3>
                <p className="text-gray-400 leading-relaxed">
                  Notre algorithme analyse les competences, l&apos;experience et les preferences pour creer des connexions pertinentes entre candidats et entreprises.
                </p>
              </div>
              {/* Dark job card illustration */}
              <div className="rounded-2xl p-6 min-h-[280px] border border-white/5" style={{ background: 'linear-gradient(135deg, rgba(107,155,95,0.05), rgba(107,155,95,0.1))' }}>
                <div className="rounded-xl border border-white/10 p-5" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: 'linear-gradient(135deg, #6B9B5F, #4a7a3f)' }}>OT</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm truncate">Ingenieur Logiciel</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 shrink-0" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>Top</span>
                      </div>
                      <p className="text-xs text-gray-500">Orange Telecom . Abidjan</p>
                    </div>
                  </div>
                  <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: 'rgba(107,155,95,0.08)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold" style={{ color: '#6B9B5F' }}>Score de matching IA</span>
                      <span className="text-sm font-extrabold" style={{ color: '#6B9B5F' }}>94%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(107,155,95,0.15)' }}>
                      <div className="h-full rounded-full" style={{ width: '94%', background: 'linear-gradient(90deg, #6B9B5F, #9BCF8B)' }} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-medium" style={{ backgroundColor: 'rgba(107,155,95,0.1)', color: '#6B9B5F' }}>Abidjan, CI</span>
                    <span className="px-2 py-1 rounded-lg text-[10px] font-medium" style={{ backgroundColor: 'rgba(124,58,237,0.1)', color: '#A78BFA' }}>Hybride</span>
                    <span className="px-2 py-1 rounded-lg text-[10px] font-medium" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#60A5FA' }}>CDI</span>
                    <span className="px-2 py-1 rounded-lg text-[10px] font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF' }}>800K-1.2M FCFA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-gray-600">
                      <span>234 vues</span>
                      <span>18 candidats</span>
                      <span>Il y a 2j</span>
                    </div>
                    <button className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #6B9B5F, #4a7a3f)' }}>Postuler</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - Tableau de bord */}
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Dark dashboard illustration */}
              <div className="order-2 lg:order-1 rounded-2xl p-6 min-h-[280px] border border-white/5" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(124,58,237,0.1))' }}>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-xl p-3 text-white" style={{ background: 'linear-gradient(135deg, #6B9B5F, #4a7a3f)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div className="text-[10px] text-white/70">Profil</div>
                    <div className="text-lg font-bold">85%</div>
                  </div>
                  <div className="rounded-xl p-3 text-white" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </div>
                    <div className="text-[10px] text-white/70">Offres</div>
                    <div className="text-lg font-bold">127</div>
                  </div>
                  <div className="rounded-xl p-3 text-white" style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
                    </div>
                    <div className="text-[10px] text-white/70">Formation</div>
                    <div className="text-lg font-bold">3</div>
                  </div>
                  <div className="rounded-xl p-3 text-white" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.645-3.168A1.32 1.32 0 004.96 13.3V18.7a1.32 1.32 0 00.815 1.298l5.644 3.168a1.32 1.32 0 001.163 0l5.644-3.168A1.32 1.32 0 0019.04 18.7V13.3a1.32 1.32 0 00-.815-1.298L12.58 8.834a1.32 1.32 0 00-1.163 0L5.776 12.002" /></svg>
                    </div>
                    <div className="text-[10px] text-white/70">Competences</div>
                    <div className="text-lg font-bold">12</div>
                  </div>
                </div>
                {/* Activity feed - dark */}
                <div className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="text-xs font-bold text-gray-300">Activite recente</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(59,130,246,0.05)' }}>
                      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}><span className="text-[8px]">&#128196;</span></div>
                      <span className="text-[10px] text-gray-400 truncate">Candidature envoyee - <b className="text-gray-300">Chef de Projet</b></span>
                      <span className="text-[8px] text-gray-600 shrink-0 ml-auto">2h</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(107,155,95,0.05)' }}>
                      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(107,155,95,0.1)' }}><span className="text-[8px]">&#128065;</span></div>
                      <span className="text-[10px] text-gray-400 truncate">Profil consulte par <b className="text-gray-300">Ecobank</b></span>
                      <span className="text-[8px] text-gray-600 shrink-0 ml-auto">5h</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(124,58,237,0.05)' }}>
                      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(124,58,237,0.1)' }}><span className="text-[8px]">&#127919;</span></div>
                      <span className="text-[10px] text-gray-400 truncate">Entretien planifie - <b className="text-gray-300">Orange CI</b></span>
                      <span className="text-[8px] text-gray-600 shrink-0 ml-auto">1j</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(124,58,237,0.1)' }}>
                  <svg className="w-6 h-6" style={{ color: '#7C3AED' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Tableau de bord analytique</h3>
                <p className="text-gray-400 leading-relaxed">
                  Suivez vos candidatures, analysez les performances de vos offres et prenez des decisions eclairees grace a des visualisations claires.
                </p>
              </div>
            </div>

            {/* Feature 3 - Communication */}
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}>
                  <svg className="w-6 h-6" style={{ color: '#F59E0B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Communication simplifiee</h3>
                <p className="text-gray-400 leading-relaxed">
                  Messagerie integree, notifications en temps reel et suivi de chaque etape du processus de recrutement au meme endroit.
                </p>
              </div>
              {/* Dark application tracking illustration */}
              <div className="rounded-2xl p-6 min-h-[280px] border border-white/5" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(245,158,11,0.1))' }}>
                <div className="rounded-xl p-3 mb-3 text-white" style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    <span className="text-xs font-bold">8 candidatures</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>5 en cours</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: 'rgba(107,155,95,0.3)' }}>2 acceptees</span>
                  </div>
                </div>
                <div className="flex gap-1.5 mb-3 overflow-x-auto">
                  <span className="px-2 py-1 rounded-lg border text-[9px] font-bold whitespace-nowrap" style={{ backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#F59E0B' }}>En attente 3</span>
                  <span className="px-2 py-1 rounded-lg text-[9px] font-medium whitespace-nowrap" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#60A5FA' }}>Vues 2</span>
                  <span className="px-2 py-1 rounded-lg text-[9px] font-medium whitespace-nowrap" style={{ backgroundColor: 'rgba(124,58,237,0.1)', color: '#A78BFA' }}>Entretien 1</span>
                  <span className="px-2 py-1 rounded-lg text-[9px] font-medium whitespace-nowrap" style={{ backgroundColor: 'rgba(107,155,95,0.1)', color: '#6B9B5F' }}>Acceptee 2</span>
                </div>
                <div className="space-y-2">
                  <div className="rounded-xl border border-white/10 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #6B9B5F, #4a7a3f)' }}>OT</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">Ingenieur Logiciel</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0" style={{ backgroundColor: 'rgba(107,155,95,0.15)', color: '#6B9B5F' }}>Acceptee</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-gray-500">Orange CI</span>
                          <span className="text-gray-700">.</span>
                          <span className="text-[9px] text-gray-500">Abidjan</span>
                          <span className="text-gray-700">.</span>
                          <span className="px-1 py-0.5 rounded text-[8px]" style={{ backgroundColor: 'rgba(124,58,237,0.1)', color: '#A78BFA' }}>Hybride</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>EB</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">Resp. Marketing</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>En attente</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-gray-500">Ecobank</span>
                          <span className="text-gray-700">.</span>
                          <span className="text-[9px] text-gray-500">Dakar</span>
                          <span className="text-gray-700">.</span>
                          <span className="px-1 py-0.5 rounded text-[8px]" style={{ backgroundColor: 'rgba(107,155,95,0.1)', color: '#6B9B5F' }}>CDI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  COUNTRY BANNER                                                   */}
      {/* ================================================================= */}
      <section className="py-10 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
            {[
              { flag: '\u{1F1E8}\u{1F1EE}', name: "Cote d'Ivoire" },
              { flag: '\u{1F1F8}\u{1F1F3}', name: 'Senegal' },
              { flag: '\u{1F1E8}\u{1F1F2}', name: 'Cameroun' },
              { flag: '\u{1F1F2}\u{1F1F1}', name: 'Mali' },
              { flag: '\u{1F1E7}\u{1F1EB}', name: 'Burkina Faso' },
              { flag: '\u{1F1EC}\u{1F1F3}', name: 'Guinee' },
              { flag: '\u{1F1EC}\u{1F1E6}', name: 'Gabon' },
              { flag: '\u{1F1E8}\u{1F1EC}', name: 'Congo' },
            ].map((country, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                <span className="text-xl">{country.flag}</span>
                <span className="text-sm font-medium">{country.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  SECURITY / TRUST                                                 */}
      {/* ================================================================= */}
      <section id="security" className="relative py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Vos donnees sont en securite
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
            Nous appliquons les normes les plus strictes pour proteger vos informations personnelles et professionnelles.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '\u{1F6E1}\u{FE0F}', title: 'RGPD', desc: 'Conforme au reglement europeen sur la protection des donnees' },
              { icon: '\u{1F512}', title: 'SSL', desc: 'Chiffrement de bout en bout de toutes les communications' },
              { icon: '\u2705', title: 'SOC 2', desc: 'Audit de securite et conformite valide annuellement' },
              { icon: '\u26A1', title: 'SLA 99,9%', desc: 'Disponibilite garantie avec support technique 24/7' },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 p-6 text-center transition-all duration-300 hover:border-white/20 group"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="font-bold text-white mb-2 group-hover:text-[#6B9B5F] transition-colors">{item.title}</div>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  TESTIMONIALS                                                     */}
      {/* ================================================================= */}
      <section id="testimonials" className="relative py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12 text-center tracking-tight">
            Ce que disent nos utilisateurs
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "INTOWORK a transforme notre recrutement. En 2 semaines, nous avons trouve 3 ingenieurs qualifies a Abidjan. Le matching IA est bluffant.",
                name: 'Aminata Kone',
                role: "DRH, Orange Cote d'Ivoire",
                initials: 'AK',
                color: '#6B9B5F',
              },
              {
                quote: "Apres des mois de recherche, j'ai decroche mon poste ideal a Dakar en une semaine sur INTOWORK. La plateforme comprend vraiment le marche africain.",
                name: 'Moussa Diallo',
                role: 'Developpeur Senior, Dakar',
                initials: 'MD',
                color: '#7C3AED',
              },
              {
                quote: "Pour notre startup a Douala, chaque recrutement est strategique. INTOWORK nous connecte aux meilleurs talents de toute l'Afrique francophone.",
                name: 'Nadege Mbarga',
                role: 'CEO, AfriTech Labs',
                initials: 'NM',
                color: '#F59E0B',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 sm:p-8 border border-white/5 transition-all duration-300 hover:border-white/15 relative overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                {/* Green left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: t.color }} />

                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 fill-current" style={{ color: '#F59E0B' }} viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  PRICING                                                          */}
      {/* ================================================================= */}
      <section id="pricing" className="relative py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Des tarifs adaptes a vos besoins
          </h2>
          <p className="text-lg text-gray-500 mb-12">
            Commencez gratuitement et evoluez selon votre croissance.
          </p>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Free */}
            <div
              className="rounded-2xl border border-white/5 p-6 sm:p-8 text-left transition-all duration-300 hover:border-white/15"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Gratuit</div>
              <div className="text-3xl font-extrabold text-white mb-2">0&euro;<span className="text-base font-normal text-gray-500">/mois</span></div>
              <p className="text-sm text-gray-500 mb-6">Pour les candidats et petites equipes</p>
              <ul className="space-y-3 mb-8">
                {['5 offres actives', 'Matching IA basique', 'Support email', 'Tableau de bord'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 shrink-0" style={{ color: '#6B9B5F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block text-center py-2.5 rounded-lg border border-white/10 text-gray-300 font-semibold text-sm hover:border-white/30 hover:text-white transition-all"
              >
                Commencer
              </Link>
            </div>

            {/* Pro - Highlighted */}
            <div
              className="rounded-2xl p-6 sm:p-8 text-left relative overflow-hidden"
              style={{
                backgroundColor: 'rgba(107,155,95,0.08)',
                border: '1px solid #6B9B5F',
                boxShadow: '0 0 60px -15px rgba(107,155,95,0.3)',
              }}
            >
              {/* Popular badge */}
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#6B9B5F' }}
              >
                Populaire
              </div>
              <div className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#6B9B5F' }}>Pro</div>
              <div className="text-3xl font-extrabold text-white mb-2">79&euro;<span className="text-base font-normal text-gray-500">/mois</span></div>
              <p className="text-sm text-gray-400 mb-6">Pour les equipes RH en croissance</p>
              <ul className="space-y-3 mb-8">
                {['Offres illimitees', 'Matching IA avance', 'Support prioritaire', 'Analytiques detaillees', 'API & integrations'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 shrink-0" style={{ color: '#6B9B5F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block text-center py-2.5 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90"
                style={{
                  backgroundColor: '#6B9B5F',
                  boxShadow: '0 0 30px -8px rgba(107,155,95,0.5)',
                }}
              >
                Essai gratuit 14 jours
              </Link>
            </div>

            {/* Enterprise */}
            <div
              className="rounded-2xl border border-white/5 p-6 sm:p-8 text-left transition-all duration-300 hover:border-white/15"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Enterprise</div>
              <div className="text-3xl font-extrabold text-white mb-2">Sur mesure</div>
              <p className="text-sm text-gray-500 mb-6">Pour les grandes organisations</p>
              <ul className="space-y-3 mb-8">
                {['Tout dans Pro', 'SSO & SAML', 'SLA garanti 99,9%', 'Gestionnaire dedie', 'Deploiement sur site'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 shrink-0" style={{ color: '#6B9B5F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block text-center py-2.5 rounded-lg border font-semibold text-sm transition-all hover:text-white"
                style={{ borderColor: '#6B9B5F', color: '#6B9B5F' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6B9B5F'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6B9B5F'; }}
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  CTA SECTION                                                      */}
      {/* ================================================================= */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        {/* Green glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none" style={{ background: 'rgba(107,155,95,0.12)', filter: 'blur(100px)' }} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Pret a transformer votre recrutement ?
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Rejoignez des milliers d&apos;entreprises et de candidats qui font confiance a INTOWORK pour connecter les bons talents aux bonnes opportunites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-bold text-sm text-white transition-all hover:scale-105"
              style={{
                backgroundColor: '#6B9B5F',
                boxShadow: '0 0 60px -15px rgba(107,155,95,0.5)',
              }}
            >
              Creer un compte gratuit
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/5 hover:border-white/30 transition-all"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  FOOTER                                                           */}
      {/* ================================================================= */}
      <footer style={{ backgroundColor: '#000000' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo-intowork.png" alt="INTOWORK" className="h-24 w-auto" />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                La plateforme IA qui connecte talents et entreprises avec precision.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm text-gray-300">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-500 hover:text-[#6B9B5F] transition-colors">Fonctionnalites</a></li>
                <li><a href="#pricing" className="text-gray-500 hover:text-[#6B9B5F] transition-colors">Tarifs</a></li>
                <li><a href="#security" className="text-gray-500 hover:text-[#6B9B5F] transition-colors">Securite</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm text-gray-300">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-500 hover:text-[#6B9B5F] transition-colors">A propos</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#6B9B5F] transition-colors">Carrieres</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#6B9B5F] transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm text-gray-300">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-500 hover:text-[#6B9B5F] transition-colors">Mentions legales</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#6B9B5F] transition-colors">Politique de confidentialite</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#6B9B5F] transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">&copy; 2026 INTOWORK. Tous droits reserves.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-600 hover:text-[#6B9B5F] transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-[#6B9B5F] transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-[#6B9B5F] transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}