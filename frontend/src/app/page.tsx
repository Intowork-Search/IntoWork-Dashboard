'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
});

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════════════════════════ */

const navLinks = [
  { label: 'Fonctionnalites', href: '#features' },
  { label: 'Securite', href: '#security' },
  { label: 'Temoignages', href: '#testimonials' },
  { label: 'Tarifs', href: '#pricing' },
];

const logoCompanies = [
  { name: 'Orange', color: '#FF6600' },
  { name: 'Ecobank', color: '#003DA5' },
  { name: 'Total', color: '#E31837' },
  { name: 'MTN', color: '#FFCC00' },
  { name: 'Bollore', color: '#00205B' },
  { name: 'Canal+', color: '#1A1A1A' },
];

const dashboardStats = [
  { label: 'Profil', value: '85%', icon: 'user', color: '#6B9B5F' },
  { label: 'Offres', value: '127', icon: 'briefcase', color: '#7C3AED' },
  { label: 'Candidatures', value: '8', icon: 'send', color: '#F59E0B' },
  { label: 'Matching', value: '94%', icon: 'zap', color: '#6B9B5F' },
];

const mockJobs = [
  {
    title: 'Ingenieur Logiciel Senior',
    company: 'Orange CI',
    location: 'Abidjan',
    salary: '800K FCFA',
    match: 94,
    tags: ['React', 'Node.js', 'AWS'],
    logo: '#FF6600',
  },
  {
    title: 'Resp. Marketing Digital',
    company: 'Ecobank',
    location: 'Dakar',
    salary: '650K FCFA',
    match: 87,
    tags: ['SEO', 'Analytics', 'CRM'],
    logo: '#003DA5',
  },
];

const activityItems = [
  { text: 'Candidature vue par Orange CI', time: 'Il y a 2h', type: 'view' },
  { text: 'Nouveau matching : 94%', time: 'Il y a 5h', type: 'match' },
  { text: 'Entretien programme le 25 Mars', time: 'Hier', type: 'interview' },
];

const features = [
  {
    badge: 'Matching IA',
    title: 'Un algorithme qui comprend les talents africains',
    description:
      "Notre IA analyse les competences, l'experience et les aspirations des candidats pour proposer des correspondances avec une precision de 94%. Fini les CV perdus dans les boites mail.",
    highlights: [
      'Analyse semantique des competences',
      'Matching multicritere en temps reel',
      'Suggestions personnalisees quotidiennes',
      'Score de compatibilite transparent',
    ],
  },
  {
    badge: 'Tableau de Bord',
    title: 'Gerez vos recrutements en un seul endroit',
    description:
      'Un tableau de bord unifie pour suivre chaque candidature, chaque offre et chaque interaction. Visualisez vos KPIs et prenez des decisions eclairees.',
    highlights: [
      'Pipeline visuel des candidatures',
      'Statistiques en temps reel',
      'Filtres avances et recherche rapide',
      'Export des donnees en un clic',
    ],
  },
  {
    badge: 'Communication',
    title: 'Restez connecte avec vos candidats',
    description:
      "Messagerie integree, notifications automatiques et suivi en temps reel. Offrez une experience candidat d'exception a chaque etape du processus.",
    highlights: [
      'Messagerie directe recruteur-candidat',
      'Notifications push et email',
      'Modeles de messages personnalisables',
      "Suivi de l'engagement candidat",
    ],
  },
];

const securityCards = [
  {
    icon: 'shield',
    title: 'RGPD Conforme',
    description: 'Protection des donnees personnelles selon les normes europeennes et CEDEAO.',
  },
  {
    icon: 'lock',
    title: 'Chiffrement SSL',
    description: 'Toutes les communications sont chiffrees de bout en bout avec TLS 1.3.',
  },
  {
    icon: 'check-circle',
    title: 'SOC 2 Type II',
    description: 'Infrastructure auditee et certifiee pour la securite des donnees entreprise.',
  },
  {
    icon: 'clock',
    title: 'SLA 99.9%',
    description: 'Disponibilite garantie avec support technique prioritaire 24/7.',
  },
];

