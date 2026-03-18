'use client';

import { useState, useEffect, useRef } from 'react';
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

/* ── Animated counter hook ── */
function useCounter(target: number, duration: number = 2000, suffix: string = '') {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref, suffix };
}

/* ── Static data ── */
const companyLogos = [
  { initials: 'OG', name: 'Orange', color: 'from-orange-500 to-orange-600' },
  { initials: 'EB', name: 'Ecobank', color: 'from-blue-600 to-blue-700' },
  { initials: 'TT', name: 'Total', color: 'from-red-600 to-red-700' },
  { initials: 'MT', name: 'MTN', color: 'from-yellow-500 to-yellow-600' },
  { initials: 'BL', name: 'Bollore', color: 'from-indigo-600 to-indigo-700' },
  { initials: 'SG', name: 'Sonatel', color: 'from-teal-500 to-teal-600' },
];

const testimonials = [
  {
    name: 'Aminata Kone',
    role: 'Developpeur Full Stack',
    location: 'Abidjan, CI',
    avatar: 'AK',
    color: 'from-[#6B9B5F] to-[#4a7a3f]',
    stars: 5,
    text: 'INTOWORK a transforme ma recherche d\'emploi. En 3 semaines, j\'ai recu 4 propositions d\'entretien grace au matching IA. La plateforme est intuitive et les offres sont pertinentes.',
  },
  {
    name: 'Moussa Diallo',
    role: 'DRH, Groupe Sonatel',
    location: 'Dakar, SN',
    avatar: 'MD',
    color: 'from-[#7C3AED] to-[#6B46C1]',
    stars: 5,
    text: 'Nous avons reduit notre temps de recrutement de 60%. Le tableau de bord employeur est remarquable et l\'IA nous propose des candidats parfaitement adaptes a nos besoins.',
  },
  {
    name: 'Nadege Mbarga',
    role: 'Chef de Projet Digital',
    location: 'Douala, CM',
    avatar: 'NM',
    color: 'from-[#F59E0B] to-[#d97706]',
    stars: 5,
    text: 'Apres des mois sur d\'autres plateformes, j\'ai trouve mon poste ideal en 2 semaines sur INTOWORK. Le suivi des candidatures en temps reel est un vrai plus.',
  },
];

const pricingPlans = [
  {
    name: 'Gratuit',
    price: '0',
    period: '/mois',
    description: 'Pour les candidats et petites entreprises',
    features: [
      'Profil candidat complet',
      'Recherche d\'offres illimitee',
      'Jusqu\'a 5 candidatures/mois',
      'Matching IA basique',
      'Notifications email',
    ],
    cta: 'Commencer gratuitement',
    highlight: false,
    color: 'border-gray-200',
  },
  {
    name: 'Pro',
    price: '79',
    period: '/mois',
    description: 'Pour les recruteurs et PME',
    features: [
      'Tout du plan Gratuit',
      'Candidatures illimitees',
      'Matching IA avance',
      'Tableau de bord analytique',
      'Support prioritaire',
      'Export des donnees',
      'Multi-utilisateurs (5)',
    ],
    cta: 'Essai gratuit 14 jours',
    highlight: true,
    color: 'border-[#6B9B5F]',
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    description: 'Pour les grandes entreprises',
    features: [
      'Tout du plan Pro',
      'API d\'integration',
      'SSO / SAML',
      'Account manager dedie',
      'SLA 99.9%',
      'Formation equipe',
      'Utilisateurs illimites',
    ],
    cta: 'Contacter les ventes',
    highlight: false,
    color: 'border-gray-200',
  },
];

