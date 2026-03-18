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

/* ────────────────────────────── STATIC DATA ────────────────────────────── */

const navLinks = [
  { label: 'Fonctionnalites', href: '#features' },
  { label: 'Comment ca marche', href: '#how-it-works' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'Temoignages', href: '#testimonials' },
];

const bentoFeatures = [
  {
    id: 'matching',
    title: 'Matching IA de precision',
    description:
      'Notre algorithme analyse plus de 50 criteres pour connecter les meilleurs talents aux opportunites ideales a Abidjan, Dakar, et dans 15+ pays africains.',
    size: 'large' as const,
    illustration: (
      <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Dashboard</span>
          <span>Abidjan, CI</span>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Aminata K.', role: 'Dev Full Stack', match: '98%', color: 'bg-[#6B9B5F]' },
            { name: 'Moussa D.', role: 'Chef de Projet', match: '94%', color: 'bg-[#6B9B5F]/80' },
            { name: 'Fatou S.', role: 'UX Designer', match: '91%', color: 'bg-[#6B9B5F]/60' },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-3 rounded-lg bg-white p-3 border border-gray-100">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-500">
                {c.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-400">{c.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: c.match }} />
                </div>
                <span className="text-xs font-semibold text-[#6B9B5F]">{c.match}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-[10px] text-gray-300">Orange CI / FCFA</span>
          <span className="text-[10px] text-gray-300">Mis a jour il y a 2 min</span>
        </div>
      </div>
    ),
  },
  {
    id: 'stats',
    title: 'Statistiques en temps reel',
    description: 'Suivez vos KPIs de recrutement avec des tableaux de bord intuitifs.',
    size: 'medium' as const,
    illustration: (
      <div className="mt-5 grid grid-cols-2 gap-2">
        {[
          { label: 'Candidatures', value: '2,847', change: '+24%', color: 'text-[#6B9B5F]', bg: 'bg-[#6B9B5F]/5' },
          { label: 'Entretiens', value: '156', change: '+18%', color: 'text-[#7C3AED]', bg: 'bg-[#7C3AED]/5' },
          { label: 'Recrutements', value: '89', change: '+31%', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/5' },
          { label: 'Delai moyen', value: '12j', change: '-22%', color: 'text-blue-500', bg: 'bg-blue-500/5' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl ${s.bg} p-3`}>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-lg font-bold ${s.color} mt-1`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.change} ce mois</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'tracking',
    title: 'Suivi des candidatures',
    description: 'Pipeline visuel pour gerer chaque etape du processus de recrutement.',
    size: 'medium' as const,
    illustration: (
      <div className="mt-5 space-y-2">
        {[
          { stage: 'Candidature recue', count: 24, color: 'bg-blue-400' },
          { stage: 'Entretien planifie', count: 8, color: 'bg-[#7C3AED]' },
          { stage: 'Evaluation technique', count: 5, color: 'bg-[#F59E0B]' },
          { stage: 'Offre envoyee', count: 3, color: 'bg-[#6B9B5F]' },
        ].map((s) => (
          <div key={s.stage} className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${s.color} shrink-0`} />
            <span className="text-xs text-gray-600 flex-1">{s.stage}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${(s.count / 24) * 100}%` }} />
              </div>
              <span className="text-xs font-medium text-gray-900 w-5 text-right">{s.count}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'countries',
    title: '15+ pays couverts',
    description: 'Presence dans toute l\'Afrique francophone et au-dela.',
    size: 'small' as const,
    illustration: (
      <div className="mt-4 flex flex-wrap gap-1.5">
        {['🇨🇮', '🇸🇳', '🇨🇲', '🇲🇱', '🇬🇦', '🇧🇫', '🇬🇳', '🇧🇯', '🇹🇬', '🇳🇪', '🇨🇩', '🇲🇬', '🇲🇦', '🇹🇳', '🇷🇼'].map((flag, i) => (
          <span key={i} className="text-lg leading-none">{flag}</span>
        ))}
      </div>
    ),
  },
  {
    id: 'satisfaction',
    title: '95% satisfaction',
    description: 'Nos utilisateurs nous recommandent.',
    size: 'small' as const,
    illustration: (
      <div className="mt-4">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className={`w-5 h-5 ${s <= 4 ? 'text-[#F59E0B]' : 'text-[#F59E0B]/50'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-2">4.9<span className="text-sm font-normal text-gray-400">/5</span></p>
        <p className="text-[10px] text-gray-400 mt-0.5">Base sur 1,200+ avis</p>
      </div>
    ),
  },
];

const steps = [
  {
    number: '01',
    title: 'Creez votre profil',
    description: 'Inscrivez-vous en 2 minutes et completez votre profil professionnel ou publiez votre offre d\'emploi.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'L\'IA fait le matching',
    description: 'Notre algorithme analyse vos competences et preferences pour identifier les meilleures correspondances.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Connectez et recrutez',
    description: 'Echangez directement avec les profils qualifies et finalisez vos recrutements rapidement.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    name: 'Aminata Kone',
    role: 'DRH, Orange CI',
    location: 'Abidjan',
    quote: 'INTOWORK a transforme notre processus de recrutement. Le matching IA nous fait gagner des semaines et la qualite des candidats est exceptionnelle.',
    avatar: 'AK',
  },
  {
    name: 'Moussa Diallo',
    role: 'Developpeur Senior',
    location: 'Dakar',
    quote: 'J\'ai trouve mon poste ideal en moins de 10 jours. L\'interface est intuitive et les recommandations sont vraiment pertinentes.',
    avatar: 'MD',
  },
  {
    name: 'Nadege Mbarga',
    role: 'CEO, TechHub Douala',
    location: 'Douala',
    quote: 'La plateforme comprend les specificites du marche africain. C\'est l\'outil qu\'il nous manquait pour recruter a l\'echelle du continent.',
    avatar: 'NM',
  },
];

const pricingPlans = [
  {
    name: 'Gratuit',
    price: '0',
    period: 'pour toujours',
    description: 'Ideal pour decouvrir la plateforme et commencer a recruter.',
    features: [
      '3 offres d\'emploi actives',
      'Matching IA basique',
      'Tableau de bord standard',
      'Support par email',
      'Profil entreprise',
    ],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '79',
    period: 'par mois',
    description: 'Pour les equipes qui veulent accelerer leurs recrutements.',
    features: [
      'Offres d\'emploi illimitees',
      'Matching IA avance',
      'Tableaux de bord personnalises',
      'Support prioritaire 24/7',
      'API & integrations',
      'Rapports et analytics',
      'Marque employeur',
    ],
    cta: 'Essai gratuit 14 jours',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    description: 'Solution adaptee aux grandes organisations et groupes.',
    features: [
      'Tout le plan Pro',
      'Multi-sites & multi-pays',
      'SSO & SAML',
      'Account manager dedie',
      'SLA garanti 99.9%',
      'Formation equipes',
      'Personnalisation complete',
    ],
    cta: 'Contacter l\'equipe',
    highlighted: false,
  },
];

const trustBadges = [
  { label: 'RGPD', icon: '🛡' },
  { label: 'SSL 256-bit', icon: '🔒' },
  { label: 'SOC 2 Type II', icon: '✓' },
  { label: 'SLA 99.9%', icon: '⚡' },
  { label: 'ISO 27001', icon: '📋' },
];

const footerLinks = {
  Produit: ['Fonctionnalites', 'Tarifs', 'Integrations', 'API', 'Changelog'],
  Entreprise: ['A propos', 'Carrieres', 'Presse', 'Partenaires', 'Contact'],
  Ressources: ['Blog', 'Guide RH', 'Webinaires', 'Documentation', 'Statut'],
  Legal: ['Confidentialite', 'CGU', 'Cookies', 'Mentions legales', 'RGPD'],
};

/* ────────────────────────────── COMPONENT ────────────────────────────── */

export default function Template14() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`${plusJakarta.variable} font-sans antialiased bg-white text-gray-900`}>
      {/* Keyframe animation for gradient text */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient {
          animation: gradient 3s linear infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animate-fade-in-up-delay-1 {
          animation: fade-in-up 0.6s ease-out 0.1s forwards;
          opacity: 0;
        }
        .animate-fade-in-up-delay-2 {
          animation: fade-in-up 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-fade-in-up-delay-3 {
          animation: fade-in-up 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }
      `}</style>

      {/* ═══════════════════════ NAVIGATION ═══════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-intowork.png" alt="INTOWORK" className="h-28 sm:h-32 w-auto" />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/signup"
                className="text-[13px] font-semibold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-full transition-all duration-200"
              >
                Commencer
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-900"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
              <Link href="/auth/signin" className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg">
                Se connecter
              </Link>
              <Link href="/auth/signup" className="block px-3 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg text-center">
                Commencer
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#6B9B5F]/[0.04] rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-[#7C3AED]/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#F59E0B]/[0.02] rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6B9B5F] animate-pulse" />
            <span className="text-xs font-medium text-gray-600">Nouveau &middot; Plateforme IA de recrutement</span>
          </div>

          {/* Headline with animated gradient */}
          <h1 className="animate-fade-in-up-delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-gray-900">Le recrutement</span>
            <br />
            <span
              className="animate-gradient bg-gradient-to-r from-[#6B9B5F] via-[#4a7a3f] to-[#6B9B5F] bg-clip-text text-transparent"
              style={{ backgroundSize: '200% auto' }}
            >
              reinvente pour l&apos;Afrique
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up-delay-2 mt-6 sm:mt-8 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Connectez les meilleurs talents africains aux opportunites qui transforment des carrieres.
            Matching intelligent, processus simplifie, resultats mesurables.
          </p>

          {/* CTA */}
          <div className="animate-fade-in-up-delay-3 mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 px-8 py-3.5 bg-[#6B9B5F] hover:bg-[#5a8a4e] text-white font-semibold text-sm rounded-full transition-all duration-300 shadow-lg shadow-[#6B9B5F]/20 hover:shadow-xl hover:shadow-[#6B9B5F]/30"
            >
              Commencer gratuitement
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Decouvrir la plateforme
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-12 sm:mt-16 flex flex-col items-center gap-3">
            <div className="flex -space-x-2">
              {['#6B9B5F', '#7C3AED', '#F59E0B', '#3B82F6', '#EF4444'].map((color, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {['AK', 'MD', 'NM', 'FS', 'JD'][i]}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Deja <span className="font-semibold text-gray-600">10,000+</span> professionnels nous font confiance
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ BENTO GRID FEATURES ═══════════════════════ */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-14 sm:mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#6B9B5F] mb-3">Fonctionnalites</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-gray-500 max-w-lg mx-auto">
              Une plateforme complete pour transformer votre recrutement avec l&apos;intelligence artificielle.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bentoFeatures.map((feature) => (
              <div
                key={feature.id}
                className={`group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300 ${
                  feature.size === 'large'
                    ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2'
                    : feature.size === 'medium'
                    ? 'sm:col-span-1 lg:col-span-2'
                    : 'sm:col-span-1 lg:col-span-1'
                }`}
              >
                <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                {feature.illustration}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-14 sm:mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#6B9B5F] mb-3">Comment ca marche</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Trois etapes simples
            </h2>
            <p className="mt-4 text-gray-500 max-w-lg mx-auto">
              De l&apos;inscription au recrutement, tout est concu pour aller vite.
            </p>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gray-200" />

            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {/* Icon circle */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border border-gray-200 text-[#6B9B5F] mb-6 relative z-10 shadow-sm">
                  {step.icon}
                </div>
                {/* Number */}
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#6B9B5F]/60 mb-2">{step.number}</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
      <section id="testimonials" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-14 sm:mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#6B9B5F] mb-3">Temoignages</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Ce qu&apos;en disent nos utilisateurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300"
              >
                {/* Quote */}
                <svg className="w-6 h-6 text-[#6B9B5F]/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} &middot; {t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section id="pricing" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-14 sm:mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#6B9B5F] mb-3">Tarifs</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Des tarifs simples et transparents
            </h2>
            <p className="mt-4 text-gray-500 max-w-lg mx-auto">
              Commencez gratuitement, evoluez selon vos besoins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-2 border-[#6B9B5F] shadow-lg shadow-[#6B9B5F]/5 md:-translate-y-2'
                    : 'border border-gray-100 hover:shadow-lg hover:shadow-gray-100/80'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#6B9B5F] text-white text-[10px] font-bold uppercase tracking-wider">
                      Populaire
                    </span>
                  </div>
                )}

                <h3 className="text-sm font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  {plan.price === 'Sur mesure' ? (
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  ) : (
                    <>
                      <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                      <span className="text-lg font-bold text-gray-900">&euro;</span>
                    </>
                  )}
                  {plan.period && (
                    <span className="text-sm text-gray-400 ml-1">/{plan.period}</span>
                  )}
                </div>
                <p className="mt-3 text-xs text-gray-500 leading-relaxed">{plan.description}</p>

                <button
                  className={`mt-6 w-full py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-[#6B9B5F] hover:bg-[#5a8a4e] text-white shadow-lg shadow-[#6B9B5F]/20'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-[#6B9B5F] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-xs text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TRUST BADGES ═══════════════════════ */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-500"
              >
                <span className="text-sm">{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FINAL CTA ═══════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            Pret a transformer
            <br />
            <span
              className="animate-gradient bg-gradient-to-r from-[#6B9B5F] via-[#4a7a3f] to-[#6B9B5F] bg-clip-text text-transparent"
              style={{ backgroundSize: '200% auto' }}
            >
              votre recrutement ?
            </span>
          </h2>
          <p className="mt-6 text-gray-500 max-w-md mx-auto">
            Rejoignez les 10,000+ professionnels qui utilisent INTOWORK pour recruter les meilleurs talents en Afrique.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 px-8 py-3.5 bg-[#6B9B5F] hover:bg-[#5a8a4e] text-white font-semibold text-sm rounded-full transition-all duration-300 shadow-lg shadow-[#6B9B5F]/20 hover:shadow-xl hover:shadow-[#6B9B5F]/30"
            >
              Commencer gratuitement
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Gratuit pour commencer &middot; Pas de carte bancaire requise
          </p>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="border-t border-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
              <Link href="/" className="inline-block">
                <img src="/logo-intowork.png" alt="INTOWORK" className="h-24 w-auto" />
              </Link>
              <p className="mt-3 text-xs text-gray-400 leading-relaxed max-w-[200px]">
                La plateforme de recrutement intelligente pour l&apos;Afrique.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">{category}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} INTOWORK. Tous droits reserves.
            </p>
            <div className="flex items-center gap-4">
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a key={social} href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
