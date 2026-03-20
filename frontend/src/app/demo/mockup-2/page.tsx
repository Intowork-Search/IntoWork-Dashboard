'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '50K+', label: 'Candidats actifs' },
  { value: '2K+', label: 'Entreprises' },
  { value: '94%', label: 'Précision IA' },
  { value: '48h', label: 'Placement moyen' },
];

const PARTNER_LOGOS = [
  'Orange', 'Ecobank', 'Total Energies', 'MTN', 'Bolloré', 'Canal+',
  'Orange', 'Ecobank', 'Total Energies', 'MTN', 'Bolloré', 'Canal+',
];

const FEATURES = [
  {
    badge: 'Intelligence Artificielle',
    title: 'Matching IA à 94% de précision',
    description:
      "Notre algorithme analyse plus de 200 critères pour connecter les candidats aux postes qui leur correspondent vraiment. Fini les candidatures à l'aveugle, place à la pertinence.",
    items: [
      'Analyse sémantique des CV et offres',
      'Score de compatibilité en temps réel',
      'Recommandations personnalisées',
      'Apprentissage continu des préférences',
    ],
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80',
    photoAlt: 'Professionnelle africaine au bureau',
    reverse: false,
  },
  {
    badge: 'Gestion des candidatures',
    title: 'Pipeline de recrutement visuel',
    description:
      'Suivez chaque candidature en temps réel sur un tableau kanban intuitif. Les recruteurs gèrent leur pipeline, les candidats restent informés à chaque étape.',
    items: [
      'Tableau kanban personnalisable',
      'Notifications automatiques',
      'Historique complet des échanges',
      'Rapports et analytics avancés',
    ],
    photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    photoAlt: 'Bureau moderne open space',
    reverse: true,
  },
  {
    badge: 'Communication intégrée',
    title: 'Messagerie directe & entretiens',
    description:
      'Échangez directement sur la plateforme, planifiez des entretiens vidéo et gardez tout votre historique de communication centralisé.',
    items: [
      'Chat en temps réel sécurisé',
      'Planification d\'entretiens intégrée',
      'Visioconférence native',
      'Templates de messages personnalisables',
    ],
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    photoAlt: 'Homme professionnel avec laptop',
    reverse: false,
  },
];

const SECURITY_ITEMS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Conformité RGPD',
    desc: 'Vos données sont protégées selon les standards européens les plus stricts.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Chiffrement SSL 256-bit',
    desc: 'Toutes les communications sont chiffrées de bout en bout avec TLS 1.3.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Certification SOC 2',
    desc: 'Audits de sécurité indépendants réalisés trimestriellement.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'SLA 99.9% uptime',
    desc: 'Infrastructure redondante garantissant une disponibilité maximale.',
  },
];

const FEATURED_JOBS = [
  {
    company: 'Orange Digital Center',
    logo: 'OD',
    logoColor: '#FF6600',
    role: 'Développeur Full Stack',
    location: 'Dakar, Sénégal',
    type: 'CDI',
    salary: '800K – 1.2M FCFA',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    isNew: true,
  },
  {
    company: 'Ecobank',
    logo: 'EB',
    logoColor: '#003087',
    role: 'Marketing Manager',
    location: 'Abidjan, Côte d\'Ivoire',
    type: 'CDI',
    salary: '1.2M – 1.8M FCFA',
    tags: ['Digital Marketing', 'CRM', 'Analytics'],
    isNew: false,
  },
  {
    company: 'TotalEnergies',
    logo: 'TE',
    logoColor: '#C8102E',
    role: 'Data Analyst',
    location: 'Lomé, Togo',
    type: 'CDD',
    salary: '700K – 1M FCFA',
    tags: ['Python', 'Power BI', 'SQL'],
    isNew: true,
  },
  {
    company: 'MTN Group',
    logo: 'MT',
    logoColor: '#FFCC00',
    role: 'Chef de Projet IT',
    location: 'Cotonou, Bénin',
    type: 'CDI',
    salary: '900K – 1.4M FCFA',
    tags: ['Agile', 'PMP', 'Telecoms'],
    isNew: false,
  },
];

// Stable style constants — defined outside render to avoid new object refs per render
const AVATAR_BORDER_STYLE = { borderWidth: '3px' } as const;
const AVATAR_EXTRA_BORDER_STYLE = { borderWidth: '3px' } as const;

