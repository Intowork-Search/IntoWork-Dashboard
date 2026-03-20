'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

// ─── Data ────────────────────────────────────────────────────────────────────

const LOGOS = [
  { name: 'Orange', initials: 'OR', color: '#FF6600', bg: '#FFF3E8' },
  { name: 'MTN', initials: 'MT', color: '#FFCC00', bg: '#FFFBE0' },
  { name: 'Ecobank', initials: 'EC', color: '#003DA5', bg: '#E8EEFF' },
  { name: 'TotalEnergies', initials: 'TE', color: '#D10000', bg: '#FFEAEA' },
  { name: 'Bolloré', initials: 'BO', color: '#1A1A5C', bg: '#EEEEF8' },
  { name: 'Nestlé', initials: 'NE', color: '#00529B', bg: '#E8F2FF' },
  { name: 'SocGen', initials: 'SG', color: '#E60028', bg: '#FFEBEE' },
  { name: 'CIE', initials: 'CI', color: '#006633', bg: '#E8F5EC' },
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    accent: '#7C3AED',
    accentBg: '#F3EDFF',
    badge: 'Intelligence Artificielle',
    title: 'Matching IA Instantané',
    description: 'Notre algorithme analyse 200+ critères pour connecter les bons candidats aux bonnes entreprises en temps réel. Taux de pertinence moyen de 94%.',
    highlights: [
      'Analyse de compétences en profondeur',
      'Compatibilité culturelle & valeurs',
      'Prédiction de performance à 6 mois',
      'Recommandations personnalisées IA',
    ],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    accent: '#6B9B5F',
    accentBg: '#F0F7EE',
    badge: 'CV Intelligent',
    title: 'Construisez un CV qui convertit',
    description: 'Le CV Builder IA analyse les offres d\'emploi et optimise automatiquement votre CV pour maximiser vos chances. Augmentez vos réponses de 3x.',
    highlights: [
      'Templates ATS-optimisés',
      'Suggestions de mots-clés IA',
      'Analyse des lacunes de compétences',
      'Export PDF professionnel',
    ],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    accent: '#F59E0B',
    accentBg: '#FFFBEB',
    badge: 'Alertes Emploi',
    title: 'Ne manquez aucune opportunité',
    description: 'Configurez des alertes intelligentes et recevez en temps réel les offres qui correspondent exactement à votre profil. Soyez le premier à postuler.',
    highlights: [
      'Notifications instantanées SMS & email',
      'Filtres avancés personnalisables',
      'Alertes par secteur, ville, salaire',
      'Digest hebdomadaire personnalisé',
    ],
  },
];

const SECURITY_CARDS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    color: '#6B9B5F',
    bg: '#F0F7EE',
    title: 'RGPD Compliant',
    description: 'Vos données sont protégées selon les standards européens les plus stricts. Contrôle total sur vos informations.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    color: '#003DA5',
    bg: '#E8EEFF',
    title: 'SSL 256-bit',
    description: 'Chiffrement de bout en bout pour toutes vos communications et données sensibles sur la plateforme.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
      </svg>
    ),
    color: '#7C3AED',
    bg: '#F3EDFF',
    title: 'SOC2 Type II',
    description: 'Audité et certifié SOC2 Type II. Vos données sont entre les mains d\'une infrastructure de confiance.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    color: '#F59E0B',
    bg: '#FFFBEB',
    title: 'SLA 99.9%',
    description: 'Disponibilité garantie 99.9% avec infrastructure multi-régions en Afrique. Support 24/7 en cas d\'incident.',
  },
];

const FEATURED_JOBS = [
  {
    company: 'Orange',
    initials: 'OR',
    color: '#FF6600',
    bg: '#FFF3E8',
    title: 'Développeur Full Stack',
    location: 'Abidjan',
    type: 'Hybride',
    salary: '800K – 1,2M FCFA',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    posted: 'Il y a 2 jours',
  },
  {
    company: 'MTN Cameroun',
    initials: 'MT',
    color: '#FFCC00',
    bg: '#FFFBE0',
    title: 'Chef de Projet Marketing',
    location: 'Douala',
    type: 'Présentiel',
    salary: '700K – 900K FCFA',
    tags: ['Marketing Digital', 'Analytics', 'B2C'],
    posted: 'Il y a 1 jour',
  },
  {
    company: 'Ecobank Sénégal',
    initials: 'EC',
    color: '#003DA5',
    bg: '#E8EEFF',
    title: 'Analyste Financier Senior',
    location: 'Dakar',
    type: 'Présentiel',
    salary: '900K – 1,3M FCFA',
    tags: ['Finance', 'Excel', 'Reporting'],
    posted: 'Il y a 3 jours',
  },
];

