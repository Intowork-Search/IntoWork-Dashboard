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

/* ──────────────────────── SVG COMPONENTS ──────────────────────── */

const WaveDivider = ({ color }: { color: string }) => (
  <svg viewBox="0 0 1440 80" className="w-full block -mb-px" preserveAspectRatio="none">
    <path
      fill={color}
      d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
    />
  </svg>
);

const WaveDividerFlip = ({ color }: { color: string }) => (
  <svg viewBox="0 0 1440 80" className="w-full block -mt-px rotate-180" preserveAspectRatio="none">
    <path
      fill={color}
      d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
    />
  </svg>
);

/* ──────────────────────── STATIC DATA ──────────────────────── */

const heroJobCards = [
  {
    title: 'Ingenieur Logiciel',
    company: 'Orange CI',
    initial: 'O',
    initialBg: 'bg-orange-500',
    location: 'Abidjan',
    salary: '800K - 1.2M FCFA',
    type: 'CDI',
    rotate: 'rotate-0 z-30',
    offset: 'translate-y-0',
  },
  {
    title: 'Resp. Marketing',
    company: 'Ecobank',
    initial: 'E',
    initialBg: 'bg-blue-600',
    location: 'Dakar',
    salary: '600K - 900K FCFA',
    type: 'CDI',
    rotate: 'rotate-3 z-20',
    offset: 'translate-y-4',
  },
  {
    title: 'Chef de Projet',
    company: 'MTN',
    initial: 'M',
    initialBg: 'bg-yellow-500',
    location: 'Douala',
    salary: '700K - 1M FCFA',
    type: 'CDD',
    rotate: '-rotate-2 z-10',
    offset: 'translate-y-8',
  },
];

const stats = [
  { value: '10K+', label: 'Candidats', bg: 'bg-green-50', border: 'border-green-200', icon: '👤', color: 'text-[#6B9B5F]' },
  { value: '500+', label: 'Entreprises', bg: 'bg-amber-50', border: 'border-amber-200', icon: '🏢', color: 'text-amber-600' },
  { value: '95%', label: 'Satisfaction', bg: 'bg-violet-50', border: 'border-violet-200', icon: '⭐', color: 'text-[#7C3AED]' },
  { value: '15+', label: 'Pays', bg: 'bg-blue-50', border: 'border-blue-200', icon: '🌍', color: 'text-blue-600' },
];

