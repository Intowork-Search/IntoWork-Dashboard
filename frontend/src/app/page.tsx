'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import { jobsAPI } from '@/lib/api';
import type { Job } from '@/lib/api';
import { getApiUrl } from '@/lib/getApiUrl';
import { logger } from '@/lib/logger';

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

const typewriterPhrases = ['Développeur Full-Stack', 'Chef de Projet', 'Comptable', 'Designer UX', 'Commercial B2B'];

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
  const [platformStats, setPlatformStats] = useState({ candidates: 10000, companies: 500, active_jobs: 15, applications: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchJob, setSearchJob] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchContract, setSearchContract] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Charger les stats publiques de la plateforme
  useEffect(() => {
    const loadStats = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/stats/public`);
        if (res.ok) {
          const data = await res.json();
          setPlatformStats(prev => ({
            candidates: data.candidates > 0 ? data.candidates : prev.candidates,
            companies: data.companies > 0 ? data.companies : prev.companies,
            active_jobs: data.active_jobs > 0 ? data.active_jobs : prev.active_jobs,
            applications: data.applications || 0,
          }));
        }
      } catch {
        // Silencieux — on garde les valeurs par défaut
      }
    };
    loadStats();
  }, []);

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
        logger.error("Erreur chargement offres:", error);
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

  // Typewriter effect for search bar placeholder
  useEffect(() => {
    const currentPhrase = typewriterPhrases[placeholderIndex];
    let timeout: ReturnType<typeof setTimeout>;
    if (!isDeleting) {
      if (charIndex < currentPhrase.length) {
        timeout = setTimeout(() => {
          setSearchPlaceholder(currentPhrase.slice(0, charIndex + 1));
          setCharIndex(c => c + 1);
        }, 80);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 1800);
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setSearchPlaceholder(currentPhrase.slice(0, charIndex - 1));
          setCharIndex(c => c - 1);
        }, 40);
      } else {
        setIsDeleting(false);
        setPlaceholderIndex(i => (i + 1) % typewriterPhrases.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, placeholderIndex]);

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
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/logo-intowork.png"
                alt="INTOWORK"
                className="h-auto w-28 sm:w-32 lg:w-40 object-contain"
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
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 lg:pb-24 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50/40 to-white pointer-events-none" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#6B9B5F]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ZONE 1: TOP CONTENT + MOCKUP */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center mb-16 lg:mb-24">

            {/* --- LEFT COLUMN: HEADING --- */}
            <div className="lg:col-span-7 text-center lg:text-left mb-16 lg:mb-0">
              <h1
                className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.05] animate-fade-in-up delay-200"
                style={{ opacity: 0, animationFillMode: 'forwards' }}
              >
                Le recrutement{' '}
                <span className="animate-shimmer block sm:inline">qui comprend l&apos;Afrique</span>
              </h1>

              <p
                className="mt-8 text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-300"
                style={{ opacity: 0, animationFillMode: 'forwards' }}
              >
                Connectez les meilleurs talents aux entreprises les plus ambitieuses
                dans plus de 15 pays francophones grâce au matching intelligent.
              </p>
            </div>

            {/* --- RIGHT COLUMN: INTERACTIVE MOCKUP --- */}
            <div className="lg:col-span-5 relative animate-hero-mockup delay-500" style={{ opacity: 0, animationFillMode: 'forwards' }}>

              {/* OVERLAY: Portrait Photo */}
              <div className="hidden lg:block absolute -left-16 -top-8 z-30 animate-slide-in-left-hero delay-1000" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <img
                  src="https://images.unsplash.com/photo-1739300293504-234817eead52?w=400&h=560&fit=crop&crop=top&q=80"
                  className="w-40 h-56 object-cover rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border-[6px] border-white relative z-10"
                  alt="Candidate"
                />
              </div>

              {/* OVERLAY: Notification Toast */}
              <div className="hidden lg:block absolute -top-12 -right-4 z-40 w-72 notification-slide-in" style={{ opacity: 0, animationFillMode: 'forwards' }}>
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
              <div className="hidden lg:block absolute -bottom-12 -left-10 z-40 animate-fade-in-up delay-400" style={{ opacity: 0, animationFillMode: 'forwards' }}>
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
                <div className="absolute -inset-10 bg-[#6B9B5F]/15 rounded-[3rem] blur-[80px] pointer-events-none" />
                <div className="relative bg-white rounded-2xl border border-gray-200/80 shadow-[0_32px_64px_rgba(107,155,95,0.2)] overflow-hidden">
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

          {/* ZONE 2: SEARCH BAR PLEINE LARGEUR */}
          <div className="max-w-5xl mx-auto animate-fade-in-up delay-400" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <div className="mb-6 flex items-center justify-center gap-2">
              <span className="w-8 h-[1.5px] bg-[#6B9B5F]/30 rounded-full"></span>
              <span className="px-3 py-1 rounded-full bg-[#6B9B5F]/10 text-[11px] font-extrabold text-[#6B9B5F] uppercase tracking-wider">
                Recherchez parmi +2 500 offres actives
              </span>
              <span className="w-8 h-[1.5px] bg-[#6B9B5F]/30 rounded-full"></span>
            </div>

            <div className="bg-white/95 backdrop-blur-2xl p-2 lg:p-3 rounded-[2.5rem] border border-white shadow-[0_32px_80px_-15px_rgba(0,0,0,0.12)] hover:shadow-[0_40px_100px_-10px_rgba(107,155,95,0.2)] transition-all duration-500 group relative ring-4 ring-[#6B9B5F]/5">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center">
                {/* Field 1: Job */}
                <div className="flex-[1.5] relative flex items-center px-6 py-4 lg:py-3 border-b lg:border-b-0 lg:border-r border-gray-100">
                  <div className="flex-shrink-0 text-gray-400 group-hover:text-[#6B9B5F] transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Métier ou compétence</label>
                    <input
                      type="text"
                      value={searchJob}
                      onChange={(e) => setSearchJob(e.target.value)}
                      placeholder={searchPlaceholder || 'Développeur, Chef de projet...'}
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-gray-900 placeholder-gray-400 font-bold text-base outline-none"
                    />
                  </div>
                </div>

                {/* Field 2: Location */}
                <div className="flex-1 relative flex items-center px-6 py-4 lg:py-3 border-b lg:border-b-0 lg:border-r border-gray-100">
                  <div className="flex-shrink-0 text-gray-400 group-hover:text-[#6B9B5F] transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Localisation</label>
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="Abidjan, Dakar..."
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-gray-900 placeholder-gray-400 font-bold text-base outline-none"
                    />
                  </div>
                </div>

                {/* Field 3: Contract */}
                <div className="flex-1 relative flex items-center px-6 py-4 lg:py-3">
                  <div className="flex-shrink-0 text-gray-400 group-hover:text-[#6B9B5F] transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1 pr-4">
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Type de contrat</label>
                    <select
                      value={searchContract}
                      onChange={(e) => setSearchContract(e.target.value)}
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-gray-900 font-bold text-base cursor-pointer appearance-none outline-none"
                    >
                      <option value="">Tous les types</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Alternance">Alternance</option>
                    </select>
                  </div>
                </div>

                {/* CTA */}
                <div className="p-1 lg:p-0 lg:ml-2">
                  <Link
                    href={`/offres?job=${encodeURIComponent(searchJob)}&location=${encodeURIComponent(searchLocation)}&contract=${encodeURIComponent(searchContract)}`}
                    className="flex items-center justify-center gap-3 w-full lg:w-auto px-12 py-5 text-base font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-3xl transition-all duration-300 shadow-lg shadow-green-500/25 active:scale-95 group/btn"
                  >
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Rechercher</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ZONE 3: SOCIAL PROOF + CTAs */}
          <div className="mt-14 flex flex-col lg:flex-row items-center justify-between gap-8 animate-fade-in-up delay-500" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
                  "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=100&q=80",
                  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
                ].map((url, i) => (
                  <img key={i} src={url} className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover" alt="Avatar" />
                ))}
              </div>
              <p className="text-sm text-gray-500 font-semibold text-center sm:text-left">
                Rejoint par <span className="text-gray-900 font-extrabold">+10 000 candidats</span> & <span className="text-gray-900 font-extrabold">500+ entreprises</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C3AED]/5 border border-[#7C3AED]/10 text-[11px] font-bold text-[#7C3AED]">
                <IconSparkles className="w-3.5 h-3.5" /> Matching IA 94%
              </div>
              <div className="w-[1px] h-5 bg-gray-200 hidden lg:block"></div>
              <div className="flex items-center gap-5">
                <Link href="/signup" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#6B9B5F] transition-colors group">
                  <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-green-50 transition-colors">
                    <IconBriefcase className="w-4 h-4" />
                  </div>
                  Espace Recruteur
                </Link>
                <Link href="/signup" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#6B9B5F] transition-colors group">
                  <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-green-50 transition-colors">
                    <IconUser className="w-4 h-4" />
                  </div>
                  Espace Candidat
                </Link>
              </div>
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

          {/* Partenaires fondateurs — statiques */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px flex-1 max-w-[80px] bg-gray-100" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Partenaires fondateurs</span>
              <div className="h-px flex-1 max-w-[80px] bg-gray-100" />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-6 max-w-2xl mx-auto">
              {[
                {
                  name: 'Agiltym',
                  logo: 'https://agiltym.com/wp-content/uploads/2025/12/agiltym-by-HC.png',
                  href: 'https://agiltym.com',
                },
                {
                  name: 'H&C Executive Education',
                  logo: 'https://hcexecutive.co/wp-content/uploads/2025/02/LOG-IN-HOR.png',
                  href: 'https://hcexecutive.co',
                },
              ].map((partner) => (
                <a
                  key={partner.name}
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-1 min-w-[220px] max-w-[320px] bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#6B9B5F]/30 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center justify-between"
                >
                  <div className="h-16 flex items-center justify-center mb-4">
                    <img
                      src={partner.logo}
                      alt={`Logo ${partner.name}`}
                      className="max-h-14 max-w-[180px] w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">{partner.name}</h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-xs font-semibold text-[#6B9B5F]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B9B5F] animate-pulse" />
                    Partenaire vérifié
                  </div>
                </a>
              ))}
            </div>
          </div>

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

      {/* ═══════════════════════ ANIMATED STATS ═══════════════════════ */}
      <section ref={statsRef} className="py-12 lg:py-16 bg-gradient-to-b from-gray-50/50 to-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <AnimatedStat end={platformStats.candidates} suffix="+" label="Candidats actifs" start={statsVisible} />
          <AnimatedStat end={platformStats.companies} suffix="+" label="Entreprises" start={statsVisible} />
          <AnimatedStat end={94} suffix="%" label="Taux de matching" start={statsVisible} />
          <AnimatedStat end={platformStats.active_jobs} suffix="+" label="Offres actives" start={statsVisible} />
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

      {/* ═══════════════════════ SPLIT CANDIDATS/EMPLOYEURS ═══════════════════════ */}
      <section className="relative py-20 lg:py-24 overflow-hidden bg-white">
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6B9B5F]/5 rounded-full blur-3xl -z-10" />
  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl -z-10" />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16 animate-fade-in-up">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 shadow-sm mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B9B5F] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B9B5F]"></span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B9B5F]">Plateforme Duale</span>
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
        Que vous soyez <span className="text-[#6B9B5F]">talent</span> ou <span className="text-[#7C3AED]">recruteur</span>
      </h2>
      <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
        Nous connectons les meilleures opportunités avec les profils les plus qualifiés d&apos;Afrique de l&apos;Ouest.
      </p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      {/* CANDIDATE PANEL */}
      <div className="group relative bg-white border border-gray-100 rounded-3xl p-8 lg:p-12 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-[#6B9B5F]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Vous êtes candidat ?</h3>
          </div>
          <p className="text-gray-600 mb-10 leading-relaxed">
            Propulsez votre carrière avec des outils intelligents conçus pour vous démarquer sur le marché du travail ivoirien et régional.
          </p>
          <ul className="space-y-6 mb-12">
            {[
              { title: "Matching IA personnalisé", desc: "Recevez uniquement les offres qui correspondent à vos compétences réelles.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
              { title: "CV Builder professionnel", desc: "Générez un CV optimisé pour les ATS des plus grandes entreprises.", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { title: "Alertes emploi temps réel", desc: "Soyez le premier informé dès qu'une opportunité correspond à vos critères.", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
              { title: "Accompagnement carrière", desc: "Conseils d'experts et ressources pour réussir vos entretiens.", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }
            ].map((item, idx) => (
              <li key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6B9B5F]/10 flex items-center justify-center mt-1">
                  <svg className="w-3.5 h-3.5 text-[#6B9B5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/signup" className="w-full inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl">
          Trouver mon emploi
          <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
      {/* EMPLOYER PANEL */}
      <div className="group relative bg-[#F0F7EE] border border-green-100 rounded-3xl p-8 lg:p-12 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="58" stroke="#6B9B5F" strokeWidth="4" strokeDasharray="8 8" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#6B9B5F] shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Vous recrutez ?</h3>
          </div>
          <p className="text-gray-600 mb-10 leading-relaxed">
            Simplifiez vos recrutements avec une technologie de pointe et accédez aux meilleurs profils qualifiés de la sous-région.
          </p>
          <ul className="space-y-6 mb-12">
            {[
              { title: "Accès à 50 000+ candidats", desc: "Une base de données qualifiée et mise à jour quotidiennement.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
              { title: "ATS intégré et automatisé", desc: "Gérez vos candidatures sans effort de la sélection à l'onboarding.", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
              { title: "Matching automatique 94%", desc: "Précision de filtrage IA pour ne rencontrer que les profils pertinents.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { title: "Support dédié & onboarding", desc: "Un account manager dédié pour vous accompagner dans vos recherches.", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" }
            ].map((item, idx) => (
              <li key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6B9B5F]/20 flex items-center justify-center mt-1">
                  <svg className="w-3.5 h-3.5 text-[#6B9B5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/signup" className="relative z-10 w-full inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl">
          Publier une offre
          <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  </div>
</section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section id="how-it-works" className="py-24 lg:py-40 bg-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-[#6B9B5F]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-[#7C3AED]/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll className="text-center mb-24 lg:mb-32">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 shadow-sm text-sm font-semibold text-[#6B9B5F] mb-8">
              <IconSparkles className="w-4 h-4" />
              PARCOURS CANDIDAT
            </div>
            <h2 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
              Votre carrière propulsée par <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B9B5F] to-[#93C587] animate-shimmer" style={{ backgroundSize: '200% auto' }}>l&apos;IA</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Une expérience fluide conçue pour les talents d&apos;Afrique. Connectez-vous aux leaders du marché en 3 étapes clés.
            </p>
          </AnimateOnScroll>

          {/* Timeline ZigZag Layout */}
          <div className="relative space-y-24 lg:space-y-48">
            {/* Desktop Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 hidden lg:block -translate-x-1/2" />

            {/* Step 1: Left Text, Right Mockup */}
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <AnimateOnScroll className="order-2 lg:order-1 relative">
                <span className="absolute -top-20 -left-10 text-[12rem] font-black text-gray-100/50 select-none pointer-events-none z-0">01</span>
                <div className="relative z-10 lg:pr-12">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-green-100 flex items-center justify-center text-[#6B9B5F] mb-8 border border-gray-50">
                    <IconUser className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">Créez votre profil intelligent</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Importez votre CV en un clic. Notre IA analyse votre parcours et extrait automatiquement vos expertises pour construire un profil valorisé par les recruteurs.
                  </p>
                  <ul className="space-y-4">
                    {['Analyse sémantique de CV', 'Extraction auto-compétences', 'Score de visibilité'].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6B9B5F]" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={200} className="order-1 lg:order-2">
                <div className="relative p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl animate-float">
                  <div className="flex items-center gap-4 mb-8">
                    <img src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80" className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white" alt="Profile" loading="lazy" />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Fatou Diop</h4>
                      <p className="text-sm text-gray-500">Fullstack Developer — Dakar</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-[#6B9B5F] uppercase mb-2">
                        <span>Complétion Profil</span>
                        <span>85%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#6B9B5F] to-[#93C587] rounded-full w-[85%] transition-all duration-1000" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['React.js', 'UI/UX', 'Python', 'NestJS', 'PostgreSQL'].map(t => (
                        <span key={t} className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-600">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            {/* Step 2: Right Text, Left Mockup */}
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <AnimateOnScroll delay={200} className="order-1">
                <div className="relative p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl lg:-ml-8">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-400">Matchs suggérés par l&apos;IA</span>
                    <div className="px-3 py-1 rounded-full bg-purple-50 text-[10px] font-black text-[#7C3AED] uppercase tracking-wider">Temps Réel</div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { n: "Orange Côte d'Ivoire", s: 94, loc: 'Abidjan', color: '#FF6600' },
                      { n: 'Ecobank Group', s: 89, loc: 'Lomé', color: '#003DA5' },
                      { n: 'MTN Sénégal', s: 85, loc: 'Dakar', color: '#FFCC00' },
                    ].map((m, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-[#7C3AED]/30 transition-colors group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0" style={{ backgroundColor: m.color }}>{m.n[0]}</div>
                        <div className="flex-1">
                          <span className="text-sm font-bold text-gray-900 block group-hover:text-[#7C3AED] transition-colors">{m.n}</span>
                          <span className="text-[11px] text-gray-500 font-medium">{m.loc}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-[#7C3AED]">{m.s}%</span>
                          <span className="block text-[9px] font-bold text-gray-400 uppercase">Match IA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll className="order-2 relative">
                <span className="absolute -top-20 lg:-right-10 text-[12rem] font-black text-gray-100/50 select-none pointer-events-none z-0">02</span>
                <div className="relative z-10 lg:pl-12">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-purple-100 flex items-center justify-center text-[#7C3AED] mb-8 border border-gray-50">
                    <IconSparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">L&apos;IA trouve vos opportunités</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Oubliez la recherche manuelle. Notre algorithme croise vos compétences avec des milliers d&apos;offres pour vous proposer les postes où vous avez le plus de chances de réussir.
                  </p>
                  <ul className="space-y-4">
                    {['Matching prédictif multicritères', 'Alertes intelligentes 24/7', 'Analyses de marché locales'].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateOnScroll>
            </div>

            {/* Step 3: Left Text, Right Mockup */}
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <AnimateOnScroll className="order-2 lg:order-1 relative">
                <span className="absolute -top-20 -left-10 text-[12rem] font-black text-gray-100/50 select-none pointer-events-none z-0">03</span>
                <div className="relative z-10 lg:pr-12">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-amber-100 flex items-center justify-center text-[#F59E0B] mb-8 border border-gray-50">
                    <IconSend className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">Décrochez votre futur poste</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Gérez vos candidatures, échangez directement avec les RH et planifiez vos entretiens depuis votre tableau de bord unifié.
                  </p>
                  <ul className="space-y-4">
                    {["Messagerie instantanée pro", "Suivi de candidature live", "Gestionnaire d'entretiens"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={200} className="order-1 lg:order-2">
                <div className="relative p-10 rounded-[2.5rem] bg-gray-900 shadow-2xl border border-gray-800 animate-float delay-150">
                  <div className="flex items-center gap-4 mb-10 pb-8 border-b border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-[#6B9B5F] flex items-center justify-center text-white shrink-0">
                      <IconCalendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Entretien Confirmé</h4>
                      <p className="text-xs font-semibold text-green-400 uppercase tracking-widest">Étape Finale</p>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#FF6600] flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0">O</div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-white mb-1">Orange Côte d&apos;Ivoire</div>
                        <div className="text-sm text-gray-400 font-medium">Mardi 25 Mars — 14h00</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Mode</div>
                        <div className="text-sm font-bold text-white">Visioconférence</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#6B9B5F]/20 border border-[#6B9B5F]/30 text-center">
                        <div className="text-[10px] font-bold text-[#6B9B5F] uppercase mb-1">Status</div>
                        <div className="text-sm font-bold text-white">Validé</div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>

          {/* Elegant Dark CTA Banner */}
          <AnimateOnScroll delay={400} className="mt-40">
            <div className="relative p-12 sm:p-24 rounded-[4rem] bg-[#0A0C10] overflow-hidden border border-white/5 shadow-2xl">
              {/* Refined Dark Gradients */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6B9B5F]/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7C3AED]/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <h3 className="text-4xl sm:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
                  Prêt à changer de <span className="text-[#6B9B5F]">dimension</span> ?
                </h3>
                <p className="text-gray-400 text-xl mb-14 max-w-2xl mx-auto leading-relaxed">
                  Rejoignez la nouvelle élite technologique en Afrique. Votre prochaine opportunité est déjà là.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <a href="/signup" className="group px-10 py-5 bg-[#6B9B5F] hover:bg-[#5A8A4E] text-white font-bold text-lg rounded-2xl transition-all hover:scale-105 shadow-xl shadow-green-900/20 flex items-center justify-center gap-3">
                    Lancer ma recherche gratuite
                    <IconSend className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="/signin" className="px-10 py-5 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all text-center backdrop-blur-md">
                    Se connecter
                  </a>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
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

      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <section id="faq" className="py-20 bg-gray-50/50 overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <AnimateOnScroll>
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-[#6B9B5F] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[#6B9B5F]">
            Questions fréquentes
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-sans tracking-tight">
          Tout ce que vous devez savoir
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Retrouvez les réponses aux questions les plus courantes pour démarrer sereinement sur INTOWORK.
        </p>
      </div>
    </AnimateOnScroll>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[
        {
          q: "Comment fonctionne le matching IA ?",
          a: "Notre algorithme analyse en profondeur les compétences, l'expérience et les aspirations de chaque candidat pour les mettre en relation avec les offres les plus pertinentes. Le taux de précision atteint 94%."
        },
        {
          q: "Est-ce gratuit pour les candidats ?",
          a: "Oui, l'inscription, la création de profil et la candidature aux offres sont entièrement gratuites pour les candidats. Les fonctionnalités avancées sont disponibles dans notre offre Pro."
        },
        {
          q: "Dans quels pays êtes-vous présents ?",
          a: "INTOWORK est disponible dans 15 pays d'Afrique de l'Ouest et centrale : Côte d'Ivoire, Sénégal, Cameroun, Mali, Burkina Faso, Guinée, Togo, Bénin, Niger, et bien d'autres."
        },
        {
          q: "Comment publier une offre d'emploi ?",
          a: "Créez un compte employeur, complétez le profil de votre entreprise et cliquez sur 'Publier une offre'. Notre IA vous guidera pour optimiser votre annonce et maximiser les candidatures qualifiées."
        },
        {
          q: "Combien de temps pour recevoir des candidatures ?",
          a: "En moyenne, les employeurs reçoivent leurs premières candidatures qualifiées dans les 48h suivant la publication d&apos;une offre grâce au matching IA en temps réel."
        },
        {
          q: "Mes données sont-elles protégées ?",
          a: "Absolument. INTOWORK est conforme RGPD et aux réglementations CEDEAO. Vos données sont chiffrées, stockées en sécurité et ne sont jamais revendues à des tiers."
        }
      ].map((faq, index) => (
        <AnimateOnScroll key={index} delay={index * 100}>
          <div
            className={`group border border-gray-100 rounded-2xl bg-white transition-all duration-300 ${
              openFaq === index ? 'shadow-lg border-green-100 ring-1 ring-green-50' : 'shadow-sm hover:shadow-md'
            }`}
          >
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="w-full text-left p-6 flex items-start justify-between gap-4 focus:outline-none"
            >
              <span className={`text-lg font-semibold transition-colors duration-200 ${
                openFaq === index ? 'text-[#6B9B5F]' : 'text-gray-900'
              }`}>
                {faq.q}
              </span>
              <span className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                openFaq === index ? 'bg-[#6B9B5F] text-white rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
              }`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openFaq === index ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50/50 pt-4">
                {faq.a}
              </div>
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
                  className="h-28 w-auto brightness-0 invert"
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