const TESTIMONIALS = [
  {
    photo: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80',
    name: 'Aminata Diallo',
    role: 'DRH',
    company: 'Société Générale Dakar',
    quote: 'Nous avons réduit notre temps de recrutement de 60%. INTOWORK nous propose des profils parfaitement adaptés à notre culture d\'entreprise.',
    metric: '-60% temps de recrutement',
    metricColor: '#6B9B5F',
  },
  {
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    name: 'Moussa Koné',
    role: 'Ingénieur Logiciel',
    company: 'Candidat embauché',
    quote: 'J\'ai trouvé mon emploi en 2 semaines grâce au matching IA. La plateforme a su comprendre exactement mon profil et mes aspirations.',
    metric: 'Embauché en 2 semaines',
    metricColor: '#7C3AED',
  },
  {
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
    name: 'Fatou Ndiaye',
    role: 'Responsable RH',
    company: 'TotalÉnergies Sénégal',
    quote: 'La qualité des candidats est exceptionnelle. Notre taux de rétention a augmenté de 92% depuis qu\'on utilise INTOWORK.',
    metric: '92% rétention',
    metricColor: '#F59E0B',
  },
];

const PRICING = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: '',
    target: 'Candidats',
    description: 'Commencez votre recherche d\'emploi sans frais.',
    features: [
      'Profil candidat basique',
      '5 candidatures / mois',
      'Alertes emploi standard',
      'Accès offres publiques',
      'CV builder basique',
    ],
    cta: 'Créer mon compte',
    ctaLink: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '9 900',
    period: 'FCFA / mois',
    target: 'Candidats',
    description: 'Maximisez vos chances avec l\'IA et les outils premium.',
    features: [
      'Profil candidat premium',
      'Candidatures illimitées',
      'Matching IA prioritaire',
      'CV Builder IA avancé',
      'Alertes emploi instantanées',
      'Support prioritaire 24/7',
    ],
    cta: 'Commencer Pro',
    ctaLink: '/signup',
    highlighted: true,
    badge: 'Plus populaire',
  },
  {
    name: 'Recruteur',
    price: 'Sur devis',
    period: '',
    target: 'Employeurs',
    description: 'Pour les entreprises qui veulent recruter les meilleurs.',
    features: [
      'Offres d\'emploi illimitées',
      'Accès base candidats complète',
      'Matching IA avancé',
      'Analytics RH en temps réel',
      'Account manager dédié',
      'Intégrations ATS / SIRH',
    ],
    cta: 'Contacter les ventes',
    ctaLink: '/signup',
    highlighted: false,
  },
];