const testimonials = [
  {
    name: 'Aminata Diallo',
    role: 'DRH',
    company: 'Orange Cote d\'Ivoire',
    avatar: '#FF6600',
    quote:
      'INTOWORK a transforme notre processus de recrutement. Nous avons reduit notre temps de recrutement de 60% tout en ameliorant la qualite des candidatures recues.',
    metric: '-60%',
    metricLabel: 'temps de recrutement',
  },
  {
    name: 'Moussa Keita',
    role: 'Talent Acquisition Manager',
    company: 'Ecobank Senegal',
    avatar: '#003DA5',
    quote:
      "Le matching IA est remarquable. Sur les 50 derniers recrutements, 92% des candidats proposes ont ete valides en entretien. C'est un gain de temps considerable.",
    metric: '92%',
    metricLabel: 'taux de validation',
  },
  {
    name: 'Fatou Sow',
    role: 'Candidate',
    company: 'Placee chez Total Energies',
    avatar: '#E31837',
    quote:
      "J'ai trouve mon poste ideal en seulement 2 semaines. La plateforme m'a propose des offres vraiment adaptees a mon profil et a mes ambitions. Merci INTOWORK !",
    metric: '2 sem.',
    metricLabel: 'pour trouver un emploi',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '0',
    currency: 'FCFA',
    period: '/mois',
    description: 'Pour les candidats et petites entreprises',
    features: [
      'Profil candidat complet',
      '5 candidatures / mois',
      'Matching IA basique',
      '1 offre d\'emploi active',
      'Support email',
    ],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '49 900',
    currency: 'FCFA',
    period: '/mois',
    description: 'Pour les PME en croissance',
    features: [
      'Tout de Starter +',
      'Candidatures illimitees',
      'Matching IA avance (94%)',
      '25 offres d\'emploi actives',
      'Tableau de bord analytique',
      'Support prioritaire',
      'API d\'integration',
    ],
    cta: 'Essai gratuit 14 jours',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    currency: '',
    period: '',
    description: 'Pour les grandes entreprises',
    features: [
      'Tout de Pro +',
      'Offres illimitees',
      'ATS integration complete',
      'SSO & SCIM',
      'SLA 99.9%',
      'Account manager dedie',
      'Formation & onboarding',
    ],
    cta: 'Contacter les ventes',
    highlighted: false,
  },
];

const footerLinks = {
  Produit: ['Fonctionnalites', 'Tarifs', 'Integrations', 'API', 'Changelog'],
  Entreprise: ['A propos', 'Carrieres', 'Presse', 'Partenaires', 'Contact'],
  Ressources: ['Blog', 'Guide recrutement', 'Webinaires', 'FAQ', 'Documentation'],
  Legal: ['CGU', 'Confidentialite', 'Cookies', 'RGPD', 'Mentions legales'],
};

const countries = [
  { name: 'Cote d\'Ivoire', flag: '\uD83C\uDDE8\uD83C\uDDEE' },
  { name: 'Senegal', flag: '\uD83C\uDDF8\uD83C\uDDF3' },
  { name: 'Cameroun', flag: '\uD83C\uDDE8\uD83C\uDDF2' },
  { name: 'Mali', flag: '\uD83C\uDDF2\uD83C\uDDF1' },
  { name: 'Guinee', flag: '\uD83C\uDDEC\uD83C\uDDF3' },
  { name: 'Burkina Faso', flag: '\uD83C\uDDE7\uD83C\uDDEB' },
  { name: 'Togo', flag: '\uD83C\uDDF9\uD83C\uDDEC' },
  { name: 'Benin', flag: '\uD83C\uDDE7\uD83C\uDDEF' },
  { name: 'Niger', flag: '\uD83C\uDDF3\uD83C\uDDEA' },
  { name: 'Gabon', flag: '\uD83C\uDDEC\uD83C\uDDE6' },
  { name: 'Congo', flag: '\uD83C\uDDE8\uD83C\uDDEC' },
  { name: 'RDC', flag: '\uD83C\uDDE8\uD83C\uDDE9' },
  { name: 'Maroc', flag: '\uD83C\uDDF2\uD83C\uDDE6' },
  { name: 'Tunisie', flag: '\uD83C\uDDF9\uD83C\uDDF3' },
  { name: 'Madagascar', flag: '\uD83C\uDDF2\uD83C\uDDEC' },
];