const countries = [
  { flag: '\u{1F1E8}\u{1F1EE}', name: "Cote d'Ivoire" },
  { flag: '\u{1F1F8}\u{1F1F3}', name: 'Senegal' },
  { flag: '\u{1F1E8}\u{1F1F2}', name: 'Cameroun' },
  { flag: '\u{1F1F2}\u{1F1F1}', name: 'Mali' },
  { flag: '\u{1F1E7}\u{1F1EB}', name: 'Burkina Faso' },
  { flag: '\u{1F1EC}\u{1F1F3}', name: 'Guinee' },
  { flag: '\u{1F1EC}\u{1F1E6}', name: 'Gabon' },
  { flag: '\u{1F1E8}\u{1F1EC}', name: 'Congo' },
];

const securityBadges = [
  { label: 'RGPD', desc: 'Conforme', icon: 'shield' },
  { label: 'SSL', desc: 'Chiffrement 256-bit', icon: 'lock' },
  { label: 'SOC 2', desc: 'Type II', icon: 'check' },
  { label: 'SLA', desc: '99.9% uptime', icon: 'server' },
];

/* ══════════════════════════════════════════════════════════════════ */
export default function Template13() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Animated counters */
  const counter1 = useCounter(10000, 2000);
  const counter2 = useCounter(500, 1800);
  const counter3 = useCounter(95, 1600);
  const counter4 = useCounter(15, 1400);

  return (
    <div className={`${plusJakarta.variable} font-sans antialiased bg-white`}>

      {/* ═══════════════════════ NAVIGATION ═══════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/98 backdrop-blur-lg shadow-sm border-b border-gray-100' : 'bg-white/80 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-intowork.png" alt="INTOWORK" className="h-28 sm:h-36 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-[#6B9B5F] transition-colors duration-200">Fonctionnalites</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-[#6B9B5F] transition-colors duration-200">Comment ca marche</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-[#6B9B5F] transition-colors duration-200">Temoignages</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-[#6B9B5F] transition-colors duration-200">Tarifs</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/signin" className="text-sm font-medium text-gray-700 hover:text-[#6B9B5F] transition-colors px-4 py-2 rounded-lg hover:bg-gray-50">
                Connexion
              </Link>
              <Link href="/signup" className="text-sm font-semibold text-white bg-[#6B9B5F] hover:bg-[#5a8a4f] px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                Inscription gratuite
              </Link>
            </div>

            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex flex-col gap-1">
                {['Fonctionnalites', 'Comment ca marche', 'Temoignages', 'Tarifs'].map((item, i) => (
                  <a key={i} href={`#${['features','how-it-works','testimonials','pricing'][i]}`}
                    className="text-sm font-medium text-gray-600 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}>
                    {item}
                  </a>
                ))}
                <div className="border-t border-gray-100 pt-3 mt-2 flex flex-col gap-2">
                  <Link href="/signin" className="text-sm font-medium text-gray-700 py-2.5 text-center rounded-lg hover:bg-gray-50">Connexion</Link>
                  <Link href="/signup" className="text-sm font-semibold text-white bg-[#6B9B5F] py-2.5 rounded-lg text-center">Inscription gratuite</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative pt-28 pb-8 sm:pt-36 sm:pb-12 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #6B9B5F 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6B9B5F]/8 border border-[#6B9B5F]/15 mb-8">
            <span className="text-base">🌍</span>
            <span className="text-sm font-semibold text-[#6B9B5F]">La plateforme #1 de recrutement en Afrique francophone</span>
          </div>

          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.08] tracking-tight">
            Trouvez les meilleurs talents.{' '}
            <br className="hidden sm:block" />
            <span className="text-[#6B9B5F]">Decrochez l&apos;emploi ideal.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed">
            INTOWORK connecte candidats et entreprises a travers 15+ pays d&apos;Afrique francophone grace a l&apos;IA.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/signup?role=employer" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#6B9B5F] hover:bg-[#5a8a4f] rounded-xl transition-all duration-200 shadow-lg shadow-[#6B9B5F]/25 hover:shadow-xl hover:shadow-[#6B9B5F]/30 hover:-translate-y-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Recruter des talents
            </Link>
            <Link href="/signup?role=candidate" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-[#6B9B5F] hover:text-[#6B9B5F] rounded-xl transition-all duration-200 hover:-translate-y-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Trouver un emploi
            </Link>
          </div>

          {/* Company logos strip */}
          <div className="mb-14">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Ils recrutent sur INTOWORK</p>
            <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
              {companyLogos.map((c, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 hover:border-[#6B9B5F]/30 transition-colors duration-200 group">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-[10px] font-bold`}>{c.initials}</div>
                  <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors hidden sm:block">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Floating Dashboard Preview ── */}
          <div className="relative max-w-4xl mx-auto">
            {/* Glow effect behind card */}
            <div className="absolute inset-4 bg-gradient-to-br from-[#6B9B5F]/10 via-[#7C3AED]/5 to-[#F59E0B]/10 rounded-3xl blur-2xl"></div>

            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden">
              {/* Browser chrome bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-1 bg-white rounded-lg border border-gray-200 text-xs text-gray-400 max-w-xs w-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    app.intowork.co/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-4 sm:p-6">
                {/* Stat cards row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Profil', value: '85%', icon: '👤', bg: 'bg-[#6B9B5F]/8', text: 'text-[#6B9B5F]' },
                    { label: 'Offres', value: '127', icon: '💼', bg: 'bg-[#7C3AED]/8', text: 'text-[#7C3AED]' },
                    { label: 'Candidatures', value: '8', icon: '📄', bg: 'bg-[#F59E0B]/8', text: 'text-[#F59E0B]' },
                    { label: 'Matching', value: '94%', icon: '🎯', bg: 'bg-blue-500/8', text: 'text-blue-600' },
                  ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} rounded-xl p-3 sm:p-4 text-center`}>
                      <span className="text-lg sm:text-xl">{stat.icon}</span>
                      <div className={`text-xl sm:text-2xl font-extrabold ${stat.text} mt-1`}>{stat.value}</div>
                      <div className="text-[11px] text-gray-500 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mini job cards */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#6B9B5F]/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">OG</div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">Ingenieur Logiciel</div>
                      <div className="text-xs text-gray-400">Orange CI &middot; Abidjan &middot; <span className="text-[#6B9B5F] font-semibold">94% match</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#7C3AED]/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">EB</div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">Resp. Marketing</div>
                      <div className="text-xs text-gray-400">Ecobank &middot; Dakar &middot; <span className="text-[#7C3AED] font-semibold">89% match</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {[
              { ref: counter1.ref, count: counter1.count, suffix: '+', label: 'Candidats actifs', icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
              )},
              { ref: counter2.ref, count: counter2.count, suffix: '+', label: 'Entreprises', icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
              )},
              { ref: counter3.ref, count: counter3.count, suffix: '%', label: 'Satisfaction', icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
              )},
              { ref: counter4.ref, count: counter4.count, suffix: '+', label: 'Pays couverts', icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
              )},
            ].map((stat, i) => (
              <div key={i} ref={stat.ref} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-[#6B9B5F]/8 flex items-center justify-center mx-auto mb-4 text-[#6B9B5F] group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#6B9B5F] mb-1">
                  {stat.count >= 1000 ? `${Math.floor(stat.count / 1000)}K` : stat.count}{stat.suffix === '+' ? '+' : stat.suffix}
                </div>
                <div className="text-sm font-medium text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7C3AED]/8 border border-[#7C3AED]/15 mb-4">
              <span className="text-xs font-semibold text-[#7C3AED]">Simple et rapide</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Comment ca marche
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Trois etapes simples pour connecter talents et opportunites.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Dotted connecting line */}
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-px border-t-2 border-dashed border-[#6B9B5F]/30"></div>

            {/* Step 1 */}
            <div className="relative text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:shadow-md group-hover:border-[#6B9B5F]/30 transition-all duration-300">
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#6B9B5F] text-white text-xs font-bold flex items-center justify-center shadow-sm">1</div>
                <svg className="w-7 h-7 text-[#6B9B5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Creez votre profil</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                Renseignez vos competences, votre experience et vos preferences en quelques minutes.
              </p>
              {/* Mini illustration */}
              <div className="mt-5 mx-auto max-w-[200px] bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B9B5F] to-[#4a7a3f] flex items-center justify-center text-white text-[10px] font-bold">AK</div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-800">Aminata K.</div>
                    <div className="text-[8px] text-gray-400">Dev Full Stack</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-[#6B9B5F] rounded-full"></div>
                  </div>
                  <span className="text-[9px] font-bold text-[#6B9B5F]">85%</span>
                </div>
                <div className="flex gap-1">
                  <span className="px-1.5 py-0.5 bg-[#6B9B5F]/10 text-[#6B9B5F] text-[7px] font-medium rounded">React</span>
                  <span className="px-1.5 py-0.5 bg-[#7C3AED]/10 text-[#7C3AED] text-[7px] font-medium rounded">Node.js</span>
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[7px] font-medium rounded">+4</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:shadow-md group-hover:border-[#7C3AED]/30 transition-all duration-300">
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#7C3AED] text-white text-xs font-bold flex items-center justify-center shadow-sm">2</div>
                <svg className="w-7 h-7 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">L&apos;IA trouve vos matchs</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                Notre algorithme analyse des milliers de profils pour trouver les meilleurs matchs.
              </p>
              {/* Mini illustration */}
              <div className="mt-5 mx-auto max-w-[200px] bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <div className="text-[9px] font-bold text-gray-500 mb-2 text-left">Score de matching</div>
                {[
                  { name: 'Orange CI', score: 94, color: '#6B9B5F' },
                  { name: 'Ecobank', score: 87, color: '#7C3AED' },
                  { name: 'MTN', score: 79, color: '#F59E0B' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[8px] text-gray-500 w-14 text-left truncate">{m.name}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${m.score}%`, backgroundColor: m.color }}></div>
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: m.color }}>{m.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:shadow-md group-hover:border-[#F59E0B]/30 transition-all duration-300">
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#F59E0B] text-white text-xs font-bold flex items-center justify-center shadow-sm">3</div>
                <svg className="w-7 h-7 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Connectez-vous</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                Echangez directement, planifiez des entretiens et decrochez le poste ou le talent ideal.
              </p>
              {/* Mini illustration */}
              <div className="mt-5 mx-auto max-w-[200px] bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6B9B5F] to-[#4a7a3f] border-2 border-white flex items-center justify-center text-white text-[7px] font-bold">AK</div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 border-2 border-white flex items-center justify-center text-white text-[7px] font-bold">OG</div>
                  </div>
                  <span className="text-[9px] font-bold text-[#6B9B5F]">Entretien confirme</span>
                </div>
                <div className="bg-[#6B9B5F]/8 rounded-lg p-2 mb-1.5">
                  <div className="text-[8px] text-gray-500">Entretien video</div>
                  <div className="text-[10px] font-bold text-gray-800">Lun 15 Jan, 10h00</div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6B9B5F] animate-pulse"></span>
                  <span className="text-[8px] text-[#6B9B5F] font-medium">Pret a rejoindre</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURES ═══════════════════════ */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6B9B5F]/8 border border-[#6B9B5F]/15 mb-4">
              <span className="text-xs font-semibold text-[#6B9B5F]">Fonctionnalites</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Une plateforme pensee pour vous
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Decouvrez comment INTOWORK transforme le recrutement avec des outils intelligents et intuitifs.
            </p>
          </div>

          <div className="space-y-20">
            {/* Feature 1 - Matching IA */}
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#6B9B5F]/10 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-[#6B9B5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Matching IA precis</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Notre algorithme analyse les competences, l&apos;experience et les preferences pour creer des connexions pertinentes entre candidats et entreprises.
                </p>
                <ul className="space-y-3">
                  {['Analyse semantique des competences', 'Score de compatibilite en temps reel', 'Recommandations personnalisees'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-[#6B9B5F]/10 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-[#6B9B5F]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: Job card with matching */}
              <div className="bg-gradient-to-br from-gray-50 to-[#6B9B5F]/5 rounded-2xl p-6 lg:p-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6B9B5F] to-[#4a7a3f] flex items-center justify-center text-white font-bold text-sm shrink-0">OT</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-sm truncate">Ingenieur Logiciel</h4>
                        <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-bold shrink-0">Top</span>
                      </div>
                      <p className="text-xs text-gray-500">Orange Telecom &middot; Abidjan</p>
                    </div>
                  </div>
                  <div className="bg-[#6B9B5F]/5 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#6B9B5F]">Score de matching IA</span>
                      <span className="text-sm font-extrabold text-[#6B9B5F]">94%</span>
                    </div>
                    <div className="w-full h-2 bg-[#6B9B5F]/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#6B9B5F] to-[#4a7a3f] rounded-full" style={{width: '94%'}}></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-1 rounded-lg bg-[#6B9B5F]/10 text-[#6B9B5F] text-[10px] font-medium">Abidjan, CI</span>
                    <span className="px-2 py-1 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] text-[10px] font-medium">Hybride</span>
                    <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-medium">CDI</span>
                    <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-medium">800K-1.2M FCFA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span>234 vues</span>
                      <span>18 candidats</span>
                      <span>Il y a 2j</span>
                    </div>
                    <button className="px-4 py-1.5 rounded-lg bg-[#6B9B5F] text-white text-xs font-semibold hover:bg-[#5a8a4f] transition-colors">Postuler</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - Dashboard (reversed) */}
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left: Dashboard illustration */}
              <div className="order-2 lg:order-1 bg-gradient-to-br from-gray-50 to-[#7C3AED]/5 rounded-2xl p-6 lg:p-8">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-[#6B9B5F] to-[#5a8a4f] rounded-xl p-4 text-white">
                    <div className="text-[11px] text-white/70 mb-1">Profil</div>
                    <div className="text-2xl font-bold">85%</div>
                    <div className="w-full h-1 bg-white/20 rounded-full mt-2"><div className="h-full w-[85%] bg-white rounded-full"></div></div>
                  </div>
                  <div className="bg-gradient-to-br from-[#F59E0B] to-[#d97706] rounded-xl p-4 text-white">
                    <div className="text-[11px] text-white/70 mb-1">Offres</div>
                    <div className="text-2xl font-bold">127</div>
                    <div className="flex items-center gap-1 mt-2"><span className="text-[9px] text-white/80">+12 cette semaine</span></div>
                  </div>
                  <div className="bg-gradient-to-br from-[#7C3AED] to-[#6B46C1] rounded-xl p-4 text-white">
                    <div className="text-[11px] text-white/70 mb-1">Candidatures</div>
                    <div className="text-2xl font-bold">8</div>
                    <div className="flex items-center gap-1 mt-2"><span className="text-[9px] text-white/80">5 en cours</span></div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="text-[11px] text-white/70 mb-1">Entretiens</div>
                    <div className="text-2xl font-bold">3</div>
                    <div className="flex items-center gap-1 mt-2"><span className="text-[9px] text-white/80">1 demain</span></div>
                  </div>
                </div>
                {/* Activity feed */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="text-xs font-bold text-gray-700 mb-3">Activite recente</div>
                  <div className="space-y-2">
                    {[
                      { icon: '📄', text: 'Candidature envoyee - Chef de Projet', time: '2h', bg: 'bg-blue-50' },
                      { icon: '👁', text: 'Profil consulte par Ecobank', time: '5h', bg: 'bg-green-50' },
                      { icon: '🎯', text: 'Entretien planifie - Orange CI', time: '1j', bg: 'bg-purple-50' },
                    ].map((a, i) => (
                      <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${a.bg}`}>
                        <span className="text-sm">{a.icon}</span>
                        <span className="text-[11px] text-gray-600 flex-1 truncate">{a.text}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Tableau de bord analytique</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Suivez vos candidatures, analysez les performances de vos offres et prenez des decisions eclairees grace a des visualisations claires.
                </p>
                <ul className="space-y-3">
                  {['Statistiques en temps reel', 'Suivi des candidatures', 'Historique d\'activite complet'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-[#7C3AED]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 3 - Communication */}
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Communication simplifiee</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Messagerie integree, notifications en temps reel et suivi de chaque etape du processus de recrutement au meme endroit.
                </p>
                <ul className="space-y-3">
                  {['Messagerie integree candidat-employeur', 'Notifications push en temps reel', 'Suivi complet du processus'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: Candidature tracking */}
              <div className="bg-gradient-to-br from-gray-50 to-[#F59E0B]/5 rounded-2xl p-6 lg:p-8">
                <div className="bg-gradient-to-r from-[#7C3AED] to-[#6B46C1] rounded-xl p-4 mb-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">8 candidatures</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/15 text-[11px]">Cette semaine</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px]">5 en cours</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#6B9B5F]/40 text-[10px]">2 acceptees</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/40 text-[10px]">1 entretien</span>
                  </div>
                </div>
                {/* Application cards */}
                <div className="space-y-2">
                  {[
                    { initials: 'OT', company: 'Orange CI', role: 'Ingenieur Logiciel', status: 'Acceptee', statusColor: 'bg-[#6B9B5F]/10 text-[#6B9B5F]', loc: 'Abidjan', gradient: 'from-[#6B9B5F] to-[#4a7a3f]' },
                    { initials: 'EB', company: 'Ecobank', role: 'Resp. Marketing', status: 'Entretien', statusColor: 'bg-[#7C3AED]/10 text-[#7C3AED]', loc: 'Dakar', gradient: 'from-blue-600 to-blue-700' },
                    { initials: 'MT', company: 'MTN', role: 'Data Analyst', status: 'En attente', statusColor: 'bg-[#F59E0B]/10 text-[#F59E0B]', loc: 'Douala', gradient: 'from-yellow-500 to-yellow-600' },
                  ].map((app, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 hover:shadow-md hover:border-gray-200 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>{app.initials}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 truncate">{app.role}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${app.statusColor} shrink-0`}>{app.status}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{app.company} &middot; {app.loc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TRUST / SECURITY ═══════════════════════ */}
      <section id="security" className="py-16 sm:py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Securite et conformite
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Vos donnees sont protegees par les standards les plus eleves de l&apos;industrie.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {securityBadges.map((badge, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-sm hover:border-[#6B9B5F]/20 transition-all duration-200 group">
                <div className="w-12 h-12 rounded-xl bg-[#6B9B5F]/8 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  {badge.icon === 'shield' && (
                    <svg className="w-6 h-6 text-[#6B9B5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  )}
                  {badge.icon === 'lock' && (
                    <svg className="w-6 h-6 text-[#6B9B5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  )}
                  {badge.icon === 'check' && (
                    <svg className="w-6 h-6 text-[#6B9B5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
                  )}
                  {badge.icon === 'server' && (
                    <svg className="w-6 h-6 text-[#6B9B5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" /></svg>
                  )}
                </div>
                <div className="text-lg font-bold text-gray-900 mb-0.5">{badge.label}</div>
                <div className="text-xs text-gray-500">{badge.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
      <section id="testimonials" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F59E0B]/8 border border-[#F59E0B]/15 mb-4">
              <span className="text-xs font-semibold text-[#F59E0B]">Temoignages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Des milliers de professionnels font confiance a INTOWORK pour leur carriere et recrutement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <svg key={s} className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-sm text-gray-600 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold`}>{t.avatar}</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role} &middot; {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section id="pricing" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6B9B5F]/8 border border-[#6B9B5F]/15 mb-4">
              <span className="text-xs font-semibold text-[#6B9B5F]">Tarifs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Des tarifs adaptes a vos besoins
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Commencez gratuitement et evoluez au rythme de votre croissance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`relative bg-white rounded-2xl border-2 ${plan.color} p-6 lg:p-8 ${plan.highlight ? 'shadow-xl shadow-[#6B9B5F]/10 scale-[1.02] lg:scale-105' : 'shadow-sm'} transition-all duration-300 hover:shadow-lg`}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#6B9B5F] text-white text-xs font-bold rounded-full shadow-sm">
                    Le plus populaire
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    {plan.price !== 'Sur mesure' ? (
                      <>
                        <span className="text-4xl font-extrabold text-gray-900">{plan.price}&euro;</span>
                        <span className="text-sm text-gray-500">{plan.period}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-extrabold text-gray-900">{plan.price}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <svg className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-[#6B9B5F]' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-[#6B9B5F] text-white hover:bg-[#5a8a4f] shadow-sm hover:shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-[#6B9B5F] via-[#5a8a4f] to-[#4a7a3f] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Pret a transformer votre recrutement ?
          </h2>
          <p className="text-lg sm:text-xl text-white/85 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers de professionnels qui font confiance a INTOWORK pour connecter talents et opportunites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-[#6B9B5F] bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Commencer gratuitement
            </Link>
            <Link href="/entreprises" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 hover:border-white hover:bg-white/10 rounded-xl transition-all duration-200">
              Decouvrir l&apos;offre entreprise
            </Link>
          </div>
          <p className="text-sm text-white/60 mt-6">Aucune carte de credit requise &middot; Configuration en 5 minutes</p>
        </div>
      </section>

      {/* ═══════════════════════ COUNTRY BANNER ═══════════════════════ */}
      <section className="py-8 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-4">Present dans toute l&apos;Afrique francophone</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {countries.map((country, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-500 hover:text-[#6B9B5F] transition-colors duration-200 group">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">{country.flag}</span>
                <span className="text-sm font-medium">{country.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="py-16 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Logo column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo-intowork.png" alt="INTOWORK" className="h-20 w-auto brightness-200" />
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                La plateforme de recrutement #1 en Afrique francophone. Connecter les talents aux opportunites.
              </p>
              {/* Social icons */}
              <div className="flex gap-3">
                {['linkedin', 'twitter', 'facebook'].map((social) => (
                  <a key={social} href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-[#6B9B5F] flex items-center justify-center transition-colors duration-200">
                    {social === 'linkedin' && <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>}
                    {social === 'twitter' && <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>}
                    {social === 'facebook' && <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                  </a>
                ))}
              </div>
            </div>

            {/* Produit */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Produit</h4>
              <ul className="space-y-2.5">
                {['Fonctionnalites', 'Tarifs', 'Matching IA', 'Tableau de bord', 'API'].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-[#6B9B5F] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Entreprise */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Entreprise</h4>
              <ul className="space-y-2.5">
                {['A propos', 'Carrieres', 'Blog', 'Presse', 'Partenaires'].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-[#6B9B5F] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Confidentialite', href: '/privacy' },
                  { label: 'CGU', href: '/terms' },
                  { label: 'Cookies', href: '#' },
                  { label: 'RGPD', href: '#' },
                  { label: 'Support', href: '/support' },
                ].map((item) => (
                  <li key={item.label}><Link href={item.href} className="text-sm text-gray-500 hover:text-[#6B9B5F] transition-colors">{item.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} INTOWORK. Tous droits reserves.</p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-600">Fait avec passion pour l&apos;Afrique</span>
              <span className="text-sm">🌍</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
