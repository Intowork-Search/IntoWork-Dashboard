'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

// ─── Data ──────────────────────────────────────────────────────────────────────

const PARTNERS = ['Orange', 'MTN', 'Ecobank', 'Société Générale', 'Canal+', 'TotalEnergies'];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    title: 'Matching IA Intelligent',
    subtitle: 'Algorithme de pointe',
    description: 'Notre IA analyse plus de 50 critères pour connecter les meilleurs candidats aux offres les plus adaptées, avec un taux de précision de 94%.',
    badge: '94% précision',
    badgeColor: 'bg-[#6B9B5F]/10 text-[#6B9B5F]',
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
    photoAlt: 'Femme utilisant laptop',
    mockupBg: 'from-[#F0F7EE] to-green-100',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
    title: 'Gestion Candidatures Simplifiée',
    subtitle: 'Tableau de bord unifié',
    description: 'Gérez toutes vos candidatures depuis un seul tableau de bord. Suivez en temps réel le statut de chaque dossier et ne manquez aucune opportunité.',
    badge: '3x plus rapide',
    badgeColor: 'bg-purple-50 text-purple-700',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    photoAlt: 'Homme avec laptop',
    mockupBg: 'from-purple-50 to-purple-100',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Analytics & Insights',
    subtitle: 'Décisions basées sur les données',
    description: 'Des rapports détaillés sur vos performances RH, le marché du travail en Afrique de l\'Ouest, et des insights pour optimiser votre stratégie de recrutement.',
    badge: 'Temps réel',
    badgeColor: 'bg-amber-50 text-amber-700',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    photoAlt: 'Homme col blanc',
    mockupBg: 'from-amber-50 to-amber-100',
  },
];

const SUCCESS_STORIES = [
  {
    photo: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80',
    name: 'Aïcha Konaté',
    role: 'Responsable Marketing Digital',
    company: 'Orange Côte d\'Ivoire',
    quote: 'INTOWORK m\'a connectée à des opportunités que je n\'aurais jamais trouvées seule. L\'IA a compris exactement mon profil.',
    metric: '+47% de salaire',
    bg: 'bg-white',
  },
  {
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    name: 'Kofi Mensah',
    role: 'Directeur Financier',
    company: 'Ecobank Ghana',
    quote: 'En 3 semaines, j\'avais 5 entretiens qualifiés. La plateforme a révolutionné ma recherche d\'emploi.',
    metric: 'Placé en 21 jours',
    bg: 'bg-[#F0F7EE]',
  },
  {
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
    name: 'Fatou Diallo',
    role: 'Ingénieure Logicielle Senior',
    company: 'MTN Nigeria',
    quote: 'Le matching IA est incroyablement précis. Mon nouveau poste correspond à 96% à mon profil INTOWORK.',
    metric: '96% match score',
    bg: 'bg-white',
  },
];

const SECURITY_POINTS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Chiffrement SSL/TLS',
    desc: 'Toutes vos données sont chiffrées en transit et au repos avec AES-256.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'RGPD Conforme',
    desc: 'Conformité totale aux réglementations de protection des données personnelles.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Contrôle d\'accès',
    desc: 'Authentification multi-facteurs et permissions granulaires par rôle.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: 'Disponibilité 99.9%',
    desc: 'Infrastructure cloud redondante avec SLA garanti et support 24/7.',
  },
];

const FEATURED_JOBS = [
  { title: 'Directeur Commercial', company: 'Orange CI', location: 'Abidjan', salary: '800K - 1.2M FCFA', type: 'CDI', badge: 'Urgent', badgeColor: 'bg-red-100 text-red-700' },
  { title: 'Développeur Full Stack', company: 'MTN Ghana', location: 'Accra (Remote)', salary: '600K - 900K FCFA', type: 'CDI', badge: 'IA-Matched', badgeColor: 'bg-[#6B9B5F]/10 text-[#6B9B5F]' },
  { title: 'Responsable RH', company: 'Ecobank', location: 'Dakar', salary: '500K - 750K FCFA', type: 'CDI', badge: 'En vedette', badgeColor: 'bg-amber-100 text-amber-700' },
  { title: 'Analyste Financier', company: 'Société Générale', location: 'Abidjan', salary: '700K - 1M FCFA', type: 'CDI', badge: 'Nouveau', badgeColor: 'bg-blue-100 text-blue-700' },
  { title: 'Chef de Projet Digital', company: 'Canal+', location: 'Dakar', salary: '650K - 950K FCFA', type: 'CDI', badge: 'IA-Matched', badgeColor: 'bg-[#6B9B5F]/10 text-[#6B9B5F]' },
  { title: 'Ingénieur Réseau', company: 'TotalEnergies', location: 'Lagos (Hybride)', salary: '900K - 1.4M FCFA', type: 'CDI', badge: 'Top Offre', badgeColor: 'bg-purple-100 text-purple-700' },
];