const STATS = [
  { value: '10 000+', label: 'Candidats actifs' },
  { value: '500+', label: 'Entreprises partenaires' },
  { value: '15+', label: 'Pays couverts' },
  { value: '94%', label: 'Matching IA précis' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Mockup3() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`${plusJakarta.className} antialiased bg-white text-gray-900 overflow-x-hidden`}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(107, 155, 95, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(107, 155, 95, 0); }
        }
        .fade-in-up { animation: fadeInUp 0.7s ease both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .scroll-track { display: flex; animation: scrollLeft 30s linear infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #6B9B5F 0%, #93C587 40%, #6B9B5F 80%);
          background-size: 200% auto;
          animation: shimmer 3s ease-in-out infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pulse-green { animation: pulseGreen 2s ease-in-out infinite; }
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.10); }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-[#6B9B5F] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white text-xs font-extrabold tracking-tight">IW</span>
              </div>
              <span className="text-gray-900 font-extrabold text-lg tracking-tight">
                INTO<span className="text-[#6B9B5F]">WORK</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {['Offres', 'Recruteurs', 'Tarifs', 'À propos'].map((item) => (
                <Link
                  key={item}
                  href={item === 'Offres' ? '/offres' : '#'}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#6B9B5F] rounded-lg hover:bg-green-50 transition-all duration-150"
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/signin"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#6B9B5F] transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                S'inscrire
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-100 px-4 pb-4">
            <div className="flex flex-col gap-1 pt-2">
              {['Offres', 'Recruteurs', 'Tarifs', 'À propos'].map((item) => (
                <Link key={item} href={item === 'Offres' ? '/offres' : '#'}
                  className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#6B9B5F] rounded-lg hover:bg-green-50"
                  onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </Link>
              ))}
              <div className="flex gap-3 pt-3 border-t border-gray-100 mt-2">
                <Link href="/signin" className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl">
                  Se connecter
                </Link>
                <Link href="/signup" className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-[#6B9B5F] rounded-xl">
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO SPLIT-SCREEN ───────────────────────────────────────────── */}
      <section className="min-h-screen pt-16 flex flex-col lg:flex-row">

        {/* LEFT PANEL — Candidats */}
        <div className="relative flex-1 lg:w-[55%] bg-white flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 lg:py-24 overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#6B9B5F]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-lg fade-in-up delay-100">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 shadow-sm mb-6">
              <svg className="w-4 h-4 text-[#6B9B5F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="text-sm font-semibold text-[#6B9B5F] uppercase tracking-wide">Candidats</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 mb-5">
              Trouve ton emploi{' '}
              <span className="shimmer-text">idéal</span>
              {' '}en Afrique de l'Ouest
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Des milliers d'opportunités dans 15+ pays africains.{' '}
              <span className="font-semibold text-gray-700">Matching IA en temps réel</span>{' '}
              pour accélérer votre carrière.
            </p>

            {/* CTA */}
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Espace Candidat
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            {/* Photo with floating badge */}
            <div className="relative mt-10 fade-in-up delay-300">
              <div className="float-anim relative inline-block">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white" style={{ maxWidth: 420 }}>
                  <img
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&q=80"
                    alt="Candidat africain cherchant un emploi sur laptop"
                    className="w-full h-64 sm:h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-2 pulse-green">
                  <div className="w-8 h-8 rounded-full bg-[#F0F7EE] flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#6B9B5F]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">Matching IA</div>
                    <div className="text-lg font-extrabold text-[#6B9B5F]">94%</div>
                  </div>
                </div>
                {/* Second floating badge bottom-left */}
                <div className="absolute -bottom-3 left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-gray-700">2 847 offres disponibles</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER DIVIDER */}
        <div className="hidden lg:flex flex-col items-center justify-center relative z-10 px-0" style={{ width: 2 }}>
          <div className="w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent h-full absolute" />
          <div className="relative z-20 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-[#6B9B5F] shadow-lg flex items-center justify-center">
              <span className="text-sm font-extrabold text-[#6B9B5F]">IW</span>
            </div>
            <span className="text-xs font-semibold text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-100 mt-1">ou</span>
          </div>
        </div>

        {/* Mobile divider */}
        <div className="lg:hidden flex items-center gap-4 px-8 py-6">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-[#6B9B5F] shadow-lg flex items-center justify-center">
              <span className="text-sm font-extrabold text-[#6B9B5F]">IW</span>
            </div>
            <span className="text-xs text-gray-400 font-semibold">ou</span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* RIGHT PANEL — Recruteurs */}
        <div className="relative lg:w-[45%] bg-[#F0F7EE] flex flex-col justify-center px-8 sm:px-12 lg:px-14 py-16 lg:py-24 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-20 right-10 w-56 h-56 bg-[#6B9B5F]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#5A8A4E]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-md fade-in-up delay-200">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#6B9B5F]/30 shadow-sm mb-6">
              <svg className="w-4 h-4 text-[#5A8A4E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              <span className="text-sm font-semibold text-[#5A8A4E] uppercase tracking-wide">Recruteurs</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 mb-5">
              Recrutez les{' '}
              <span className="text-[#5A8A4E]">meilleurs</span>{' '}
              talents africains
            </h2>

            {/* Subtitle */}
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Accédez à{' '}
              <span className="font-bold text-gray-900">10 000+ candidats qualifiés</span>{' '}
              vérifiés. Publiez une offre en moins de 5 minutes.
            </p>

            {/* CTA */}
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-white bg-[#5A8A4E] hover:bg-[#4A7A3E] rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Espace Recruteur
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            {/* Photo with floating badge */}
            <div className="relative mt-10 fade-in-up delay-400">
              <div className="float-anim relative inline-block" style={{ animationDelay: '1s' }}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/60" style={{ maxWidth: 380 }}>
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80"
                    alt="Recruteur africain en bureau"
                    className="w-full h-64 sm:h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F0F7EE] flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#5A8A4E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">Entreprises</div>
                    <div className="text-lg font-extrabold text-[#5A8A4E]">500+</div>
                  </div>
                </div>
                {/* Second badge */}
                <div className="absolute -bottom-3 left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-gray-700">Recrutement en cours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-4xl font-extrabold text-[#6B9B5F] mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOGOS TICKER ───────────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50 border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Ils nous font confiance</p>
        </div>
        <div className="relative overflow-hidden">
          <div className="scroll-track gap-8 px-4">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: logo.bg, color: logo.color }}
                >
                  {logo.initials}
                </div>
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0F7EE] border border-green-200/60 mb-5">
              <div className="w-2 h-2 rounded-full bg-[#6B9B5F]" />
              <span className="text-sm font-semibold text-[#6B9B5F]">Fonctionnalités</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Une plateforme pensée pour l'Afrique
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des outils puissants pour les candidats et les recruteurs, adaptés aux réalités du marché africain.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="group bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover-lift fade-in-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: feature.accentBg, color: feature.accent }}
                >
                  {feature.icon}
                </div>
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{ backgroundColor: feature.accentBg, color: feature.accent }}
                >
                  {feature.badge}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.highlights.map((h, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: feature.accentBg }}
                      >
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: feature.accent }}>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ───────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-5 shadow-sm">
              <svg className="w-4 h-4 text-[#6B9B5F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Sécurité & Conformité</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Vos données sont entre de bonnes mains
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Infrastructure sécurisée aux standards internationaux pour protéger vos informations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECURITY_CARDS.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover-lift fade-in-up text-center"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: card.bg, color: card.color }}
                >
                  {card.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ──────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0F7EE] border border-green-200/60 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#6B9B5F] animate-pulse" />
                <span className="text-sm font-semibold text-[#6B9B5F]">Mises à jour en temps réel</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Offres en vedette</h2>
              <p className="text-gray-600 mt-2">Les opportunités les plus recherchées du moment</p>
            </div>
            <Link
              href="/offres"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B9B5F] hover:text-[#5A8A4E] transition-colors"
            >
              Voir toutes les offres
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_JOBS.map((job, i) => (
              <div
                key={i}
                className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover-lift fade-in-up flex flex-col"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Company header */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: job.bg, color: job.color }}
                  >
                    {job.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 font-medium">{job.company}</p>
                  </div>
                </div>

                {/* Location & type */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-600 border border-gray-100">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {job.location}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-[#F0F7EE] rounded-full text-xs font-semibold text-[#6B9B5F]">
                    {job.type}
                  </span>
                </div>

                {/* Salary */}
                <div className="flex items-center gap-2 mb-5">
                  <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                    <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-gray-900">{job.salary}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.tags.map((tag, j) => (
                    <span key={j} className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-xs text-gray-400">{job.posted}</span>
                  <Link
                    href="/offres"
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Voir l'offre
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-5">
              <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">4.9/5 — Plus de 2 000 avis</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ce qu'ils disent de nous</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Des milliers de candidats et d'employeurs nous font confiance chaque jour.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover-lift fade-in-up flex flex-col"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote mark */}
                <div className="text-6xl font-extrabold text-[#6B9B5F]/20 leading-none mb-2 select-none">"</div>

                {/* Quote text */}
                <blockquote className="text-gray-700 leading-relaxed flex-1 mb-6 text-sm">
                  {t.quote}
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4 pt-5 border-t border-gray-100">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#F0F7EE] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.role}</div>
                    <div className="text-xs text-gray-400">{t.company}</div>
                  </div>
                </div>

                {/* Metric pill */}
                <div className="mt-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: t.metricColor }}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    {t.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0F7EE] border border-green-200/60 mb-5">
              <div className="w-2 h-2 rounded-full bg-[#6B9B5F]" />
              <span className="text-sm font-semibold text-[#6B9B5F]">Tarifs transparents</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choisissez votre plan
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Que vous soyez candidat ou recruteur, nous avons une offre adaptée à vos besoins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {PRICING.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 flex flex-col fade-in-up transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-[#6B9B5F] text-white shadow-2xl scale-105 ring-4 ring-[#6B9B5F]/20'
                    : 'bg-white border border-gray-200 shadow-sm hover:shadow-lg'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-white text-[#6B9B5F] text-xs font-bold px-4 py-1.5 rounded-full shadow-md border border-[#6B9B5F]/20">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                    plan.highlighted ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {plan.target}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-sm font-medium ${plan.highlighted ? 'text-white/80' : 'text-gray-500'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlighted ? 'text-white/80' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'bg-white/20' : 'bg-[#F0F7EE]'
                      }`}>
                        <svg className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-[#6B9B5F]'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.ctaLink}
                  className={`block w-full text-center py-3.5 px-6 rounded-xl text-sm font-bold transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-white text-[#6B9B5F] hover:bg-gray-50 shadow-lg hover:shadow-xl'
                      : 'bg-[#6B9B5F] text-white hover:bg-[#5A8A4E] shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-[#6B9B5F] relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/5 rounded-full translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 mb-8">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-semibold text-white">Inscription gratuite</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Prêt à transformer votre carrière ?
          </h2>

          <p className="text-lg sm:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
            Rejoignez <strong className="text-white">10 000+ candidats</strong> et{' '}
            <strong className="text-white">500+ entreprises</strong> qui font confiance à INTOWORK Search.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#6B9B5F] font-bold text-base rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Commencer gratuitement
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/offres"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-bold text-base rounded-2xl border-2 border-white/40 hover:border-white/80 hover:bg-white/10 transition-all duration-200"
            >
              Voir les offres
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            {[
              { icon: '🔒', text: 'Inscription sécurisée' },
              { icon: '✅', text: 'Sans carte bancaire' },
              { icon: '🌍', text: '15 pays couverts' },
              { icon: '⚡', text: 'Résultats en 24h' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#1a1a1a] text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#6B9B5F] flex items-center justify-center">
                  <span className="text-white text-xs font-extrabold">IW</span>
                </div>
                <span className="text-white font-extrabold text-lg">
                  INTO<span className="text-[#6B9B5F]">WORK</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-5">
                La plateforme de recrutement intelligente pour l'Afrique de l'Ouest. Connectons talents et opportunités.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <svg className="w-4 h-4 text-[#6B9B5F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Présent dans : Côte d'Ivoire, Sénégal, Cameroun, Mali, Burkina Faso, Guinée, Togo, Bénin...
              </div>
              {/* Social links */}
              <div className="flex items-center gap-3">
                {['linkedin', 'twitter', 'facebook'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#6B9B5F]/20 border border-white/10 flex items-center justify-center transition-colors"
                  >
                    <span className="text-xs text-gray-400 font-semibold capitalize">{social[0].toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Candidats */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Candidats</h4>
              <ul className="space-y-3">
                {['Chercher un emploi', 'Mon profil', 'Mon CV', 'Mes candidatures', 'Alertes emploi', 'Ressources carrière'].map((item) => (
                  <li key={item}>
                    <Link href="/offres" className="text-sm hover:text-[#6B9B5F] transition-colors duration-150">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recruteurs */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Recruteurs</h4>
              <ul className="space-y-3">
                {['Publier une offre', 'Rechercher des profils', 'ATS intégré', 'Matching IA', 'Analytics RH', 'Tarifs entreprise'].map((item) => (
                  <li key={item}>
                    <Link href="/signup" className="text-sm hover:text-[#6B9B5F] transition-colors duration-150">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Entreprise */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Entreprise</h4>
              <ul className="space-y-3">
                {['À propos', 'Blog RH', 'Presse', 'Partenariats', 'Contact', 'Mentions légales'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-[#6B9B5F] transition-colors duration-150">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              © 2024 INTOWORK Search. Tous droits réservés. Fait avec ❤️ pour l'Afrique.
            </p>
            <div className="flex items-center gap-6">
              {['Confidentialité', 'CGU', 'Cookies'].map((item) => (
                <a key={item} href="#" className="text-xs text-gray-500 hover:text-[#6B9B5F] transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
