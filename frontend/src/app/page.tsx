'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import { jobsAPI } from '@/lib/api';
import type { Job } from '@/lib/api';

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
  { label: 'Comment ca marche', href: '#how-it-works' },
  { label: 'Fonctionnalites', href: '#features' },
  { label: 'Offres', href: '/offres' },
  { label: 'Temoignages', href: '#testimonials' },
  { label: 'Tarifs', href: '#pricing' },
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
    photo: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=200&h=200&fit=crop&crop=face',
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
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
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
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face',
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
  { name: "Côte d'Ivoire", code: "ci" },
  { name: "Sénégal", code: "sn" },
  { name: "Cameroun", code: "cm" },
  { name: "Mali", code: "ml" },
  { name: "Guinée", code: "gn" },
  { name: "Burkina Faso", code: "bf" },
  { name: "Togo", code: "tg" },
  { name: "Bénin", code: "bj" },
  { name: "Niger", code: "ne" },
  { name: "Gabon", code: "ga" },
  { name: "Congo", code: "cg" },
  { name: "RDC", code: "cd" },
  { name: "Maroc", code: "ma" },
  { name: "Tunisie", code: "tn" },
  { name: "Madagascar", code: "mg" },
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
   ANIMATION UTILITIES
   ═══════════════════════════════════════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setIsInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isInView };
}