const TESTIMONIALS = [
  {
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    name: 'Aminata Traoré',
    role: 'DRH, Orange Côte d\'Ivoire',
    quote: 'INTOWORK a réduit notre temps de recrutement de 60%. La qualité des candidats matchés est exceptionnelle. Un outil indispensable pour notre équipe RH.',
    metric: '-60% temps recrutement',
  },
  {
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    name: 'Kwame Asante',
    role: 'CEO, TechHub Accra',
    quote: 'En tant qu\'employeur, la plateforme nous offre une visibilité incroyable sur les talents. Nous avons recruté 12 développeurs en 2 mois.',
    metric: '12 recrutements en 2 mois',
  },
  {
    photo: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80',
    name: 'Nadia Coulibaly',
    role: 'Candidate placée — Finance',
    quote: 'De candidature en ligne à offre signée en 18 jours. INTOWORK a transformé ma recherche d\'emploi. Je recommande à tous mes contacts.',
    metric: 'Offre signée en 18 jours',
  },
];

const PRICING = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: 'pour toujours',
    description: 'Pour débuter votre recherche d\'emploi',
    features: ['Profil candidat complet', '5 candidatures/mois', 'Matching IA basique', 'Alertes emploi', 'Support email'],
    cta: 'Commencer gratuitement',
    ctaHref: '/signup',
    highlight: false,
    badgeText: '',
  },
  {
    name: 'Pro',
    price: '29€',
    period: '/mois',
    description: 'Pour les candidats sérieux et les PME',
    features: ['Candidatures illimitées', 'Matching IA avancé 94%', 'CV builder premium', 'Visibilité boostée x3', 'Analytics profil', 'Support prioritaire 24/7', 'Badge "Candidat vérifié"'],
    cta: 'Essayer 14 jours gratuit',
    ctaHref: '/signup',
    highlight: true,
    badgeText: 'Le plus populaire',
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    description: 'Pour les grandes entreprises et cabinets RH',
    features: ['Postes illimités', 'ATS intégré', 'Rapports RH avancés', 'API & intégrations', 'Manager dédié', 'SLA 99.9% garanti', 'Formation équipe incluse'],
    cta: 'Contacter les ventes',
    ctaHref: '/signup',
    highlight: false,
    badgeText: '',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Mockup4() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'candidates' | 'employers'>('candidates');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`${plusJakarta.variable} font-[var(--font-plus-jakarta)] bg-white text-gray-900 antialiased`}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(107,155,95,0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(107,155,95,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(107,155,95,0); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #6B9B5F, #93C587, #6B9B5F, #4a7a40);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .fade-in { animation: fadeIn 0.7s ease-out both; }
        .slide-left { animation: slideInLeft 0.8s ease-out both; }
        .slide-right { animation: slideInRight 0.8s ease-out both; }
        .float-badge { animation: floatBadge 3s ease-in-out infinite; }
        .float-badge-2 { animation: floatBadge 3.5s ease-in-out infinite 0.8s; }
        .blob-shape { animation: blob 8s ease-in-out infinite; }
        .pulse-ring { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6B9B5F, #4a7a40)' }}>
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                </svg>
              </div>
              <span className="text-xl font-800 text-gray-900 tracking-tight">
                INTO<span style={{ color: '#6B9B5F' }}>WORK</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {['Fonctionnalités', 'Employeurs', 'Tarifs', 'Témoignages'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-500 text-gray-600 hover:text-gray-900 transition-colors relative group">
                  {item}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 rounded-full group-hover:w-full transition-all duration-300" style={{ background: '#6B9B5F' }} />
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/signin" className="text-sm font-600 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
                Se connecter
              </Link>
              <Link href="/signup" className="text-sm font-600 text-white px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:scale-105" style={{ background: 'linear-gradient(135deg, #6B9B5F, #5A8A4E)', boxShadow: '0 4px 14px rgba(107,155,95,0.35)' }}>
                Commencer
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
            {['Fonctionnalités', 'Employeurs', 'Tarifs', 'Témoignages'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-4 rounded-xl text-gray-700 font-500 hover:bg-gray-50">
                {item}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/signin" className="text-center py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-600 hover:bg-gray-50">Se connecter</Link>
              <Link href="/signup" className="text-center py-2.5 px-4 rounded-xl text-white font-600" style={{ background: '#6B9B5F' }}>Commencer</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen pt-20 pb-16 overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #F0F7EE 40%, #ffffff 100%)' }}>
        {/* Background blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-20 blob-shape" style={{ background: 'radial-gradient(circle, #6B9B5F, #93C587)' }} />
        <div className="absolute bottom-20 left-10 w-56 h-56 rounded-full opacity-10 blob-shape" style={{ background: 'radial-gradient(circle, #7C3AED, #a78bfa)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">

            {/* Left — Text (60%) */}
            <div className="lg:col-span-3 slide-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-600 mb-6 fade-in" style={{ background: '#F0F7EE', borderColor: '#6B9B5F', color: '#6B9B5F' }}>
                <span className="w-2 h-2 rounded-full pulse-ring" style={{ background: '#6B9B5F' }} />
                IA-Powered Matching — Afrique de l'Ouest
              </div>

              {/* H1 */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-800 leading-[1.05] tracking-tight mb-6">
                <span className="text-gray-900">Trouvez le</span>
                <br />
                <span className="shimmer-text">talent parfait</span>
                <br />
                <span className="text-gray-900">en Afrique</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-xl fade-in delay-200">
                INTOWORK connecte candidats talentueux et entreprises leaders grâce à une IA de matching à 94% de précision. Recrutez mieux, plus vite.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 fade-in delay-300">
                <Link href="/signup" className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-white font-700 text-lg transition-all hover:shadow-xl hover:scale-105 group" style={{ background: 'linear-gradient(135deg, #6B9B5F, #5A8A4E)', boxShadow: '0 8px 24px rgba(107,155,95,0.4)' }}>
                  Commencer gratuitement
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
                <button className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-700 text-lg border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clipRule="evenodd" />
                  </svg>
                  Voir la démo
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 fade-in delay-500">
                {[
                  { value: '10 000+', label: 'Candidats actifs' },
                  { value: '500+', label: 'Entreprises partenaires' },
                  { value: '94%', label: 'Taux de matching' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-800 text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500 font-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Photos Stack (40%) */}
            <div className="lg:col-span-2 relative h-[520px] slide-right">
              {/* Green background shape */}
              <div className="absolute inset-8 rounded-3xl opacity-40" style={{ background: 'linear-gradient(135deg, #F0F7EE, #d1e8cb)' }} />

              {/* Photo 1 — top left */}
              <div className="absolute top-4 left-0 w-44 h-52 rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-30 card-hover">
                <img src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80" alt="Professionnelle africaine" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Photo 2 — center right */}
              <div className="absolute top-24 right-0 w-40 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-white z-20 card-hover">
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80" alt="Professionnel" className="w-full h-full object-cover" />
              </div>

              {/* Photo 3 — bottom center */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-44 rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-10 card-hover">
                <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80" alt="Femme souriante" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating badge — bottom */}
              <div className="absolute bottom-2 left-2 z-40 float-badge">
                <div className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#F0F7EE' }}>
                    <svg viewBox="0 0 20 20" fill="#6B9B5F" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-700 text-gray-900">Kofi Mensah</div>
                    <div className="text-xs text-gray-500">Placé chez Orange CI</div>
                  </div>
                </div>
              </div>

              {/* Floating badge — top right */}
              <div className="absolute top-0 right-4 z-40 float-badge-2">
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-xl border border-gray-100">
                  <span className="text-base">⚡</span>
                  <div>
                    <div className="text-xs font-800" style={{ color: '#6B9B5F' }}>94% matching</div>
                    <div className="text-xs text-gray-400">Score IA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS PARTENAIRES ── */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-600 text-gray-400 uppercase tracking-widest mb-10">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {PARTNERS.map((partner) => (
              <div key={partner} className="text-xl font-800 text-gray-300 hover:text-gray-500 transition-colors cursor-default select-none tracking-tight">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalités" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-600 mb-4" style={{ background: '#F0F7EE', color: '#6B9B5F' }}>
              Fonctionnalités clés
            </div>
            <h2 className="text-4xl lg:text-5xl font-800 text-gray-900 leading-tight mb-4">
              Tout ce dont vous avez besoin pour recruter mieux
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              Des outils puissants conçus pour le marché de l'emploi en Afrique de l'Ouest.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-8">
            {FEATURES.map((feature, index) => (
              <div key={feature.title} className={`rounded-3xl overflow-hidden border border-gray-100 shadow-sm card-hover ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Text Side */}
                  <div className={`p-10 lg:p-14 flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6" style={{ background: '#F0F7EE', color: '#6B9B5F' }}>
                      {feature.icon}
                    </div>
                    <div className="text-xs font-700 uppercase tracking-widest mb-2" style={{ color: '#6B9B5F' }}>
                      {feature.subtitle}
                    </div>
                    <h3 className="text-3xl font-800 text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-lg text-gray-500 leading-relaxed mb-6">{feature.description}</p>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-700 ${feature.badgeColor}`}>{feature.badge}</span>
                      <Link href="/signup" className="text-sm font-600 hover:underline" style={{ color: '#6B9B5F' }}>
                        En savoir plus →
                      </Link>
                    </div>
                  </div>

                  {/* Visual Side */}
                  <div className={`relative min-h-64 lg:min-h-80 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.mockupBg}`} />
                    {/* Mockup placeholder */}
                    <div className="absolute inset-6 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center">
                      <div className="text-center space-y-3 p-6">
                        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: '#F0F7EE', color: '#6B9B5F' }}>
                          {feature.icon}
                        </div>
                        <div className="space-y-2">
                          {[80, 60, 90, 50].map((w, i) => (
                            <div key={i} className="h-2 rounded-full bg-gray-100 mx-auto" style={{ width: `${w}%` }} />
                          ))}
                        </div>
                        <div className={`inline-flex px-3 py-1 rounded-full text-xs font-700 ${feature.badgeColor}`}>{feature.badge}</div>
                      </div>
                    </div>
                    {/* Human photo in corner */}
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl z-10">
                      <img src={feature.photo} alt={feature.photoAlt} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORIES ── */}
      <section className="py-24" style={{ background: '#F0F7EE' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-600 mb-4 bg-white" style={{ color: '#6B9B5F' }}>
              Histoires de succès
            </div>
            <h2 className="text-4xl lg:text-5xl font-800 text-gray-900 leading-tight">
              Ils ont trouvé leur voie avec INTOWORK
            </h2>
          </div>

          {/* Cards */}
          <div className="space-y-6">
            {SUCCESS_STORIES.map((story, index) => (
              <div key={story.name} className={`rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 card-hover ${story.bg}`}>
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg">
                      <img src={story.photo} alt={story.name} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-4 mb-3">
                      <div>
                        <div className="text-xl font-800 text-gray-900">{story.name}</div>
                        <div className="text-sm font-600 text-gray-500">{story.role}</div>
                        <div className="text-sm font-700" style={{ color: '#6B9B5F' }}>{story.company}</div>
                      </div>
                      <div className="ml-auto">
                        <span className="px-4 py-2 rounded-xl text-sm font-800" style={{ background: 'rgba(107,155,95,0.12)', color: '#6B9B5F' }}>
                          {story.metric}
                        </span>
                      </div>
                    </div>
                    <blockquote className="text-gray-600 text-lg leading-relaxed italic">
                      "{story.quote}"
                    </blockquote>
                    {/* Stars */}
                    <div className="flex gap-1 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} viewBox="0 0 20 20" fill="#F59E0B" className="w-4 h-4">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #6B9B5F, #4a7a40)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-600 mb-4 bg-white/10 text-white">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Sécurité & Conformité
            </div>
            <h2 className="text-4xl lg:text-5xl font-800 text-white leading-tight mb-4">
              Vos données en sécurité,<br />toujours
            </h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto">
              Une infrastructure de sécurité enterprise-grade pour protéger candidats et employeurs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECURITY_POINTS.map((point) => (
              <div key={point.title} className="bg-white/10 backdrop-blur rounded-2xl p-8 text-white card-hover hover:bg-white/20">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-white">
                  {point.icon}
                </div>
                <h3 className="text-lg font-700 mb-3">{point.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-600 mb-4" style={{ background: '#F0F7EE', color: '#6B9B5F' }}>
                Offres en Vedette
              </div>
              <h2 className="text-4xl lg:text-5xl font-800 text-gray-900">
                Les meilleures opportunités<br />du moment
              </h2>
            </div>
            <Link href="/signup" className="inline-flex items-center gap-2 font-700 text-sm px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all whitespace-nowrap" style={{ color: '#6B9B5F' }}>
              Voir toutes les offres
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4 8a.5.5 0 01.5-.5h5.793L8.146 5.354a.5.5 0 11.708-.708l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L10.293 8.5H4.5A.5.5 0 014 8z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-8">
            {(['candidates', 'employers'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-xl text-sm font-600 transition-all ${activeTab === tab ? 'text-white shadow-md' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}`} style={activeTab === tab ? { background: '#6B9B5F' } : {}}>
                {tab === 'candidates' ? 'Pour candidats' : 'Pour employeurs'}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_JOBS.map((job) => (
              <div key={job.title} className="rounded-2xl border border-gray-100 shadow-sm bg-white p-6 card-hover group cursor-pointer">
                {/* Company logo placeholder */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-800 text-gray-500 text-xs">
                    {job.company.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-700 ${job.badgeColor}`}>{job.badge}</span>
                </div>

                <h3 className="text-lg font-700 text-gray-900 mb-1 group-hover:text-[#6B9B5F] transition-colors">{job.title}</h3>
                <p className="text-sm font-600 text-gray-500 mb-4">{job.company}</p>

                <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-5">
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M7.5 1a5.5 5.5 0 100 11A5.5 5.5 0 007.5 1zm-4 5.5a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd" />
                    </svg>
                    {job.location}
                  </span>
                  <span>•</span>
                  <span>{job.type}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-700 text-gray-900">{job.salary}</span>
                  <Link href="/signup" className="text-xs font-700 px-4 py-2 rounded-xl text-white transition-all hover:shadow-md" style={{ background: '#6B9B5F' }}>
                    Postuler
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="témoignages" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-600 mb-4" style={{ background: '#F0F7EE', color: '#6B9B5F' }}>
              Témoignages
            </div>
            <h2 className="text-4xl lg:text-5xl font-800 text-gray-900 leading-tight mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-lg text-gray-500">
              Des milliers de candidats et d'entreprises font confiance à INTOWORK chaque jour.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className="rounded-2xl border border-gray-100 shadow-sm bg-white p-8 card-hover flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" fill="#F59E0B" className="w-5 h-5">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 text-base leading-relaxed flex-1 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Metric badge */}
                <div className="mb-6">
                  <span className="px-3 py-1.5 rounded-lg text-xs font-800" style={{ background: 'rgba(107,155,95,0.1)', color: '#6B9B5F' }}>
                    {testimonial.metric}
                  </span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm flex-shrink-0">
                    <img src={testimonial.photo} alt={testimonial.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-700 text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500 font-500 mt-0.5">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-600 mb-4" style={{ background: '#F0F7EE', color: '#6B9B5F' }}>
              Tarifs transparents
            </div>
            <h2 className="text-4xl lg:text-5xl font-800 text-gray-900 leading-tight mb-4">
              Un plan pour chaque besoin
            </h2>
            <p className="text-lg text-gray-500">
              Commencez gratuitement. Évoluez selon vos ambitions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-center">
            {PRICING.map((plan) => (
              <div key={plan.name} className={`relative rounded-3xl border p-8 lg:p-10 flex flex-col card-hover ${plan.highlight ? 'border-[#6B9B5F] shadow-2xl scale-105 z-10' : 'border-gray-100 shadow-sm bg-white'}`} style={plan.highlight ? { background: 'linear-gradient(145deg, #ffffff, #F0F7EE)' } : {}}>
                {/* Popular badge */}
                {plan.badgeText && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full text-sm font-700 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #6B9B5F, #4a7a40)' }}>
                      {plan.badgeText}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-6">
                  <div className="text-xs font-700 uppercase tracking-widest mb-2" style={{ color: plan.highlight ? '#6B9B5F' : '#9ca3af' }}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-800 text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-400 font-500">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: plan.highlight ? '#6B9B5F' : '#F0F7EE' }}>
                        <svg viewBox="0 0 12 12" fill={plan.highlight ? 'white' : '#6B9B5F'} className="w-3 h-3">
                          <path fillRule="evenodd" d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                      </div>
                      <span className="font-500">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.ctaHref} className={`w-full text-center py-4 rounded-2xl font-700 text-sm transition-all hover:shadow-lg ${plan.highlight ? 'text-white hover:scale-105' : 'border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`} style={plan.highlight ? { background: 'linear-gradient(135deg, #6B9B5F, #5A8A4E)', boxShadow: '0 4px 14px rgba(107,155,95,0.3)' } : {}}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Trust note */}
          <div className="text-center mt-12 text-sm text-gray-400 font-500">
            Pas de carte bancaire requise pour démarrer. Annulez à tout moment.
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #6B9B5F 0%, #4a7a40 50%, #3a6030 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Decorative elements */}
          <div className="absolute left-1/4 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: 'white' }} />

          <div className="relative">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-800 text-white leading-tight mb-6">
              Prêt à transformer<br />votre recrutement ?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Rejoignez 10 000+ professionnels qui utilisent INTOWORK pour trouver les meilleures opportunités en Afrique de l'Ouest.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2.5 px-10 py-5 rounded-2xl font-700 text-lg text-[#6B9B5F] bg-white hover:bg-gray-50 transition-all hover:shadow-xl hover:scale-105 shadow-lg">
                Commencer gratuitement
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/signin" className="inline-flex items-center justify-center gap-2.5 px-10 py-5 rounded-2xl font-700 text-lg text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all">
                Se connecter
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm font-500">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/40">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Inscription gratuite
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/40">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Sans carte bancaire
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/40">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Support 24/7
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER DARK ── */}
      <footer style={{ background: '#111111' }} className="text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-gray-800">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6B9B5F, #4a7a40)' }}>
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                </div>
                <span className="text-xl font-800 text-white tracking-tight">
                  INTO<span style={{ color: '#6B9B5F' }}>WORK</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 max-w-xs mb-6">
                La plateforme de recrutement IA leader en Afrique de l'Ouest. Connecter les talents aux opportunités depuis 2024.
              </p>
              {/* Social */}
              <div className="flex gap-3">
                {[
                  { name: 'LinkedIn', path: 'M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z' },
                  { name: 'Twitter', path: 'M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.521 8.521 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z' },
                ].map((social) => (
                  <a key={social.name} href="#" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors group">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: 'Plateforme',
                links: ['Candidats', 'Employeurs', 'Matching IA', 'Analytics', 'API'],
              },
              {
                title: 'Entreprise',
                links: ['À propos', 'Blog', 'Carrières', 'Presse', 'Contact'],
              },
              {
                title: 'Légal',
                links: ['Confidentialité', 'Conditions', 'Cookies', 'RGPD', 'Sécurité'],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-700 text-white mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 hover:text-gray-200 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © 2025 INTOWORK Search. Tous droits réservés. Fait avec passion en Afrique de l'Ouest.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-600">Tous systèmes opérationnels</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