const steps = [
  {
    num: 1,
    title: 'Creez votre profil',
    desc: 'Inscrivez-vous en 2 minutes, importez votre CV et laissez notre IA analyser vos competences.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    num: 2,
    title: 'Decouvrez des offres',
    desc: 'Notre algorithme de matching IA vous propose les offres les plus pertinentes selon votre profil.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    num: 3,
    title: 'Postulez & decrochez',
    desc: 'Candidatez en un clic, suivez vos candidatures en temps reel et decrochez votre prochain poste.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const features = [
  {
    tag: 'Matching IA',
    tagColor: 'bg-[#6B9B5F]/10 text-[#6B9B5F]',
    title: 'Trouvez le job parfait grace a l\'intelligence artificielle',
    desc: 'Notre moteur de matching analyse votre profil, vos competences et vos preferences pour vous recommander les offres avec le meilleur score de compatibilite.',
    visual: (
      <div className="space-y-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm">O</div>
            <div>
              <p className="font-semibold text-sm text-gray-900">Ingenieur Logiciel</p>
              <p className="text-xs text-gray-500">Orange CI - Abidjan</p>
            </div>
            <div className="ml-auto bg-[#6B9B5F]/10 text-[#6B9B5F] text-xs font-bold px-3 py-1 rounded-full">92% match</div>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">CDI</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">800K-1.2M FCFA</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">React</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">E</div>
            <div>
              <p className="font-semibold text-sm text-gray-900">Dev Frontend Senior</p>
              <p className="text-xs text-gray-500">Ecobank - Dakar</p>
            </div>
            <div className="ml-auto bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-bold px-3 py-1 rounded-full">85% match</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: 'Tableau de bord',
    tagColor: 'bg-[#7C3AED]/10 text-[#7C3AED]',
    title: 'Pilotez votre recherche depuis un dashboard intuitif',
    desc: 'Visualisez vos statistiques, suivez vos candidatures, gerez vos notifications et optimisez votre profil en un seul endroit.',
    visual: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Candidatures', value: '24', color: 'text-[#6B9B5F]' },
            { label: 'Entretiens', value: '8', color: 'text-[#7C3AED]' },
            { label: 'Vues profil', value: '156', color: 'text-amber-600' },
            { label: 'Matching', value: '92%', color: 'text-blue-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">Activite recente</p>
          <div className="space-y-2">
            {[
              { text: 'Orange CI a vu votre profil', time: 'Il y a 2h', dot: 'bg-[#6B9B5F]' },
              { text: 'Entretien confirme - Ecobank', time: 'Il y a 5h', dot: 'bg-[#7C3AED]' },
            ].map((a) => (
              <div key={a.text} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${a.dot} shrink-0`} />
                <p className="text-xs text-gray-600 truncate">{a.text}</p>
                <p className="text-xs text-gray-400 ml-auto shrink-0">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: 'Suivi candidature',
    tagColor: 'bg-amber-100 text-amber-700',
    title: 'Suivez chaque etape de vos candidatures en temps reel',
    desc: 'Du depot de candidature a l\'entretien final, visualisez le statut de chaque candidature et recevez des notifications a chaque changement.',
    visual: (
      <div className="space-y-3">
        {[
          { company: 'Orange CI', role: 'Ingenieur Logiciel', status: 'Entretien', statusColor: 'bg-[#7C3AED]/10 text-[#7C3AED]' },
          { company: 'Ecobank', role: 'Dev Frontend', status: 'Selectionne', statusColor: 'bg-[#6B9B5F]/10 text-[#6B9B5F]' },
          { company: 'MTN', role: 'Chef de Projet', status: 'En cours', statusColor: 'bg-amber-100 text-amber-700' },
        ].map((app) => (
          <div key={app.company} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
              {app.company.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{app.role}</p>
              <p className="text-xs text-gray-500">{app.company}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${app.statusColor}`}>
              {app.status}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

const companies = [
  { name: 'Orange CI', initial: 'O', bg: 'bg-orange-500' },
  { name: 'Ecobank', initial: 'E', bg: 'bg-blue-600' },
  { name: 'MTN', initial: 'M', bg: 'bg-yellow-500' },
  { name: 'Sonatel', initial: 'S', bg: 'bg-green-600' },
  { name: 'TotalEnergies', initial: 'T', bg: 'bg-red-600' },
  { name: 'Bolore', initial: 'B', bg: 'bg-indigo-600' },
  { name: 'Canal+', initial: 'C', bg: 'bg-gray-800' },
  { name: 'NSIA', initial: 'N', bg: 'bg-teal-600' },
  { name: 'Moov Africa', initial: 'M', bg: 'bg-purple-600' },
  { name: 'BICICI', initial: 'B', bg: 'bg-sky-600' },
  { name: 'CFAO', initial: 'C', bg: 'bg-rose-600' },
  { name: 'Societe Generale', initial: 'S', bg: 'bg-red-700' },
];

const testimonials = [
  {
    name: 'Aminata Kone',
    role: 'Developpeuse Full Stack',
    location: 'Abidjan, Cote d\'Ivoire',
    quote: 'Grace a INTOWORK, j\'ai decroche mon poste de reve en moins de 3 semaines. Le matching IA m\'a proposee des offres parfaitement alignees avec mes competences.',
    borderColor: 'border-l-[#6B9B5F]',
    avatarBg: 'bg-[#6B9B5F]',
  },
  {
    name: 'Moussa Diallo',
    role: 'DRH - Ecobank Senegal',
    location: 'Dakar, Senegal',
    quote: 'En tant que recruteur, INTOWORK nous a fait gagner un temps precieux. La qualite des profils est excellente et le tableau de bord employeur est tres complet.',
    borderColor: 'border-l-[#7C3AED]',
    avatarBg: 'bg-[#7C3AED]',
  },
  {
    name: 'Nadege Mbarga',
    role: 'Chef de Projet IT',
    location: 'Douala, Cameroun',
    quote: 'La plateforme est intuitive, moderne et vraiment adaptee au marche africain. Le suivi de candidature en temps reel est un vrai plus.',
    borderColor: 'border-l-[#F59E0B]',
    avatarBg: 'bg-[#F59E0B]',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: '',
    desc: 'Parfait pour demarrer votre recherche d\'emploi',
    highlighted: false,
    features: [
      'Profil candidat complet',
      'Recherche d\'offres illimitee',
      '5 candidatures / mois',
      'Notifications email',
    ],
  },
  {
    name: 'Pro',
    price: '9 900',
    period: 'FCFA/mois',
    desc: 'Pour les recruteurs et entreprises actives',
    highlighted: true,
    features: [
      'Tout Starter inclus',
      'Publication d\'offres illimitee',
      'Matching IA avance',
      'Tableau de bord employeur',
      'Support prioritaire',
      'Analytics & rapports',
    ],
  },
  {
    name: 'Entreprise',
    price: 'Sur mesure',
    period: '',
    desc: 'Solution personnalisee pour les grandes entreprises',
    highlighted: false,
    features: [
      'Tout Pro inclus',
      'API & integrations',
      'SSO / SAML',
      'Account manager dedie',
      'Formation equipe',
      'SLA garanti',
    ],
  },
];

const footerLinks = [
  {
    title: 'Plateforme',
    links: ['Recherche d\'emploi', 'Publier une offre', 'Matching IA', 'Tableau de bord'],
  },
  {
    title: 'Entreprise',
    links: ['A propos', 'Carrieres', 'Presse', 'Contact'],
  },
  {
    title: 'Ressources',
    links: ['Blog', 'Guides carriere', 'FAQ', 'API Documentation'],
  },
  {
    title: 'Legal',
    links: ['CGU', 'Politique de confidentialite', 'Cookies', 'Mentions legales'],
  },
];

/* ──────────────────────── MAIN COMPONENT ──────────────────────── */

export default function Template15() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`${plusJakarta.variable} font-sans antialiased`} style={{ fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif' }}>

      {/* ═══════════════ NAVIGATION ═══════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#6B9B5F]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo-intowork.png" alt="INTOWORK" className="h-24 sm:h-32 w-auto" />
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold text-gray-700 hover:text-[#6B9B5F] transition-colors">Fonctionnalites</a>
              <a href="#how-it-works" className="text-sm font-semibold text-gray-700 hover:text-[#6B9B5F] transition-colors">Comment ca marche</a>
              <a href="#companies" className="text-sm font-semibold text-gray-700 hover:text-[#6B9B5F] transition-colors">Entreprises</a>
              <a href="#pricing" className="text-sm font-semibold text-gray-700 hover:text-[#6B9B5F] transition-colors">Tarifs</a>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/auth/signin" className="text-sm font-semibold text-gray-700 hover:text-[#6B9B5F] transition-colors px-4 py-2">
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] px-5 py-2.5 rounded-full transition-all shadow-md shadow-[#6B9B5F]/20 hover:shadow-lg hover:shadow-[#6B9B5F]/30"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FDFBF7] border-t border-[#6B9B5F]/10 px-4 py-4 space-y-2">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#6B9B5F]/10 rounded-xl transition-colors">Fonctionnalites</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#6B9B5F]/10 rounded-xl transition-colors">Comment ca marche</a>
            <a href="#companies" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#6B9B5F]/10 rounded-xl transition-colors">Entreprises</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#6B9B5F]/10 rounded-xl transition-colors">Tarifs</a>
            <div className="pt-3 border-t border-gray-200 flex flex-col gap-2">
              <Link href="/auth/signin" className="text-center text-sm font-semibold text-gray-700 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">Connexion</Link>
              <Link href="/auth/signup" className="text-center text-sm font-bold text-white bg-[#6B9B5F] py-2.5 rounded-full shadow-md">Commencer gratuitement</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative bg-[#FDFBF7] pt-28 sm:pt-32 pb-8 sm:pb-16 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-20 right-0 w-72 h-72 bg-[#6B9B5F]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-10 w-16 h-16 bg-[#F59E0B]/15 rounded-full pointer-events-none hidden lg:block" />
        <div className="absolute top-60 right-20 w-10 h-10 bg-[#6B9B5F]/20 rounded-full pointer-events-none hidden lg:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#6B9B5F]/10 text-[#6B9B5F] text-sm font-bold px-4 py-2 rounded-full mb-6">
                <span>🚀</span>
                <span>+2000 offres ce mois</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                Votre prochain{' '}
                <span className="relative">
                  <span className="text-[#6B9B5F]">chapitre professionnel</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8 C50 2, 100 2, 150 6 S250 10, 298 4" stroke="#6B9B5F" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                  </svg>
                </span>{' '}
                commence ici
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                INTOWORK connecte les talents d&apos;Afrique francophone aux meilleures opportunites.
                Matching IA, candidature simplifiee.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 bg-[#6B9B5F] hover:bg-[#5A8A4E] text-white font-bold px-8 py-4 rounded-full text-base transition-all shadow-lg shadow-[#6B9B5F]/25 hover:shadow-xl hover:shadow-[#6B9B5F]/30 hover:-translate-y-0.5"
                >
                  Je recrute
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#6B9B5F] text-[#6B9B5F] hover:bg-[#6B9B5F]/5 font-bold px-8 py-4 rounded-full text-base transition-all"
                >
                  Je cherche un emploi
                </Link>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start text-sm text-gray-500">
                <div className="flex items-center gap-1 text-lg">
                  <span>🇨🇮</span><span>🇸🇳</span><span>🇨🇲</span><span>🇲🇱</span><span>🇧🇫</span>
                </div>
                <span className="font-semibold text-gray-700">15+ pays couverts</span>
              </div>
            </div>

            {/* Right — Stacked job cards */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                {heroJobCards.slice().reverse().map((card, idx) => (
                  <div
                    key={card.title}
                    className={`${idx === 0 ? 'relative' : 'absolute top-0 left-0 w-full'} bg-white rounded-2xl shadow-xl border border-gray-100 p-5 transition-all ${card.rotate} ${card.offset}`}
                    style={{
                      transform: `rotate(${idx === 0 ? -2 : idx === 1 ? 3 : 0}deg) translateY(${idx * 16}px) translateX(${idx * 8}px)`,
                      zIndex: 30 - idx * 10,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${card.initialBg} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                        {card.initial}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{card.title}</p>
                        <p className="text-sm text-gray-500">{card.company} - {card.location}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-gray-100 text-gray-700 font-medium px-3 py-1 rounded-full">{card.type}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 font-medium px-3 py-1 rounded-full">{card.salary}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 font-medium px-3 py-1 rounded-full">{card.location}</span>
                    </div>
                    <button className="w-full bg-[#6B9B5F] hover:bg-[#5A8A4E] text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm">
                      Postuler
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="bg-[#FDFBF7] pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl p-5 sm:p-6 text-center transition-transform hover:scale-105`}>
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className={`text-3xl sm:text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm font-semibold text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider color="#ffffff" />

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#6B9B5F]/10 text-[#6B9B5F] text-sm font-bold px-4 py-2 rounded-full mb-4">
              Comment ca marche
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Trois etapes vers votre{' '}
              <span className="text-[#6B9B5F]">futur emploi</span>
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Un processus simple et efficace pour connecter talents et opportunites.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step) => (
              <div
                key={step.num}
                className="group bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#6B9B5F]/30 rounded-3xl p-8 transition-all hover:shadow-xl hover:shadow-[#6B9B5F]/5 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#6B9B5F] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-[#6B9B5F]/20">
                    {step.num}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#6B9B5F]/10 text-[#6B9B5F] flex items-center justify-center group-hover:bg-[#6B9B5F]/20 transition-colors">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDividerFlip color="#ffffff" />

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="bg-[#FDFBF7] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 text-[#7C3AED] text-sm font-bold px-4 py-2 rounded-full mb-4">
              Fonctionnalites
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Des outils{' '}
              <span className="text-[#7C3AED]">puissants</span>{' '}
              pour votre carriere
            </h2>
          </div>

          <div className="space-y-12">
            {features.map((feat, idx) => (
              <div
                key={feat.tag}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-14 items-center ${idx % 2 === 1 ? 'lg:direction-rtl' : ''}`}
              >
                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                  <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-4 ${feat.tagColor}`}>
                    {feat.tag}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                    {feat.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{feat.desc}</p>
                </div>
                <div className={`bg-gray-100 rounded-3xl p-6 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  {feat.visual}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider color="#ffffff" />

      {/* ═══════════════ COMPANIES ═══════════════ */}
      <section id="companies" className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-full mb-4">
              Ils nous font confiance
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              +500 entreprises recrutent avec{' '}
              <span className="text-[#6B9B5F]">INTOWORK</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {companies.map((c) => (
              <div
                key={c.name}
                className="flex flex-col items-center gap-3 p-4 sm:p-5 bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 hover:border-[#6B9B5F]/20 transition-all hover:shadow-lg hover:-translate-y-1 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${c.bg} flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-110 transition-transform`}>
                  {c.initial}
                </div>
                <p className="text-sm font-semibold text-gray-700 text-center leading-tight">{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDividerFlip color="#ffffff" />

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="bg-[#FDFBF7] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#6B9B5F]/10 text-[#6B9B5F] text-sm font-bold px-4 py-2 rounded-full mb-4">
              Temoignages
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Ce que disent{' '}
              <span className="text-[#6B9B5F]">nos utilisateurs</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className={`bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 ${t.borderColor}`}
              >
                <svg className="w-8 h-8 text-gray-200 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${t.avatarBg} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                    <p className="text-xs text-gray-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider color="#ffffff" />

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 text-[#7C3AED] text-sm font-bold px-4 py-2 rounded-full mb-4">
              Tarifs
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Des tarifs{' '}
              <span className="text-[#7C3AED]">transparents</span>
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Choisissez le plan qui correspond a vos besoins. Pas de frais caches.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 transition-all hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'bg-[#6B9B5F] text-white shadow-2xl shadow-[#6B9B5F]/30 scale-105 border-2 border-[#6B9B5F]'
                    : 'bg-gray-50 border border-gray-200 hover:border-[#6B9B5F]/30 hover:shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    Le plus populaire
                  </div>
                )}
                <h3 className={`text-xl font-extrabold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-1">
                  <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ml-1 ${plan.highlighted ? 'text-white/70' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/80' : 'text-gray-500'}`}>
                  {plan.desc}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <svg
                        className={`w-5 h-5 shrink-0 ${plan.highlighted ? 'text-white' : 'text-[#6B9B5F]'}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className={plan.highlighted ? 'text-white/90' : 'text-gray-700'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block text-center font-bold py-3 rounded-full transition-all text-sm ${
                    plan.highlighted
                      ? 'bg-white text-[#6B9B5F] hover:bg-gray-100 shadow-lg'
                      : 'bg-[#6B9B5F] text-white hover:bg-[#5A8A4E] shadow-md shadow-[#6B9B5F]/20'
                  }`}
                >
                  {plan.price === 'Sur mesure' ? 'Nous contacter' : 'Commencer'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <WaveDividerFlip color="#6B9B5F" />
      <section className="bg-[#6B9B5F] py-16 sm:py-24 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-white/5 rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
            Pret a transformer votre carriere ?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Rejoignez des milliers de professionnels qui font confiance a INTOWORK
            pour trouver leur prochaine opportunite en Afrique francophone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#6B9B5F] hover:bg-gray-100 font-extrabold px-8 py-4 rounded-full text-lg transition-all shadow-xl hover:-translate-y-0.5"
            >
              Commencer gratuitement
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-4 rounded-full text-lg transition-all"
            >
              Decouvrir la plateforme
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <img src="/logo-intowork.png" alt="INTOWORK" className="h-20 w-auto brightness-200" />
              </Link>
              <p className="text-sm leading-relaxed">
                La plateforme de recrutement nouvelle generation pour l&apos;Afrique francophone.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {['M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z',
                  'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
                  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
                ].map((path, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-[#6B9B5F] flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 fill-current text-gray-400 hover:text-white" viewBox="0 0 24 24">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-white text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} INTOWORK. Tous droits reserves.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span>🇨🇮</span>
              <span>Fait avec passion pour l&apos;Afrique francophone</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