const TESTIMONIALS = [
  {
    photo: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80',
    name: 'Aminata Diallo',
    role: 'Directrice des Ressources Humaines',
    company: 'Orange Sénégal',
    quote:
      '"INTOWORK a transformé notre processus de recrutement. Nous recevons des candidats 3 fois plus qualifiés, et nos délais de recrutement ont diminué de 60%."',
    metric: '-60%',
    metricLabel: 'de délai de recrutement',
    stars: 5,
  },
  {
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    name: 'Kofi Mensah',
    role: 'CEO & Co-fondateur',
    company: 'TechHub Accra',
    quote:
      '"En tant que startup, nous n\'avions pas les ressources pour un cabinet RH. INTOWORK nous a permis de recruter 8 développeurs exceptionnels en 3 mois."',
    metric: '8',
    metricLabel: 'recrutements en 3 mois',
    stars: 5,
  },
  {
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    name: 'Fatou Camara',
    role: 'Développeuse Frontend',
    company: 'Recrutée chez Ecobank',
    quote:
      '"J\'avais cherché un emploi pendant 8 mois. Avec INTOWORK, j\'ai eu mon poste de rêve en 3 semaines. L\'algorithme m\'a mis en relation avec le bon recruteur."',
    metric: '3',
    metricLabel: 'semaines pour trouver le poste',
    stars: 5,
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: '',
    description: 'Parfait pour démarrer votre recherche d\'emploi.',
    cta: 'Commencer gratuitement',
    ctaLink: '/signup',
    featured: false,
    features: [
      'Profil candidat complet',
      'Recherche d\'offres illimitée',
      '5 candidatures / mois',
      'Alertes emploi par email',
      'Score de matching basique',
    ],
    missing: ['Messagerie directe', 'Analytics avancés', 'Support prioritaire'],
  },
  {
    name: 'Pro',
    price: '29€',
    period: '/mois',
    description: 'Pour les candidats sérieux et les PME qui recrutent.',
    cta: 'Essayer 14 jours gratuit',
    ctaLink: '/signup',
    featured: true,
    features: [
      'Tout du plan Starter',
      'Candidatures illimitées',
      'Matching IA avancé',
      'Messagerie directe',
      'CV boosté (top des résultats)',
      'Analytics de vos candidatures',
      'Support prioritaire 24/7',
    ],
    missing: [],
  },
  {
    name: 'Enterprise',
    price: '99€',
    period: '/mois',
    description: 'Pour les grandes entreprises avec des besoins RH importants.',
    cta: 'Contacter les ventes',
    ctaLink: '/signup',
    featured: false,
    features: [
      'Tout du plan Pro',
      'Offres d\'emploi illimitées',
      'ATS intégré (pipeline kanban)',
      'API & intégrations SIRH',
      'Rapport RH personnalisé',
      'Account manager dédié',
      'SLA contractuel garanti',
    ],
    missing: [],
  },
];