/* ═══════════════════════════════════════════════════════════════
   ICON COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function IconShield({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconLock({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function IconCheckCircle({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconClock({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconCheck({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconArrowRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function IconSparkles({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  );
}

function IconBriefcase({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function IconUser({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconSend({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function IconZap({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function IconMapPin({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function IconMenu({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function IconX({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconStar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function IconEye({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconCalendar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

const securityIcons: Record<string, React.FC<{ className?: string }>> = {
  shield: IconShield,
  lock: IconLock,
  'check-circle': IconCheckCircle,
  clock: IconClock,
};

const statIcons: Record<string, React.FC<{ className?: string }>> = {
  user: IconUser,
  briefcase: IconBriefcase,
  send: IconSend,
  zap: IconZap,
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="loading loading-spinner loading-lg text-[#6B9B5F]"></div>
      </div>
    );
  }

  return (
    <div className={`${plusJakarta.variable} font-sans antialiased bg-white`}>
      {/* ═══════════════════════ INLINE STYLES ═══════════════════════ */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.7s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slide-left { animation: slideInLeft 0.7s ease-out forwards; }
        .animate-slide-right { animation: slideInRight 0.7s ease-out forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
        .animate-shimmer {
          background: linear-gradient(90deg, #6B9B5F 0%, #93C587 40%, #6B9B5F 80%);
          background-size: 200% auto;
          animation: shimmer 3s ease-in-out infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .scroll-left-track {
          animation: scroll-left 30s linear infinite;
        }
      `}</style>

      {/* ═══════════════════════ NAVIGATION ═══════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/logo-intowork.png"
                alt="INTOWORK"
                className="h-24 sm:h-28 w-auto"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#6B9B5F] rounded-lg hover:bg-green-50/60 transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#6B9B5F] transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Commencer
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <IconX /> : <IconMenu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#6B9B5F] hover:bg-green-50 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-3 text-sm font-semibold text-gray-700 text-center hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-3 text-sm font-semibold text-white bg-[#6B9B5F] text-center rounded-lg hover:bg-[#5A8A4E] transition-colors"
                >
                  Commencer
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50/40 to-white pointer-events-none" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#6B9B5F]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center mb-6 animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 shadow-sm">
              <IconSparkles className="w-4 h-4 text-[#6B9B5F]" />
              <span className="text-sm font-semibold text-[#6B9B5F]">
                Nouveau : Matching IA avec 94% de precision
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] animate-fade-in-up delay-100"
              style={{ opacity: 0, animationFillMode: 'forwards' }}
            >
              La plateforme de recrutement{' '}
              <span className="animate-shimmer">qui comprend l&apos;Afrique</span>
            </h1>
            <p
              className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto animate-fade-in-up delay-200"
              style={{ opacity: 0, animationFillMode: 'forwards' }}
            >
              Connectez les meilleurs talents aux entreprises les plus ambitieuses
              dans plus de 15 pays francophones. Matching IA, processus simplifie,
              resultats garantis.
            </p>
          </div>

          {/* Dual CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-in-up delay-300"
            style={{ opacity: 0, animationFillMode: 'forwards' }}
          >
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-2xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <IconBriefcase className="w-5 h-5" />
              Espace Recruteur
              <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-[#6B9B5F] bg-white hover:bg-green-50 border-2 border-[#6B9B5F]/20 hover:border-[#6B9B5F]/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <IconUser className="w-5 h-5" />
              Espace Candidat
              <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats inline */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-14 animate-fade-in-up delay-400"
            style={{ opacity: 0, animationFillMode: 'forwards' }}
          >
            {[
              { value: '10K+', label: 'candidats' },
              { value: '500+', label: 'entreprises' },
              { value: '15+', label: 'pays' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-300 hidden sm:inline">|</span>}
                <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* ── PRODUCT MOCKUP ── */}
          <div
            className="max-w-5xl mx-auto animate-fade-in-up delay-500"
            style={{ opacity: 0, animationFillMode: 'forwards' }}
          >
            <div className="relative">
              {/* Glow behind */}
              <div className="absolute -inset-4 bg-gradient-to-b from-[#6B9B5F]/10 via-[#6B9B5F]/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />

              <div className="relative bg-white rounded-2xl lg:rounded-3xl border border-gray-200/80 shadow-2xl overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-1.5">
                      <IconLock className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs text-gray-500 font-medium">
                        app.intowork.co/dashboard
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-4 sm:p-6 lg:p-8">
                  {/* Dashboard header */}
                  <div className="bg-gradient-to-r from-[#6B9B5F] to-[#93C587] rounded-xl lg:rounded-2xl p-5 lg:p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Bonjour,</p>
                        <h2 className="text-xl lg:text-2xl font-bold text-white">
                          Bienvenue, Aminata
                        </h2>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse-soft" />
                        <span className="text-sm text-white font-medium">En ligne</span>
                      </div>
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
                    {dashboardStats.map((stat, i) => {
                      const StatIcon = statIcons[stat.icon];
                      return (
                        <div
                          key={i}
                          className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                              style={{ backgroundColor: stat.color + '15' }}
                            >
                              <StatIcon
                                className="w-4.5 h-4.5"
                              />
                            </div>
                            <span
                              className="text-xl lg:text-2xl font-bold"
                              style={{ color: stat.color }}
                            >
                              {stat.value}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Job cards + activity sidebar */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* Jobs */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Offres recommandees
                        </h3>
                        <span className="text-xs text-[#6B9B5F] font-medium cursor-pointer hover:underline">
                          Voir tout
                        </span>
                      </div>
                      {mockJobs.map((job, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-green-50/40 rounded-xl border border-gray-100 hover:border-green-200 transition-all group cursor-pointer"
                        >
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                            style={{ backgroundColor: job.logo }}
                          >
                            {job.company.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {job.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500">{job.company}</span>
                              <span className="text-gray-300">|</span>
                              <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
                                <IconMapPin className="w-3 h-3" />
                                {job.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                              {job.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-[10px] font-medium bg-white rounded-md border border-gray-200 text-gray-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right shrink-0 hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">{job.salary}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#6B9B5F]"
                                  style={{ width: `${job.match}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-semibold text-[#6B9B5F]">
                                {job.match}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Activity sidebar */}
                    <div className="hidden lg:block">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Activite recente
                      </h3>
                      <div className="space-y-3">
                        {activityItems.map((item, i) => {
                          const ActivityIcon =
                            item.type === 'view'
                              ? IconEye
                              : item.type === 'match'
                              ? IconZap
                              : IconCalendar;
                          const iconBg =
                            item.type === 'view'
                              ? 'bg-blue-50 text-blue-600'
                              : item.type === 'match'
                              ? 'bg-green-50 text-green-600'
                              : 'bg-purple-50 text-purple-600';
                          return (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                                <ActivityIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-800 leading-snug">
                                  {item.text}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ LOGOS ═══════════════════════ */}
      <section className="py-12 lg:py-16 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
            Ils recrutent sur INTOWORK
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            {logoCompanies.map((company) => (
              <div
                key={company.name}
                className="flex items-center gap-2.5 group cursor-default"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: company.color }}
                >
                  {company.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-800 transition-colors hidden sm:inline">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURES ═══════════════════════ */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200/60 text-sm font-semibold text-[#6B9B5F] mb-4">
              <IconSparkles className="w-4 h-4" />
              Fonctionnalites
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Une plateforme complete pour optimiser chaque etape de votre
              processus de recrutement en Afrique francophone.
            </p>
          </div>

          <div className="space-y-20 lg:space-y-28">
            {features.map((feature, i) => {
              const isReversed = i % 2 === 1;
              return (
                <div
                  key={i}
                  className={`flex flex-col ${
                    isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
                  } items-center gap-10 lg:gap-16`}
                >
                  {/* Text */}
                  <div className="flex-1 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B9B5F]/10 text-xs font-bold text-[#6B9B5F] uppercase tracking-wider mb-4">
                      {feature.badge}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.highlights.map((item, j) => (
                        <li key={j} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#6B9B5F]/10 flex items-center justify-center shrink-0">
                            <IconCheck className="w-3 h-3 text-[#6B9B5F]" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Illustration card */}
                  <div className="flex-1 w-full max-w-xl">
                    <div className="relative">
                      <div
                        className="absolute -inset-3 rounded-3xl blur-xl pointer-events-none"
                        style={{
                          background:
                            i === 0
                              ? 'linear-gradient(135deg, rgba(107,155,95,0.12), rgba(107,155,95,0.03))'
                              : i === 1
                              ? 'linear-gradient(135deg, rgba(124,58,237,0.10), rgba(124,58,237,0.03))'
                              : 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(245,158,11,0.03))',
                        }}
                      />
                      <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                        {/* Feature illustration content */}
                        {i === 0 && (
                          <div className="p-6">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-10 h-10 rounded-xl bg-[#6B9B5F]/10 flex items-center justify-center">
                                <IconZap className="w-5 h-5 text-[#6B9B5F]" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">Matching IA</p>
                                <p className="text-xs text-gray-500">3 nouveaux matchs</p>
                              </div>
                            </div>
                            {/* Match candidates */}
                            {[
                              { name: 'Kofi Mensah', role: 'Dev Full Stack', score: 94, loc: 'Abidjan' },
                              { name: 'Aissatou Ba', role: 'Data Analyst', score: 89, loc: 'Dakar' },
                              { name: 'Ibrahim Traore', role: 'DevOps Engineer', score: 85, loc: 'Douala' },
                            ].map((c, j) => (
                              <div
                                key={j}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors mb-2"
                              >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B9B5F] to-[#93C587] flex items-center justify-center text-white font-bold text-sm">
                                  {c.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {c.role} - {c.loc}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[#6B9B5F]"
                                      style={{ width: `${c.score}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-[#6B9B5F]">
                                    {c.score}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {i === 1 && (
                          <div className="p-6">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
                                <IconBriefcase className="w-5 h-5 text-[#7C3AED]" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">Pipeline Recrutement</p>
                                <p className="text-xs text-gray-500">12 candidatures actives</p>
                              </div>
                            </div>
                            {/* Pipeline stages */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                              {[
                                { stage: 'Postule', count: 24, color: '#94A3B8' },
                                { stage: 'Entretien', count: 8, color: '#7C3AED' },
                                { stage: 'Evaluation', count: 5, color: '#F59E0B' },
                                { stage: 'Offre', count: 2, color: '#6B9B5F' },
                              ].map((s, j) => (
                                <div key={j} className="text-center">
                                  <div
                                    className="text-2xl font-bold mb-1"
                                    style={{ color: s.color }}
                                  >
                                    {s.count}
                                  </div>
                                  <div className="text-[10px] text-gray-500 font-medium">{s.stage}</div>
                                  <div
                                    className="w-full h-1 rounded-full mt-2"
                                    style={{ backgroundColor: s.color + '30' }}
                                  >
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        backgroundColor: s.color,
                                        width: `${(s.count / 24) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Mini bar chart */}
                            <div className="bg-gray-50 rounded-xl p-4 mt-4">
                              <p className="text-xs font-semibold text-gray-700 mb-3">
                                Candidatures cette semaine
                              </p>
                              <div className="flex items-end gap-1.5 h-16">
                                {[40, 65, 55, 80, 70, 90, 50].map((h, j) => (
                                  <div
                                    key={j}
                                    className="flex-1 rounded-t-md bg-[#7C3AED]/20 hover:bg-[#7C3AED]/40 transition-colors"
                                    style={{ height: `${h}%` }}
                                  />
                                ))}
                              </div>
                              <div className="flex justify-between mt-2">
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => (
                                  <span key={d} className="text-[9px] text-gray-400 font-medium flex-1 text-center">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {i === 2 && (
                          <div className="p-6">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                                <IconSend className="w-5 h-5 text-[#F59E0B]" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">Messagerie</p>
                                <p className="text-xs text-gray-500">3 conversations actives</p>
                              </div>
                            </div>
                            {/* Chat messages */}
                            <div className="space-y-3">
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#FF6600] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  OC
                                </div>
                                <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%]">
                                  <p className="text-xs font-medium text-gray-800">
                                    Bonjour Aminata, votre candidature nous a beaucoup
                                    interesses. Seriez-vous disponible pour un entretien ?
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">Orange CI - 10:30</p>
                                </div>
                              </div>
                              <div className="flex gap-3 justify-end">
                                <div className="bg-[#6B9B5F] rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[80%]">
                                  <p className="text-xs font-medium text-white">
                                    Bonjour ! Merci pour votre retour. Je suis disponible
                                    la semaine prochaine, mardi ou mercredi.
                                  </p>
                                  <p className="text-[10px] text-white/60 mt-1">Vous - 10:45</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B9B5F] to-[#93C587] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  AD
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#FF6600] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  OC
                                </div>
                                <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%]">
                                  <p className="text-xs font-medium text-gray-800">
                                    Parfait ! Je vous envoie une invitation pour mardi a
                                    14h. A bientot !
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">Orange CI - 11:02</p>
                                </div>
                              </div>
                            </div>
                            {/* Input bar */}
                            <div className="flex items-center gap-2 mt-4 p-2 bg-gray-50 rounded-xl">
                              <div className="flex-1 px-3 py-2 bg-white rounded-lg text-xs text-gray-400 border border-gray-200">
                                Ecrire un message...
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-[#6B9B5F] flex items-center justify-center cursor-pointer hover:bg-[#5A8A4E] transition-colors">
                                <IconSend className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SECURITY ═══════════════════════ */}
      <section id="security" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200/60 text-sm font-semibold text-[#6B9B5F] mb-4">
              <IconShield className="w-4 h-4" />
              Securite
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Vos donnees sont en securite
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Nous appliquons les standards les plus exigeants pour proteger
              les donnees de vos candidats et de votre entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityCards.map((card, i) => {
              const CardIcon = securityIcons[card.icon];
              return (
                <div
                  key={i}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#6B9B5F]/30 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#6B9B5F]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CardIcon className="w-6 h-6 text-[#6B9B5F]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
      <section id="testimonials" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200/60 text-sm font-semibold text-[#6B9B5F] mb-4">
              <IconStar className="w-4 h-4 text-[#6B9B5F]" />
              Temoignages
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Ce qu&apos;ils disent de nous
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Decouvrez comment INTOWORK transforme le recrutement pour les
              entreprises et les candidats a travers l&apos;Afrique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 hover:shadow-xl hover:shadow-gray-100/80 hover:border-gray-200 transition-all duration-300"
              >
                {/* Metric badge */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1.5 rounded-xl bg-[#6B9B5F]/10">
                    <span className="text-xl font-extrabold text-[#6B9B5F]">
                      {t.metric}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {t.metricLabel}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <IconStar key={j} className="w-4 h-4 text-[#F59E0B]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: t.avatar }}
                  >
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section id="pricing" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200/60 text-sm font-semibold text-[#6B9B5F] mb-4">
              Tarifs
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Un plan pour chaque ambition
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Commencez gratuitement et evoluez avec vos besoins. Pas de frais
              caches, pas d&apos;engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-6 lg:p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-white border-2 border-[#6B9B5F] shadow-xl shadow-green-500/10 scale-[1.02] lg:scale-105'
                    : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 rounded-full bg-[#6B9B5F] text-white text-xs font-bold shadow-md">
                      Le plus populaire
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.currency && (
                      <span className="text-sm font-medium text-gray-500">
                        {plan.currency}
                      </span>
                    )}
                    {plan.period && (
                      <span className="text-sm text-gray-400">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          plan.highlighted
                            ? 'bg-[#6B9B5F]/10'
                            : 'bg-gray-100'
                        }`}
                      >
                        <IconCheck
                          className={`w-3 h-3 ${
                            plan.highlighted ? 'text-[#6B9B5F]' : 'text-gray-500'
                          }`}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-xl text-sm font-bold transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-[#6B9B5F] text-white hover:bg-[#5A8A4E] shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6B9B5F] via-[#5A8A4E] to-[#4A7A3E] p-10 lg:p-16 text-center">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                Pret a transformer votre recrutement ?
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                Rejoignez plus de 500 entreprises qui font confiance a INTOWORK
                pour trouver les meilleurs talents en Afrique francophone.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-[#6B9B5F] bg-white hover:bg-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Commencer gratuitement
                  <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white border-2 border-white/30 hover:border-white/60 rounded-2xl hover:bg-white/10 transition-all duration-300"
                >
                  Demander une demo
                </Link>
              </div>
              <p className="mt-6 text-sm text-white/60">
                Essai gratuit 14 jours - Aucune carte bancaire requise
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ COUNTRIES BANNER ═══════════════════════ */}
      <section className="py-10 border-t border-gray-100 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Present dans 15+ pays francophones
          </p>
        </div>
        <div className="relative">
          <div className="flex gap-8 overflow-hidden">
            <div className="flex gap-8 scroll-left-track" style={{ minWidth: 'max-content' }}>
              {[...countries, ...countries].map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 whitespace-nowrap"
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="text-sm font-medium text-gray-600">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="bg-gray-900 text-white pt-16 lg:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
            {/* Brand col */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <img
                  src="/logo-intowork.png"
                  alt="INTOWORK"
                  className="h-20 w-auto brightness-0 invert"
                />
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                La plateforme de recrutement qui comprend l&apos;Afrique francophone.
              </p>
              <div className="flex gap-3">
                {['LinkedIn', 'Twitter', 'Facebook'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[#6B9B5F] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                    aria-label={social}
                  >
                    <span className="text-xs font-bold">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Link cols */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; 2026 INTOWORK. Tous droits reserves.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                CGU
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Confidentialite
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