function AnimateOnScroll({ children, className = '', delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={`${className} ${isInView ? 'reveal-up' : 'reveal-hidden'}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

function AnimatedStat({ end, suffix, label, start }: {
  end: number; suffix: string; label: string; start: boolean;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const duration = 1800;
    let startTime: number | null = null;
    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const p = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, start]);
  return (
    <div className="text-center">
      <div className="text-4xl lg:text-5xl font-extrabold text-[#6B9B5F]">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Array<{ name: string; count: number }>>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Charger les offres en vedette et les entreprises partenaires
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingJobs(true);
        const response = await jobsAPI.getJobs({ limit: 50 });
        if (response?.jobs?.length > 0) {
          setFeaturedJobs(response.jobs.slice(0, 3));
          const companyMap = new Map<string, number>();
          response.jobs.forEach((job: Job) => {
            const name = job.company_name || 'Entreprise';
            companyMap.set(name, (companyMap.get(name) || 0) + 1);
          });
          setCompanies(
            Array.from(companyMap.entries())
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 4)
          );
        }
      } catch (error) {
        console.error('Erreur chargement offres:', error);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="loading loading-spinner loading-lg text-[#6B9B5F]"></div>
      </div>
    );
  }

  return (
    <div className={`${plusJakarta.variable} font-sans antialiased bg-white scroll-smooth`}>
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
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal-up {
          animation: revealUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .reveal-hidden { opacity: 0; }
        @keyframes countLine {
          from { width: 0; }
          to { width: 100%; }
        }
        .step-line-animate {
          animation: countLine 1.2s ease-out forwards;
        }
        /* --- Score bar animee - Feature 1 Matching IA --- */
        @keyframes scoreBarFill {
          from { width: 0%; }
          to { width: var(--score-width); }
        }
        @keyframes scoreNumberReveal {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        .score-bar-animate {
          animation: scoreBarFill 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 0.4s;
          width: 0;
        }
        .score-number-animate {
          animation: scoreNumberReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 1.1s;
          opacity: 0;
        }
        /* --- Carousel templates CV - Feature 2 --- */
        @keyframes templateSlide {
          0%, 20% { transform: translateX(0); }
          25%, 45% { transform: translateX(-33.333%); }
          50%, 70% { transform: translateX(-66.666%); }
          75%, 100% { transform: translateX(0); }
        }
        .template-carousel {
          animation: templateSlide 12s ease-in-out infinite;
        }
        /* --- Notification glissante - Feature 3 --- */
        @keyframes slideInNotification {
          from { opacity: 0; transform: translateX(40px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .notification-slide-in {
          animation: slideInNotification 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 1.5s;
          opacity: 0;
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes heroMockupReveal {
          from {
            opacity: 0;
            transform: perspective(1200px) rotateY(-8deg) rotateX(4deg) translateY(40px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: perspective(1200px) rotateY(-3deg) rotateX(2deg) translateY(0) scale(1);
          }
        }
        @keyframes slideInFromLeftHero {
          from { opacity: 0; transform: translateX(-40px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-hero-mockup { animation: heroMockupReveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-slide-in-left-hero { animation: slideInFromLeftHero 0.8s ease-out forwards; }
        .delay-600 { animation-delay: 600ms; }
        .delay-700 { animation-delay: 700ms; }
        .delay-800 { animation-delay: 800ms; }
        .delay-900 { animation-delay: 900ms; }
        .delay-1000 { animation-delay: 1000ms; }
        @media (min-width: 1024px) {
          .hero-mockup-3d {
            transform: perspective(1200px) rotateY(-3deg) rotateX(2deg);
          }
        }
        @media (max-width: 1023px) {
          .animate-hero-mockup {
            animation: heroMockupRevealMobile 0.8s ease-out forwards;
          }
          @keyframes heroMockupRevealMobile {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
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
                className="h-10 sm:h-12 lg:h-14 w-auto"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#6B9B5F] rounded-lg hover:bg-green-50/60 transition-all duration-200"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#6B9B5F] rounded-lg hover:bg-green-50/60 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/signin"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#6B9B5F] transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
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
              {navLinks.map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#6B9B5F] hover:bg-green-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#6B9B5F] hover:bg-green-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  href="/signin"
                  className="px-4 py-3 text-sm font-semibold text-gray-700 text-center hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
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
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 lg:pb-20 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50/40 to-white pointer-events-none" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#6B9B5F]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">

            {/* --- LEFT COLUMN: CONTENT --- */}
            <div className="lg:col-span-6 text-center lg:text-left mb-12 lg:mb-0">
              {/* Heading */}
              <h1
                className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] animate-fade-in-up delay-100"
                style={{ opacity: 0, animationFillMode: 'forwards' }}
              >
                La plateforme de recrutement{' '}
                <span className="animate-shimmer">qui comprend l&apos;Afrique</span>
              </h1>

              <p
                className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-200"
                style={{ opacity: 0, animationFillMode: 'forwards' }}
              >
                Connectez les meilleurs talents aux entreprises les plus ambitieuses
                dans plus de 15 pays francophones.
              </p>

              {/* Dual CTAs */}
              <div
                className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up delay-300"
                style={{ opacity: 0, animationFillMode: 'forwards' }}
              >
                <Link
                  href="/signup"
                  className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-2xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <IconBriefcase className="w-5 h-5" />
                  Espace Recruteur
                  <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-[#6B9B5F] bg-white hover:bg-green-50 border-2 border-[#6B9B5F]/20 hover:border-[#6B9B5F]/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <IconUser className="w-5 h-5" />
                  Espace Candidat
                  <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Avatar Stack Trust Strip */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up delay-400" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
                    "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80",
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
                  ].map((url, i) => (
                    <img key={i} src={url} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" alt="User avatar" />
                  ))}
                </div>
                <p className="text-sm text-gray-500 font-medium text-center sm:text-left">
                  Rejoint par <span className="text-gray-900 font-bold">10 000+ candidats</span> dans 500+ entreprises et 15 pays
                </p>
              </div>
            </div>

            {/* --- RIGHT COLUMN: INTERACTIVE MOCKUP --- */}
            <div className="lg:col-span-6 relative animate-hero-mockup delay-500" style={{ opacity: 0, animationFillMode: 'forwards' }}>

              {/* OVERLAY: Portrait Photo */}
              <div className="hidden lg:block absolute -left-14 -top-4 z-30 animate-slide-in-left-hero delay-1000" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-[#6B9B5F]/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <img
                    src="https://images.unsplash.com/photo-1739300293504-234817eead52?w=400&h=560&fit=crop&crop=top&q=80"
                    className="w-44 h-64 object-cover rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border-[6px] border-white relative z-10"
                    alt="Candidate"
                  />
                </div>
              </div>

              {/* OVERLAY: Notification Toast */}
              <div className="hidden lg:block absolute -top-8 -right-8 z-40 w-72 notification-slide-in" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F0F7EE] flex items-center justify-center border border-gray-100 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=100&q=80" className="w-full h-full object-cover" alt="Orange CI" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#6B9B5F] rounded-full p-1 border-2 border-white shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[13px] font-bold text-gray-900 leading-tight">Nouvelle candidature</p>
                        <span className="text-[9px] font-bold text-[#6B9B5F] bg-[#6B9B5F]/10 px-1.5 py-0.5 rounded">À l&apos;instant</span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium truncate">Orange CI — Product Designer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OVERLAY: AI Match Card */}
              <div className="hidden lg:block absolute -bottom-12 -left-10 z-40 animate-fade-in-up delay-700" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-white p-4 w-60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#7C3AED]/10 p-1.5 rounded-lg">
                        <IconSparkles className="w-4 h-4 text-[#7C3AED]" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">IA Matching</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#6B9B5F]">94%</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#6B9B5F] to-[#93C587] w-[94%] rounded-full shadow-[0_0_8px_rgba(107,155,95,0.4)]" />
                    </div>
                    <div className="flex items-center gap-2.5">
                      <img src="/candidates/kofi-mensah.jpeg" className="w-6 h-6 rounded-full ring-2 ring-white object-cover object-center shadow-sm" alt="Kofi M." />
                      <p className="text-[11px] font-bold text-gray-700">Kofi M. <span className="text-gray-400 font-medium ml-1">Expert Cloud</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Mockup */}
              <div className="relative hero-mockup-3d">
                {/* Intense Green Glow */}
                <div className="absolute -inset-10 bg-[#6B9B5F]/20 rounded-[3rem] blur-[80px] pointer-events-none" />

                <div className="relative bg-white rounded-2xl border border-gray-200/80 shadow-[0_32px_64px_rgba(107,155,95,0.25)] overflow-hidden">
                  {/* Browser Chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 px-3 py-1">
                        <IconLock className="w-3 h-3 text-green-600" />
                        <span className="text-[10px] text-gray-400 font-medium">app.intowork.co/dashboard</span>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Header */}
                  <div className="p-5">
                    <div className="bg-gradient-to-r from-[#6B9B5F] to-[#93C587] rounded-xl p-5 mb-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">Bonjour,</p>
                          <h2 className="text-lg font-bold text-white">Bienvenue, Aminata</h2>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                          <span className="text-[10px] text-white font-bold">En ligne</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Profil complet', value: '85%', color: '#6B9B5F' },
                        { label: 'Offres actives', value: '127', color: '#7C3AED' },
                        { label: 'Candidatures', value: '8', color: '#F59E0B' },
                        { label: 'Score matching', value: '94%', color: '#6B9B5F' }
                      ].map((stat, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <div className="text-[10px] text-gray-500 font-semibold mb-1 uppercase tracking-tight">{stat.label}</div>
                          <div className="text-xl font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ═══════════════════════ ANIMATED STATS ═══════════════════════ */}
      <section ref={statsRef} className="py-12 lg:py-16 bg-gradient-to-b from-gray-50/50 to-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <AnimatedStat end={10000} suffix="+" label="Candidats actifs" start={statsVisible} />
          <AnimatedStat end={500} suffix="+" label="Entreprises" start={statsVisible} />
          <AnimatedStat end={94} suffix="%" label="Taux de matching" start={statsVisible} />
          <AnimatedStat end={15} suffix="+" label="Pays couverts" start={statsVisible} />
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-white relative overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-[#6B9B5F]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-[#7C3AED]/5 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll className="text-center mb-16 lg:mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-sm font-bold text-[#6B9B5F] mb-6">
              <IconSparkles className="w-4 h-4" />
              PROCESSUS DE RÉUSSITE
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Votre carrière propulsée par <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B9B5F] to-[#93C587]">l&apos;IA</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Connectez-vous aux meilleures opportunités d&apos;Afrique de l&apos;Ouest en 3 étapes intelligentes.
            </p>
          </AnimateOnScroll>

          {/* Progress Timeline (Desktop) */}
          <div className="hidden lg:flex items-center justify-between max-w-4xl mx-auto mb-16 relative">
            <div className="absolute left-0 right-0 h-0.5 bg-gray-100 top-1/2 -translate-y-1/2" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative z-10 w-4 h-4 rounded-full bg-white border-4 border-[#6B9B5F] shadow-[0_0_15px_rgba(107,155,95,0.4)] animate-pulse-soft" />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
            {/* Étape 1 */}
            <AnimateOnScroll delay={0}>
              <div className="group relative h-full p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                <span className="absolute -top-6 -right-4 text-9xl font-black text-gray-50/80 pointer-events-none transition-transform group-hover:scale-110 select-none">01</span>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B9B5F] to-[#93C587] flex items-center justify-center text-white mb-6 shadow-lg shadow-green-100">
                    <IconUser className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Créez votre profil</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">Importez votre CV. Notre IA extrait vos compétences pour bâtir un profil attractif.</p>
                  {/* Inline Mockup 1 */}
                  <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="Amadou" loading="lazy" />
                      <div className="flex-1">
                        <div className="h-2.5 w-24 bg-gray-200 rounded-full mb-1.5" />
                        <div className="h-2 w-16 bg-gray-100 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold text-[#6B9B5F] uppercase">
                        <span>Complétion</span>
                        <span>85%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#6B9B5F] to-[#93C587] rounded-full w-[85%]" />
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['React.js', 'UI/UX', 'Python'].map(t => (
                          <span key={t} className="px-2 py-0.5 text-[10px] bg-white border border-gray-100 rounded-md font-medium text-gray-500">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Étape 2 */}
            <AnimateOnScroll delay={150}>
              <div className="group relative h-full p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                <span className="absolute -top-6 -right-4 text-9xl font-black text-gray-50/80 pointer-events-none select-none">02</span>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-100">
                    <IconSparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">L&apos;IA trouve vos matchs</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">Notre algorithme analyse en temps réel des milliers d&apos;offres pour vous proposer le match parfait.</p>
                  {/* Inline Mockup 2 */}
                  <div className="space-y-3">
                    {[
                      { n: 'Orange CI', s: 94, loc: 'Abidjan' },
                      { n: 'Ecobank Group', s: 89, loc: 'Lomé' },
                      { n: 'MTN Sénégal', s: 85, loc: 'Dakar' },
                    ].map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{m.n}</span>
                          <span className="text-[10px] text-gray-500">{m.loc}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#7C3AED]">{m.s}%</span>
                          <div className="w-1 h-6 bg-[#7C3AED]/20 rounded-full overflow-hidden flex flex-col justify-end">
                            <div className="w-full bg-[#7C3AED] rounded-full" style={{ height: `${m.s}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Étape 3 */}
            <AnimateOnScroll delay={300}>
              <div className="group relative h-full p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                <span className="absolute -top-6 -right-4 text-9xl font-black text-gray-50/80 pointer-events-none select-none">03</span>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-100">
                    <IconSend className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Décrochez le poste</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">Suivez vos candidatures, discutez avec les recruteurs et planifiez vos entretiens.</p>
                  {/* Inline Mockup 3 */}
                  <div className="p-4 rounded-2xl bg-[#6B9B5F]/5 border border-[#6B9B5F]/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                        <IconCalendar className="w-4 h-4 text-[#6B9B5F]" />
                      </div>
                      <span className="text-xs font-bold text-gray-900">Entretien Confirmé</span>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-[#6B9B5F]/10">
                      <div className="w-8 h-8 rounded-lg bg-[#FF6600] flex items-center justify-center text-white text-[10px] font-black shrink-0">O</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-gray-900 truncate">Orange Côte d&apos;Ivoire</div>
                        <div className="text-[9px] text-gray-500">Mardi 25 Mars — 14h00</div>
                      </div>
                      <div className="px-2 py-0.5 rounded-full bg-[#6B9B5F] text-[9px] font-bold text-white shrink-0">OK</div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Final CTA Banner */}
          <AnimateOnScroll delay={450}>
            <div className="relative p-8 sm:p-16 rounded-[3rem] bg-gradient-to-br from-[#6B9B5F] to-[#4B7340] overflow-hidden shadow-2xl shadow-green-200">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                  Prêt à changer de dimension ?
                </h3>
                <p className="text-green-50/80 text-lg mb-12 max-w-xl mx-auto">
                  Rejoignez les talents qui transforment l&apos;économie numérique en Afrique de l&apos;Ouest dès aujourd&apos;hui.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <a href="/signup" className="px-10 py-5 bg-white text-[#6B9B5F] font-bold text-lg rounded-2xl hover:bg-gray-50 transition-all hover:scale-105 shadow-xl text-center">
                    Lancer ma recherche gratuite
                  </a>
                  <a href="/signin" className="px-8 py-5 bg-transparent border-2 border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all text-center">
                    Se connecter
                  </a>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════ FEATURES ═══════════════════════ */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center mb-14">
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
          </AnimateOnScroll>

          {/* Photo d'équipe contextuelle */}
          <AnimateOnScroll className="mb-16 lg:mb-20">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&h=480&fit=crop&q=80"
                alt="Équipe africaine en collaboration"
                className="w-full h-48 sm:h-64 object-cover"
                loading="lazy"
                decoding="async"
                width={1400}
                height={480}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#6B9B5F]/30 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=60&h=60&fit=crop&crop=face','https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&h=60&fit=crop&crop=face','https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=60&h=60&fit=crop&crop=face'].map((src, i) => (
                      <img key={i} src={src} alt="Utilisateur INTOWORK" className="w-7 h-7 rounded-full object-cover object-top border-2 border-white" loading="lazy" decoding="async" width={28} height={28} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">500+ entreprises utilisent INTOWORK</span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

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
                            {/* Badge IA Active */}
                            <div className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100 w-fit">
                              <div className="w-2 h-2 rounded-full bg-[#6B9B5F] animate-pulse-soft" />
                              <span className="text-[10px] font-semibold text-[#6B9B5F] uppercase tracking-wide">IA Active</span>
                            </div>
                            {/* Match candidates */}
                            {[
                              { name: 'Kofi Mensah', role: 'Dev Full Stack', score: 94, loc: 'Abidjan', photo: '/candidates/kofi-mensah.jpeg' },
                              { name: 'Aissatou Ba', role: 'Data Analyst', score: 89, loc: 'Dakar', photo: '/candidates/aissatou-ba.jpeg' },
                              { name: 'Ibrahim Traore', role: 'DevOps Engineer', score: 85, loc: 'Douala', photo: '/candidates/ibrahim-traore.jpeg' },
                            ].map((c, j) => (
                              <div
                                key={j}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors mb-2"
                              >
                                <img
                                  src={c.photo}
                                  alt={c.name}
                                  className="w-10 h-10 rounded-full object-cover object-center border-2 border-white shadow-sm hidden md:block"
                                  loading="lazy"
                                  decoding="async"
                                  width={40}
                                  height={40}
                                />
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B9B5F] to-[#93C587] flex md:hidden items-center justify-center text-white font-bold text-sm shrink-0">
                                  {c.name.split(' ').map((n: string) => n[0]).join('')}
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
                                      className="h-full rounded-full bg-[#6B9B5F] score-bar-animate"
                                      style={{ '--score-width': `${c.score}%` } as React.CSSProperties}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-[#6B9B5F] score-number-animate">
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
                            {/* Mini carousel CV Builder */}
                            <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
                              <div className="px-3 py-2 bg-white border-b border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-gray-700">CV Builder — 5 templates</span>
                                <span className="text-[10px] text-[#7C3AED] font-medium">Aperçu</span>
                              </div>
                              <div className="overflow-hidden bg-gray-50">
                                <div className="flex template-carousel" style={{ width: '300%' }}>
                                  {[
                                    { name: 'Elegance', color: '#6B9B5F', accent: '#93C587' },
                                    { name: 'Impact', color: '#6B46C1', accent: '#8B5CF6' },
                                    { name: 'Epure', color: '#1f2937', accent: '#6b7280' },
                                  ].map((tpl) => (
                                    <div key={tpl.name} className="w-1/3 p-3 flex-shrink-0">
                                      <div className="bg-white rounded-lg border border-gray-200 p-2.5 h-20">
                                        <div className="flex gap-2 mb-2">
                                          <div className="w-7 h-7 rounded-full shrink-0" style={{ backgroundColor: tpl.color + '25' }}>
                                            <div className="w-full h-full rounded-full flex items-center justify-center">
                                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tpl.color + '80' }} />
                                            </div>
                                          </div>
                                          <div className="flex-1 space-y-1">
                                            <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: tpl.color }} />
                                            <div className="h-1.5 rounded-full bg-gray-200 w-full" />
                                          </div>
                                        </div>
                                        <div className="space-y-1 mb-1">
                                          <div className="h-1 rounded-full bg-gray-100 w-full" />
                                          <div className="h-1 rounded-full bg-gray-100 w-5/6" />
                                        </div>
                                        <div className="text-[8px] font-bold text-center mt-1" style={{ color: tpl.color }}>{tpl.name}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
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
                                <img
                                  src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=64&h=64&fit=crop&crop=face"
                                  alt="Orange CI"
                                  className="w-8 h-8 rounded-full object-cover object-top border border-gray-200 shrink-0 hidden md:block"
                                  loading="lazy"
                                  decoding="async"
                                  width={32}
                                  height={32}
                                />
                                <div className="w-8 h-8 rounded-full bg-[#FF6600] flex md:hidden items-center justify-center text-white text-xs font-bold shrink-0">OC</div>
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
                                <img
                                  src="https://images.unsplash.com/photo-1739300293504-234817eead52?w=64&h=64&fit=crop&crop=face"
                                  alt="Aminata"
                                  className="w-8 h-8 rounded-full object-cover object-top border border-white shadow-sm shrink-0 hidden md:block"
                                  loading="lazy"
                                  decoding="async"
                                  width={32}
                                  height={32}
                                />
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B9B5F] to-[#93C587] flex md:hidden items-center justify-center text-white text-xs font-bold shrink-0">AD</div>
                              </div>
                              <div className="flex gap-3">
                                <img
                                  src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=64&h=64&fit=crop&crop=face"
                                  alt="Orange CI"
                                  className="w-8 h-8 rounded-full object-cover object-top border border-gray-200 shrink-0 hidden md:block"
                                  loading="lazy"
                                  decoding="async"
                                  width={32}
                                  height={32}
                                />
                                <div className="w-8 h-8 rounded-full bg-[#FF6600] flex md:hidden items-center justify-center text-white text-xs font-bold shrink-0">OC</div>
                                <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%]">
                                  <p className="text-xs font-medium text-gray-800">
                                    Parfait ! Je vous envoie une invitation pour mardi a
                                    14h. A bientot !
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">Orange CI - 11:02</p>
                                </div>
                              </div>
                            </div>
                            {/* Notification entretien animee */}
                            <div className="notification-slide-in flex items-center gap-2 mt-3 p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/60">
                              <div className="w-6 h-6 rounded-full bg-[#6B9B5F] flex items-center justify-center shrink-0">
                                <IconCalendar className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-semibold text-gray-800 truncate">Entretien confirme — Mardi 25 Mars, 14h00</p>
                                <p className="text-[9px] text-[#6B9B5F] font-medium">Invitation Google Meet envoyee</p>
                              </div>
                              <div className="w-2 h-2 rounded-full bg-[#6B9B5F] animate-pulse-soft shrink-0" />
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
          <AnimateOnScroll className="text-center mb-14">
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
          </AnimateOnScroll>

          {/* Photo de confiance - desktop uniquement */}
          <div className="relative mb-10 hidden lg:block overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1400&h=320&fit=crop&q=80"
              alt="Professionnelle de confiance"
              className="w-full h-40 object-cover object-top opacity-60"
              loading="lazy"
              decoding="async"
              width={1400}
              height={320}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-gray-50/40" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityCards.map((card, i) => {
              const CardIcon = securityIcons[card.icon];
              return (
                <AnimateOnScroll
                  key={i}
                  delay={i * 100}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#6B9B5F]/30 hover:shadow-lg hover:shadow-green-500/5 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
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
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ OFFRES EN VEDETTE ═══════════════════════ */}
      <section id="offres" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200/60 text-sm font-semibold text-[#6B9B5F] mb-4">
              <IconBriefcase className="w-4 h-4" />
              Opportunites
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Offres en vedette
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Decouvrez les dernieres opportunites publiees sur notre plateforme
            </p>
          </AnimateOnScroll>

          {loadingJobs ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {featuredJobs.map((job) => (
                <Link
                  key={job.id}
                  href="/offres"
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#6B9B5F]/40 hover:shadow-lg hover:shadow-green-500/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#6B9B5F] transition-colors truncate">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">{job.company_name}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#6B9B5F]/10 flex items-center justify-center flex-shrink-0 ml-3">
                      <IconBriefcase className="w-5 h-5 text-[#6B9B5F]" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.location && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                    )}
                    {job.job_type && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#6B9B5F]/10 text-[#6B9B5F] text-xs font-medium">
                        {job.job_type}
                      </span>
                    )}
                  </div>
                  {job.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{job.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {job.posted_at ? new Date(job.posted_at).toLocaleDateString('fr-FR') : 'Recent'}
                    </span>
                    <span className="text-[#6B9B5F] font-semibold text-xs group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Voir l&apos;offre
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500">Aucune offre disponible pour le moment</p>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/offres"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#6B9B5F] text-white font-semibold rounded-full hover:bg-[#5a8a4f] transition-colors shadow-lg shadow-green-500/20"
            >
              Voir toutes les offres
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ENTREPRISES PARTENAIRES ═══════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-white">
        {/* Background Decorative Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#6B9B5F]/5 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 shadow-sm text-sm font-semibold text-[#6B9B5F] mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              ÉCOSYSTÈME PARTENAIRE
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Entreprises qui <span className="text-[#6B9B5F]">recrutent</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              Rejoignez les leaders du marché qui font confiance à INTOWORK pour bâtir leurs équipes de demain.
            </p>
          </AnimateOnScroll>

          {loadingJobs ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-6" />
                  <div className="h-4 bg-gray-100 rounded-full w-3/4 mx-auto mb-3" />
                  <div className="h-3 bg-gray-50 rounded-full w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : companies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
              {companies.map((company, idx) => {
                const gradients = [
                  'from-[#6B9B5F] to-[#93C587]',
                  'from-[#7C3AED] to-[#A78BFA]',
                  'from-[#003DA5] to-[#60A5FA]',
                  'from-[#F59E0B] to-[#FCD34D]',
                  'from-[#10B981] to-[#6EE7B7]'
                ];
                const gradient = gradients[idx % gradients.length];

                return (
                  <Link
                    key={company.name}
                    href="/entreprises"
                    className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#6B9B5F]/30 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
                  >
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-500`}>
                      <span className="text-2xl font-bold text-white">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#6B9B5F] transition-colors truncate">
                      {company.name}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-xs font-medium text-gray-500 group-hover:bg-green-50 group-hover:text-[#6B9B5F] transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6B9B5F] animate-pulse" />
                      {company.count} offre{company.count > 1 ? 's' : ''} active{company.count > 1 ? 's' : ''}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto mb-16 text-center py-20 px-8 rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-50">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Bientôt disponible</h4>
              <p className="text-gray-500">Les entreprises apparaitront ici dès qu&apos;elles auront publié leurs premières offres.</p>
            </div>
          )}

          <div className="flex justify-center">
            <Link
              href="/entreprises"
              className="group relative inline-flex items-center gap-3 px-10 py-4 text-base font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-2xl transition-all duration-300 shadow-lg shadow-[#6B9B5F]/20 hover:shadow-xl hover:shadow-[#6B9B5F]/30 overflow-hidden"
            >
              <span className="relative z-10">Parcourir toutes les entreprises</span>
              <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
      <section id="testimonials" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center mb-14">
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
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <AnimateOnScroll
                key={i}
                delay={i * 150}
                className="group bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 hover:shadow-xl hover:shadow-gray-100/80 hover:border-gray-200 hover:-translate-y-1.5 transition-all duration-300"
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
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#6B9B5F]/20 shrink-0"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section id="pricing" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center mb-14">
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
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <AnimateOnScroll
                key={i}
                delay={i * 150}
                className={`relative rounded-2xl p-6 lg:p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-white border-2 border-[#6B9B5F] shadow-xl shadow-green-500/10 md:scale-[1.02] lg:scale-105 hover:shadow-2xl hover:scale-[1.06]'
                    : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1'
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

                <a
                  href="/signup"
                  className={`w-full py-3 px-6 rounded-xl text-sm font-bold transition-all duration-200 text-center block ${
                    plan.highlighted
                      ? 'bg-[#6B9B5F] text-white hover:bg-[#5A8A4E] shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </a>
              </AnimateOnScroll>
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
                  href="/signup"
                  className="group inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-[#6B9B5F] bg-white hover:bg-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Commencer gratuitement
                  <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white border-2 border-white/30 hover:border-white/60 rounded-2xl hover:bg-white/10 transition-all duration-300"
                >
                  Demander une demo
                </Link>
              </div>
              {/* Social proof — avatar stack */}
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="flex -space-x-3">
                  {[
                    'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=80&h=80&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=80&h=80&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1685634113141-93cc677b2724?w=80&h=80&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face',
                  ].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Utilisateur INTOWORK"
                      className="w-9 h-9 rounded-full object-cover object-top border-2 border-white/80"
                      loading="lazy"
                      decoding="async"
                      width={36}
                      height={36}
                    />
                  ))}
                </div>
                <p className="text-sm text-white/70">
                  <span className="font-bold text-white">500+</span> recruteurs actifs cette semaine
                </p>
              </div>
              <p className="mt-3 text-sm text-white/60">
                Essai gratuit 14 jours - Aucune carte bancaire requise
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ COUNTRIES BANNER ═══════════════════════ */}
      <section className="py-20 lg:py-28 border-t border-gray-50 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0F7EE] border border-[#6B9B5F]/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B9B5F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B9B5F]"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#6B9B5F]">
                Expansion Afrique
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Présent dans <span className="text-[#6B9B5F] relative inline-block">
                15+ pays
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#6B9B5F]/20 rounded-full"></span>
              </span> francophones
            </h2>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 hidden md:block"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 hidden md:block"></div>

          <div className="flex overflow-hidden">
            <div className="flex gap-6 py-4 scroll-left-track" style={{ minWidth: 'max-content' }}>
              {[...countries, ...countries, ...countries].map((c, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-6 py-4 bg-white rounded-full border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default whitespace-nowrap ${
                    [
                      'border-emerald-100 hover:border-emerald-300',
                      'border-blue-100 hover:border-blue-300',
                      'border-amber-100 hover:border-amber-300',
                      'border-rose-100 hover:border-rose-300',
                      'border-indigo-100 hover:border-indigo-300'
                    ][i % 5]
                  }`}
                >
                  <img
                    src={`https://flagcdn.com/w40/${c.code}.png`}
                    alt={c.name}
                    className="w-8 h-6 object-cover rounded-md shadow-sm border border-gray-100 flex-shrink-0"
                  />
                  <span className="text-sm font-bold text-gray-900 tracking-tight whitespace-nowrap">{c.name}</span>
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
                  className="h-24 w-auto brightness-0 invert"
                />
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                La plateforme de recrutement qui comprend l&apos;Afrique francophone.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://linkedin.com/company/intowork"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[#6B9B5F] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <span className="text-xs font-bold">L</span>
                </a>
                <a
                  href="https://twitter.com/intowork"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[#6B9B5F] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                  aria-label="Twitter"
                >
                  <span className="text-xs font-bold">T</span>
                </a>
                <a
                  href="https://facebook.com/intowork"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[#6B9B5F] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                  aria-label="Facebook"
                >
                  <span className="text-xs font-bold">F</span>
                </a>
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
              <a href="/terms" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                CGU
              </a>
              <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
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