const CTA_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=100&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#6B9B5F] flex-shrink-0">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-300 flex-shrink-0">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill={filled ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="1.5" className="w-5 h-5">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Mockup2() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeJobTab, setActiveJobTab] = useState<'candidats' | 'recruteurs'>('candidats');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`${plusJakarta.variable} font-[var(--font-plus-jakarta)] antialiased`}>

      {/* ── NAVBAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#6B9B5F] rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M20 6h-2.18c.07-.44.18-.88.18-1.34C18 2.54 15.87 1 13.5 1c-1.48 0-2.74.68-3.5 1.7C9.24 1.68 7.98 1 6.5 1 4.13 1 2 2.54 2 4.66c0 .46.11.9.18 1.34H0v2h20V6zm-9.5-3c.83 0 1.5.67 1.5 1.5S11.33 6 10.5 6H8.34C8.13 5.6 8 5.14 8 4.66 8 3.2 9.12 3 10.5 3zm6.5.5C17 3 17.5 2 18 3c.9 0 1.5.7 1.5 1.5S18.9 6 18 6h-2.18C15.6 5.6 15.5 5.1 15.5 4.5z" />
                  <path d="M1 8v11h8v-4h4v4h8V8H1zm8 9H3v-5h6v5zm12 0h-6v-5h6v5z" />
                </svg>
              </div>
              <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                INTO<span className="text-[#6B9B5F]">WORK</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {['Fonctionnalités', 'Offres d\'emploi', 'Entreprises', 'Tarifs'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className={`text-sm font-medium transition-colors hover:text-[#6B9B5F] ${
                    scrolled ? 'text-gray-600' : 'text-white/90'
                  }`}
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/signin"
                className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 ${
                  scrolled
                    ? 'text-gray-700 hover:text-[#6B9B5F] hover:bg-gray-50'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-[#6B9B5F] hover:bg-[#5A8A4E] text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Commencer
              </Link>
            </div>

            {/* Mobile burger */}
            <button
              className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav aria-label="Navigation mobile" className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
            {['Fonctionnalités', 'Offres d\'emploi', 'Entreprises', 'Tarifs'].map((item) => (
              <Link key={item} href="#" className="block px-3 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                {item}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/signin" className="flex-1 text-center py-2.5 text-gray-700 font-semibold border border-gray-200 rounded-xl">
                Connexion
              </Link>
              <Link href="/signup" className="flex-1 text-center py-2.5 bg-[#6B9B5F] text-white font-semibold rounded-xl">
                Commencer
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background photo */}
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=85"
          alt="Équipe africaine en réunion"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#6B9B5F]/85 via-[#3A5A35]/70 to-[#1a1a2e]/60" />
        {/* Extra dark bottom for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1a2e]/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-semibold px-5 py-2.5 rounded-full mb-8">
              <span className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse" />
              Plateforme #1 de recrutement en Afrique de l'Ouest
            </div>

            {/* H1 */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              Trouvez votre{' '}
              <span className="relative inline-block">
                <span className="relative z-10">talent parfait</span>
                <span className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#F59E0B] rounded-full" />
              </span>
              {' '}en Afrique
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/85 font-medium leading-relaxed mb-10 max-w-2xl">
              INTOWORK connecte les meilleurs professionnels francophones avec les entreprises qui les méritent — grâce à une IA de matching à 94% de précision.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-4 mb-16">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2.5 bg-white text-[#6B9B5F] hover:bg-gray-50 font-bold text-base px-8 py-4 rounded-xl transition-all duration-200 shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5"
              >
                Démarrer gratuitement
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center gap-2.5 border-2 border-white/70 text-white hover:bg-white/10 font-semibold text-base px-8 py-4 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                </svg>
                Voir la démo
              </Link>
            </div>

            {/* Stats — glassmorphism */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-center"
                >
                  <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/75 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs font-medium tracking-widest uppercase">Défiler</span>
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── PARTNER LOGOS TICKER ── */}
      <section className="bg-[#1a1a2e] py-14 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <p className="text-center text-gray-400 text-sm font-semibold uppercase tracking-widest">
            Ils font confiance à INTOWORK
          </p>
        </div>
        <div className="relative flex">
          <div className="flex gap-16 animate-[marquee_28s_linear_infinite] whitespace-nowrap">
            {PARTNER_LOGOS.map((name, i) => (
              <div key={`${name}-${i}`} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{name[0]}</span>
                </div>
                <span className="text-white font-bold text-lg tracking-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ── TAB SWITCH (candidat / recruteur) ── */}
      <section className="py-6 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {(['candidats', 'recruteurs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveJobTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeJobTab === tab
                    ? 'bg-[#6B9B5F] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'candidats' ? 'Je cherche un emploi' : 'Je recrute des talents'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-[#6B9B5F]/10 text-[#6B9B5F] text-sm font-semibold px-4 py-2 rounded-full border border-[#6B9B5F]/20 mb-5">
              Fonctionnalités clés
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Une plateforme complète pour les candidats et les recruteurs, pensée pour le marché africain.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-24 md:space-y-32">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${feature.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-20 items-center`}
              >
                {/* Photo */}
                <div className="lg:w-1/2 relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                    <img
                      src={feature.photo}
                      alt={feature.photoAlt}
                      className="w-full h-full object-cover"
                    />
                    {/* Floating accent */}
                    <div className="absolute top-4 right-4 bg-[#6B9B5F] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      {idx === 0 ? '94% précision' : idx === 1 ? 'Temps réel' : 'Sécurisé'}
                    </div>
                  </div>
                  {/* Decorative element */}
                  <div className={`absolute -z-10 w-72 h-72 rounded-full bg-[#6B9B5F]/8 blur-3xl ${feature.reverse ? '-right-12 -top-12' : '-left-12 -top-12'}`} />
                </div>

                {/* Text */}
                <div className="lg:w-1/2">
                  <div className="inline-flex items-center gap-2 bg-[#6B9B5F]/10 text-[#6B9B5F] text-sm font-semibold px-4 py-2 rounded-full border border-[#6B9B5F]/20 mb-5">
                    {feature.badge}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-500 leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  <ul className="space-y-4">
                    {feature.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#6B9B5F]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckIcon />
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 bg-[#6B9B5F] hover:bg-[#5A8A4E] text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      En savoir plus
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#6B9B5F]/10 text-[#6B9B5F] text-sm font-semibold px-4 py-2 rounded-full border border-[#6B9B5F]/20 mb-5">
              Sécurité & conformité
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vos données sont entre de bonnes mains
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Nous appliquons les standards de sécurité les plus exigeants pour protéger vos informations.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECURITY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="w-16 h-16 bg-[#6B9B5F]/10 text-[#6B9B5F] rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#6B9B5F] group-hover:text-white transition-all duration-200">
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#6B9B5F]/10 text-[#6B9B5F] text-sm font-semibold px-4 py-2 rounded-full border border-[#6B9B5F]/20 mb-4">
                Offres en vedette
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Les meilleures opportunités
              </h2>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-[#6B9B5F] font-semibold hover:text-[#5A8A4E] transition-colors whitespace-nowrap"
            >
              Voir toutes les offres
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_JOBS.map((job) => (
              <div
                key={job.role}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
              >
                {/* Company header */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: job.logoColor }}
                  >
                    {job.logo}
                  </div>
                  {job.isNew && (
                    <span className="bg-[#6B9B5F]/10 text-[#6B9B5F] text-xs font-bold px-2.5 py-1 rounded-full">
                      Nouveau
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-gray-900 text-base mb-1 group-hover:text-[#6B9B5F] transition-colors">
                  {job.role}
                </h4>
                <p className="text-sm text-gray-500 mb-3">{job.company}</p>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {job.location}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {job.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-sm font-bold text-gray-900">{job.salary}</span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{job.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#6B9B5F]/10 text-[#6B9B5F] text-sm font-semibold px-4 py-2 rounded-full border border-[#6B9B5F]/20 mb-5">
              Témoignages
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils ont transformé leur carrière
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Des professionnels et des entreprises témoignent de leur expérience avec INTOWORK.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
              >
                {/* Portrait — magazine banner */}
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {/* Stars overlay */}
                  <div className="absolute bottom-3 left-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} filled={i < t.stars} />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <blockquote className="text-gray-700 text-sm leading-relaxed mb-5 italic">
                    {t.quote}
                  </blockquote>
                  <div className="flex items-center gap-3 mb-5">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                      <div className="text-xs text-[#6B9B5F] font-semibold">{t.company}</div>
                    </div>
                  </div>
                  {/* Metric highlight */}
                  <div className="bg-[#6B9B5F]/8 border border-[#6B9B5F]/15 rounded-xl p-4 flex items-center gap-4">
                    <div className="text-3xl font-extrabold text-[#6B9B5F]">{t.metric}</div>
                    <div className="text-xs text-gray-600 font-medium leading-snug">{t.metricLabel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#6B9B5F]/10 text-[#6B9B5F] text-sm font-semibold px-4 py-2 rounded-full border border-[#6B9B5F]/20 mb-5">
              Tarification simple
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
              Un plan pour chaque ambition
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Démarrez gratuitement, évoluez selon vos besoins. Sans engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-8 ${
                  tier.featured
                    ? 'border-[#6B9B5F] ring-2 ring-[#6B9B5F] shadow-2xl bg-white md:scale-105'
                    : 'border-gray-200 shadow-sm bg-white'
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#6B9B5F] text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg">
                    Le plus populaire
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{tier.name}</h3>
                  <p className="text-sm text-gray-500">{tier.description}</p>
                </div>
                <div className="flex items-end gap-1 mb-8">
                  <span className={`text-5xl font-extrabold ${tier.featured ? 'text-[#6B9B5F]' : 'text-gray-900'}`}>
                    {tier.price}
                  </span>
                  {tier.period && <span className="text-gray-400 font-medium pb-1">{tier.period}</span>}
                </div>
                <Link
                  href={tier.ctaLink}
                  className={`w-full block text-center py-3.5 px-6 rounded-xl font-semibold text-base mb-8 transition-all duration-200 ${
                    tier.featured
                      ? 'bg-[#6B9B5F] hover:bg-[#5A8A4E] text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
                  }`}
                >
                  {tier.cta}
                </Link>
                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckIcon />
                      <span className="text-sm text-gray-700">{f}</span>
                    </li>
                  ))}
                  {tier.missing.map((f) => (
                    <li key={f} className="flex items-start gap-3 opacity-40">
                      <XIcon />
                      <span className="text-sm text-gray-500 line-through">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-10">
            Tous les prix sont HT. Annulation à tout moment.{' '}
            <Link href="/signup" className="text-[#6B9B5F] font-semibold hover:underline">
              Questions ? Contactez-nous
            </Link>
          </p>
        </div>
      </section>

      {/* ── CTA FINALE ── */}
      <section className="relative py-32 overflow-hidden">
        {/* Background photo */}
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85"
          alt="Bureau moderne"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3A5A35]/90 via-[#6B9B5F]/80 to-[#1a1a2e]/85" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Stacked avatars */}
          <div className="flex justify-center mb-8">
            <div className="flex -space-x-3">
              {CTA_AVATARS.map((src, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-3 border-white overflow-hidden shadow-lg"
                  style={{ ...AVATAR_BORDER_STYLE, zIndex: CTA_AVATARS.length - i }}
                >
                  <img src={src} alt="Candidat INTOWORK" className="w-full h-full object-cover" />
                </div>
              ))}
              <div
                className="w-12 h-12 rounded-full border-3 border-white bg-[#F59E0B] flex items-center justify-center shadow-lg"
                style={AVATAR_EXTRA_BORDER_STYLE}
              >
                <span className="text-white text-xs font-bold">+50K</span>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-semibold px-5 py-2.5 rounded-full mb-7">
            <span className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse" />
            Rejoignez 50 000+ professionnels
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Votre prochain emploi de rêve
            <br />
            <span className="text-[#F59E0B]">vous attend ici.</span>
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
            Créez votre profil gratuitement, laissez notre IA travailler pour vous, et recevez des offres qui vous correspondent vraiment.
          </p>
          <div className="flex flex-wrap gap-5 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 bg-white text-[#6B9B5F] hover:bg-gray-50 font-bold text-lg px-10 py-4.5 rounded-xl transition-all duration-200 shadow-2xl hover:shadow-white/20 hover:-translate-y-1"
              style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}
            >
              Créer mon profil gratuitement
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2.5 border-2 border-white/60 text-white hover:bg-white/10 font-semibold text-lg px-10 rounded-xl transition-all duration-200 backdrop-blur-sm"
              style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0f172a] text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-[#6B9B5F] rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M20 6h-2.18c.07-.44.18-.88.18-1.34C18 2.54 15.87 1 13.5 1c-1.48 0-2.74.68-3.5 1.7C9.24 1.68 7.98 1 6.5 1 4.13 1 2 2.54 2 4.66c0 .46.11.9.18 1.34H0v2h20V6z" />
                    <path d="M1 8v11h8v-4h4v4h8V8H1zm8 9H3v-5h6v5zm12 0h-6v-5h6v5z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">
                  INTO<span className="text-[#6B9B5F]">WORK</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 mb-6">
                La plateforme de recrutement intelligente pour l'Afrique de l'Ouest francophone. Connectons les talents aux opportunités.
              </p>
              <div className="flex gap-3">
                {['linkedin', 'twitter', 'facebook'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 bg-white/5 hover:bg-[#6B9B5F] rounded-lg flex items-center justify-center transition-colors duration-200"
                    aria-label={social}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-white">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Plateforme */}
            <div>
              <h5 className="text-white font-semibold mb-5">Plateforme</h5>
              <ul className="space-y-3">
                {['Recherche d\'emploi', 'Déposer son CV', 'Alertes emploi', 'Mon espace candidat', 'Tableau de bord'].map((link) => (
                  <li key={link}>
                    <Link href="/signup" className="text-sm text-gray-500 hover:text-[#6B9B5F] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Entreprises */}
            <div>
              <h5 className="text-white font-semibold mb-5">Entreprises</h5>
              <ul className="space-y-3">
                {['Publier une offre', 'Rechercher des talents', 'ATS & Pipeline', 'Plans et tarifs', 'Partenaires'].map((link) => (
                  <li key={link}>
                    <Link href="/signup" className="text-sm text-gray-500 hover:text-[#6B9B5F] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h5 className="text-white font-semibold mb-5">Support</h5>
              <ul className="space-y-3">
                {['Centre d\'aide', 'Nous contacter', 'Politique de confidentialité', 'Conditions d\'utilisation', 'Mentions légales'].map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-gray-500 hover:text-[#6B9B5F] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Newsletter */}
              <div className="mt-8">
                <p className="text-sm text-white font-medium mb-3">Newsletter</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#6B9B5F] transition-colors min-w-0"
                  />
                  <button className="bg-[#6B9B5F] hover:bg-[#5A8A4E] text-white px-3 py-2.5 rounded-lg transition-colors flex-shrink-0">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © 2025 INTOWORK Search. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-[#6B9B5F] rounded-full animate-pulse" />
              Plateforme opérationnelle — Tous les systèmes fonctionnent normalement
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
