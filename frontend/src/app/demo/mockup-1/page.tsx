'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Offres', href: '/offres' },
  { label: 'Entreprises', href: '/entreprises' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'À propos', href: '#about' },
];

const PARTNERS = [
  { name: 'Orange', color: '#FF6600', bg: '#FFF3EC' },
  { name: 'Ecobank', color: '#003DA5', bg: '#EEF2FB' },
  { name: 'Total', color: '#C8102E', bg: '#FEF0F2' },
  { name: 'MTN', color: '#FFCB00', bg: '#FFFBEA' },
  { name: 'Bolloré', color: '#1B2B5B', bg: '#ECEEF5' },
  { name: 'Canal+', color: '#000000', bg: '#F3F3F3' },
  { name: 'Société Générale', color: '#E2001A', bg: '#FEF0F2' },
  { name: 'NSIA', color: '#005BAB', bg: '#EEF3FB' },
];

const FEATURES = [
  {
    badge: 'Intelligence Artificielle',
    title: 'Matching IA à 94% de précision',
    description:
      "Notre algorithme analyse plus de 50 critères pour connecter les meilleurs talents aux opportunités qui correspondent vraiment à leur profil et leurs aspirations.",
    highlights: [
      'Analyse sémantique du CV et des offres',
      'Score de compatibilité en temps réel',
      'Suggestions personnalisées quotidiennes',
    ],
    side: 'left',
    mockup: 'matching',
  },
  {
    badge: 'Recrutement',
    title: 'Pipeline de recrutement visuel',
    description:
      "Gérez toutes vos candidatures dans un tableau de bord intuitif. Suivez chaque candidat de la candidature à l'embauche en quelques clics.",
    highlights: [
      'Kanban board par étape de recrutement',
      'Filtres avancés et recherche instantanée',
      'Collaboration en équipe RH en temps réel',
    ],
    side: 'right',
    mockup: 'pipeline',
  },
  {
    badge: 'Communication',
    title: 'Messagerie intégrée sécurisée',
    description:
      'Communiquez directement avec les candidats sans quitter la plateforme. Planifiez des entretiens, envoyez des offres et gardez un historique complet.',
    highlights: [
      'Messagerie chiffrée de bout en bout',
      'Planification automatique des entretiens',
      "Modèles d'emails personnalisables",
    ],
    side: 'left',
    mockup: 'messaging',
  },
];

const SUCCESS_STORIES = [
  {
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    name: 'Kofi Mensah',
    role: 'Développeur Senior Full Stack',
    company: 'Orange Digital Center',
    duration: 'Trouvé en 2 semaines',
    quote: "J'ai reçu 8 propositions en une semaine. INTOWORK m'a mis en contact avec exactement le type d'entreprise que je cherchais.",
    location: 'Abidjan, Côte d'Ivoire',
  },
  {
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    name: 'Aïcha Traoré',
    role: 'Marketing Manager',
    company: 'Ecobank Sénégal',
    duration: 'Trouvé en 3 semaines',
    quote: "La qualité des offres sur INTOWORK est incomparable. Mon profil a été vu par 47 recruteurs la première semaine.",
    location: 'Dakar, Sénégal',
  },
  {
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
    name: 'Jean-Paul Bamba',
    role: 'Directeur des Ressources Humaines',
    company: 'Total Cameroun',
    duration: 'Trouvé en 1 semaine',
    quote: "En tant que DRH, j'utilise aussi INTOWORK pour recruter. La plateforme est exceptionnelle des deux côtés.",
    location: 'Douala, Cameroun',
  },
];

const SECURITY_ITEMS = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Conforme RGPD',
    description: 'Protection complète des données personnelles selon les standards européens et africains.',
    color: '#6B9B5F',
    bg: '#F0F7EE',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Chiffrement SSL 256-bit',
    description: 'Toutes les communications et données sont chiffrées avec les standards bancaires.',
    color: '#003DA5',
    bg: '#EEF2FB',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Certifié SOC 2 Type II',
    description: "Audit indépendant annuel de nos systèmes de sécurité et de confidentialité.",
    color: '#7C3AED',
    bg: '#F5F0FF',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'SLA 99.9% de disponibilité',
    description: "Infrastructure redondante garantissant une disponibilité maximale pour vos recrutements.",
    color: '#F59E0B',
    bg: '#FFFBEA',
  },
];

const FEATURED_JOBS = [
  {
    title: 'Directeur Financier',
    company: 'Ecobank CI',
    location: 'Abidjan',
    type: 'CDI',
    salary: '3 500 000 – 4 500 000 FCFA',
    logo: 'EB',
    logoColor: '#003DA5',
    logoBg: '#EEF2FB',
    tags: ['Finance', 'Management', 'Senior'],
    posted: 'Il y a 2 heures',
  },
  {
    title: 'Lead Developer React',
    company: 'Orange Digital',
    location: 'Dakar',
    type: 'CDI',
    salary: '2 000 000 – 2 800 000 FCFA',
    logo: 'OR',
    logoColor: '#FF6600',
    logoBg: '#FFF3EC',
    tags: ['React', 'TypeScript', 'Remote'],
    posted: 'Il y a 5 heures',
  },
  {
    title: 'Responsable Marketing Digital',
    company: 'Total Énergies',
    location: 'Douala',
    type: 'CDI',
    salary: '1 800 000 – 2 400 000 FCFA',
    logo: 'TE',
    logoColor: '#C8102E',
    logoBg: '#FEF0F2',
    tags: ['Marketing', 'Digital', 'B2B'],
    posted: 'Il y a 1 jour',
  },
  {
    title: 'Ingénieur Télécoms Senior',
    company: 'MTN Cameroun',
    location: 'Yaoundé',
    type: 'CDI',
    salary: '2 200 000 – 3 000 000 FCFA',
    logo: 'MT',
    logoColor: '#FFCB00',
    logoBg: '#FFFBEA',
    tags: ['Télécoms', '5G', 'Infrastructure'],
    posted: 'Il y a 2 jours',
  },
];

const TESTIMONIALS = [
  {
    photo: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80',
    name: 'Aminata Diallo',
    role: 'DRH',
    company: 'Orange Côte d'Ivoire',
    quote: "INTOWORK a révolutionné notre processus de recrutement. Nous trouvons des profils de qualité en 3x moins de temps qu'avant. L'IA de matching est vraiment bluffante.",
    metric: '3x plus rapide',
    metricLabel: 'dans le recrutement',
    stars: 5,
  },
  {
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    name: 'Moussa Keïta',
    role: 'CEO & Fondateur',
    company: 'Ecobank Group',
    quote: "En tant que groupe panafricain, nous avions besoin d'une solution adaptée à nos marchés. INTOWORK comprend les réalités africaines et nous livre des résultats concrets.",
    metric: '200+ recrutements',
    metricLabel: 'en 6 mois',
    stars: 5,
  },
  {
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
    name: 'Fatou Sow',
    role: 'Head of Talent Acquisition',
    company: 'Total Sénégal',
    quote: "La messagerie intégrée et le pipeline kanban ont transformé notre façon de travailler. Notre équipe RH est 40% plus productive depuis qu'on utilise INTOWORK.",
    metric: '40% de productivité',
    metricLabel: 'en plus pour nos RH',
    stars: 5,
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: '',
    description: 'Idéal pour découvrir INTOWORK et poster vos premières offres.',
    highlighted: false,
    features: [
      '3 offres d'emploi actives',
      'Accès au CVthèque basique',
      'Messagerie candidats (50/mois)',
      'Support par email',
      'Tableau de bord simple',
    ],
    cta: 'Commencer gratuitement',
    ctaHref: '/signup',
  },
  {
    name: 'Pro',
    price: '49 900',
    period: 'FCFA / mois',
    description: 'La solution complète pour les équipes RH qui recrutent activement.',
    highlighted: true,
    badge: 'Le plus populaire',
    features: [
      'Offres illimitées',
      'Matching IA prioritaire',
      'CVthèque complète (50 000+ profils)',
      'Pipeline recrutement avancé',
      'Messagerie illimitée',
      'Analytics et rapports',
      'Support prioritaire 24/7',
      'Intégrations ATS',
    ],
    cta: 'Démarrer l'essai gratuit',
    ctaHref: '/signup',
  },
  {
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    description: 'Pour les grands groupes avec des besoins spécifiques et du volume.',
    highlighted: false,
    features: [
      'Tout le plan Pro inclus',
      'SLA garanti 99.9%',
      'Intégrations personnalisées',
      'Account manager dédié',
      'Formation équipe RH',
      'Multi-pays et multi-devises',
      'API complète',
      'Contrat sur mesure',
    ],
    cta: 'Contacter les ventes',
    ctaHref: '/contact',
  },
];

const FOOTER_LINKS = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', href: '#features' },
      { label: 'Tarifs', href: '#pricing' },
      { label: 'Intégrations', href: '#' },
      { label: 'Nouveautés', href: '#' },
      { label: 'Roadmap', href: '#' },
    ],
  },
  {
    title: 'Candidats',
    links: [
      { label: 'Chercher des offres', href: '/offres' },
      { label: 'Créer mon profil', href: '/signup' },
      { label: 'Conseils carrière', href: '#' },
      { label: 'Entreprises qui recrutent', href: '/entreprises' },
    ],
  },
  {
    title: 'Employeurs',
    links: [
      { label: 'Publier une offre', href: '/signup' },
      { label: 'Rechercher des talents', href: '#' },
      { label: 'Solutions Enterprise', href: '#' },
      { label: 'Cas clients', href: '#' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'À propos', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Presse', href: '#' },
      { label: 'Confidentialité', href: '#' },
      { label: 'Conditions d'utilisation', href: '#' },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function CheckIcon({ color = '#6B9B5F' }: { color?: string }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function MatchingMockup() {
  const candidates = [
    { photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', name: 'Kofi A.', match: 97, role: 'Lead Dev' },
    { photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80', name: 'Marc B.', match: 94, role: 'CTO' },
    { photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80', name: 'Nia C.', match: 91, role: 'Dev Senior' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Matching IA</p>
          <p className="text-base font-bold text-gray-900">Lead Dev React — Orange CI</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">IA Active</span>
      </div>
      <div className="space-y-3">
        {candidates.map((c) => (
          <div key={c.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <img src={c.photo} alt={c.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-500">{c.role}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold text-[#6B9B5F]">{c.match}%</p>
              <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                <div className="h-1.5 bg-[#6B9B5F] rounded-full" style={{ width: `${c.match}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-500">127 candidats analysés</p>
        <button className="text-xs font-semibold text-[#6B9B5F] hover:underline">Voir tous →</button>
      </div>
    </div>
  );
}

function PipelineMockup() {
  const stages = [
    { label: 'Candidatures', count: 24, color: '#6B9B5F' },
    { label: 'Entretien RH', count: 8, color: '#7C3AED' },
    { label: 'Test technique', count: 4, color: '#F59E0B' },
    { label: 'Offre envoyée', count: 2, color: '#003DA5' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-base font-bold text-gray-900">Pipeline Recrutement</p>
        <span className="text-xs text-gray-400">Lead Dev React</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {stages.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-2">
            <div className="w-full rounded-xl p-3 text-center" style={{ backgroundColor: s.color + '12' }}>
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.count}</p>
            </div>
            <p className="text-xs text-gray-500 text-center font-medium leading-tight">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          3 nouvelles candidatures aujourd'hui
        </div>
      </div>
    </div>
  );
}

function MessagingMockup() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <img
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
          alt="Candidate"
          className="w-9 h-9 rounded-full object-cover border-2 border-[#6B9B5F]/20"
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">Aïcha Traoré</p>
          <p className="text-xs text-[#6B9B5F]">● En ligne</p>
        </div>
        <div className="ml-auto">
          <span className="px-2 py-0.5 text-xs font-semibold bg-green-50 text-[#6B9B5F] rounded-full border border-green-100">Lead Dev React</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-end">
          <div className="bg-[#6B9B5F] text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
            Bonjour Aïcha, votre profil nous intéresse beaucoup. Êtes-vous disponible pour un entretien ?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-800 text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
            Bonjour ! Absolument, je suis disponible jeudi ou vendredi après-midi. 😊
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-[#6B9B5F] text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
            Parfait ! Jeudi 14h, appel vidéo sur la plateforme ?
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-sm text-gray-400">Écrire un message…</div>
        <button className="w-9 h-9 rounded-xl bg-[#6B9B5F] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function HeroDashboardMockup() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tableau de bord</p>
          <p className="text-sm font-bold text-gray-900">Bonjour, Marie 👋</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#6B9B5F]/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#6B9B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Offres vues', value: '47', color: '#6B9B5F', bg: '#F0F7EE' },
          { label: 'Matchs IA', value: '12', color: '#7C3AED', bg: '#F5F0FF' },
          { label: 'Entretiens', value: '3', color: '#F59E0B', bg: '#FFFBEA' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: stat.bg }}>
            <p className="text-xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Offres recommandées</p>
        {[
          { title: 'Lead Dev React', co: 'Orange CI', match: 97, tag: 'CDI' },
          { title: 'CTO Startup', co: 'NSIA Group', match: 93, tag: 'CDI' },
          { title: 'Architecte Cloud', co: 'MTN', match: 89, tag: 'Remote' },
        ].map((job) => (
          <div key={job.title} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-[#6B9B5F]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#6B9B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{job.title}</p>
              <p className="text-xs text-gray-400">{job.co}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs font-extrabold text-[#6B9B5F]">{job.match}%</span>
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md font-medium">{job.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Mockup1() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`${plusJakartaSans.variable} font-sans antialiased bg-white text-gray-900`}
      style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif' }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out both; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
        .scroll-left-track { animation: scrollLeft 30s linear infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #6B9B5F 0%, #93C587 40%, #6B9B5F 80%);
          background-size: 200% auto;
          animation: shimmer 3s ease-in-out infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#6B9B5F] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-gray-900 tracking-tight">
                INTOWORK
                <span className="text-[#6B9B5F]"> Search</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#6B9B5F] hover:bg-green-50 rounded-lg transition-all duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
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

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-[#6B9B5F] hover:bg-green-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 flex flex-col gap-2 border-t border-gray-100">
                <Link href="/signin" className="px-4 py-2.5 text-center text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:border-[#6B9B5F] hover:text-[#6B9B5F] transition-colors">
                  Connexion
                </Link>
                <Link href="/signup" className="px-4 py-2.5 text-center text-sm font-semibold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-xl transition-colors">
                  Commencer
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-white">
        {/* Background blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#6B9B5F]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#6B9B5F]/4 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: text content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="animate-fade-in-up">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 shadow-sm text-sm font-semibold text-[#6B9B5F]">
                  <span className="w-2 h-2 rounded-full bg-[#6B9B5F] animate-pulse" />
                  Plateforme #1 en Afrique de l'Ouest
                </span>
              </div>

              {/* H1 */}
              <div className="animate-fade-in-up delay-100">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-gray-900">
                  La plateforme de{' '}
                  <br className="hidden sm:block" />
                  recrutement qui{' '}
                  <span className="shimmer-text">comprend l'Afrique</span>
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl animate-fade-in-up delay-200">
                Connectez les meilleurs talents africains aux entreprises qui les attendent. IA de matching à 94%, pipeline intuitif, messagerie intégrée — tout ce dont vous avez besoin pour recruter plus vite, mieux.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
                <Link
                  href="/signup"
                  className="px-8 py-4 text-base font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2"
                >
                  Commencer gratuitement
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/offres"
                  className="px-8 py-4 text-base font-bold text-gray-700 bg-white hover:bg-gray-50 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-[#6B9B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Voir les offres
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-2 animate-fade-in-up delay-400">
                {[
                  { value: '10K+', label: 'Candidats actifs' },
                  { value: '500+', label: 'Entreprises partenaires' },
                  { value: '15+', label: 'Pays couverts' },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-3xl font-extrabold text-[#6B9B5F]">{stat.value}</span>
                    <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating mockup + human photo */}
            <div className="relative flex items-center justify-center animate-fade-in-up delay-500">
              {/* Main dashboard mockup */}
              <div className="animate-float w-full max-w-md">
                <HeroDashboardMockup />
              </div>

              {/* Human element: professional African woman photo */}
              <div className="absolute -bottom-6 -right-4 lg:-right-8 animate-float-slow">
                <div className="relative">
                  <div className="w-32 h-40 lg:w-40 lg:h-52 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=500&q=80"
                      alt="Professionnelle africaine souriante"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  {/* Matching badge overlay */}
                  <div className="absolute -top-3 -left-4 bg-[#6B9B5F] text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-bold whitespace-nowrap">94% de matching</span>
                  </div>
                  {/* Success ping */}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating badge: notifications */}
              <div className="absolute top-0 -left-4 lg:-left-8 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3 animate-float">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Nouveau match!</p>
                  <p className="text-xs text-gray-500">Orange CI • 97% compatibilité</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS PARTENAIRES ───────────────────────────────────────────── */}
      <section className="py-12 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Ils recrutent avec INTOWORK</p>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex scroll-left-track gap-12 items-center" style={{ width: 'max-content' }}>
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex-shrink-0 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0"
                  style={{ backgroundColor: p.bg, color: p.color }}
                >
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200/60 text-sm font-semibold text-[#6B9B5F] mb-4">
              Fonctionnalités
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tout ce qu'il faut pour recruter en Afrique
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des outils puissants conçus pour les réalités des marchés de l'emploi africains.
            </p>
          </div>

          <div className="space-y-24">
            {FEATURES.map((feature, idx) => (
              <div
                key={feature.title}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                  feature.side === 'right' ? 'lg:flex lg:flex-row-reverse' : ''
                }`}
              >
                {/* Text side */}
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200/60 text-xs font-semibold uppercase tracking-wide text-[#6B9B5F]">
                    {feature.badge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">{feature.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                        <CheckIcon />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B9B5F] hover:text-[#5A8A4E] group"
                  >
                    En savoir plus
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>

                {/* Mockup side */}
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    {feature.mockup === 'matching' && <MatchingMockup />}
                    {feature.mockup === 'pipeline' && <PipelineMockup />}
                    {feature.mockup === 'messaging' && <MessagingMockup />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORIES ─────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/60 text-sm font-semibold text-amber-700 mb-4">
              Histoires de succès
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ils ont trouvé leur voie avec INTOWORK
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              De vrais professionnels africains qui ont transformé leur carrière grâce à notre plateforme.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {SUCCESS_STORIES.map((story) => (
              <div
                key={story.name}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Photo + duration badge */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative flex-shrink-0">
                    <img
                      src={story.photo}
                      alt={story.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
                    />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#6B9B5F] rounded-full border-2 border-white flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{story.name}</p>
                    <p className="text-sm text-[#6B9B5F] font-semibold truncate">{story.role}</p>
                    <p className="text-xs text-gray-400 truncate">{story.company}</p>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-sm text-gray-600 leading-relaxed italic flex-1 mb-5">
                  "{story.quote}"
                </blockquote>

                {/* Bottom: duration + location */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#6B9B5F]" />
                    <span className="text-xs font-bold text-[#6B9B5F]">{story.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {story.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200/60 text-sm font-semibold text-[#6B9B5F] mb-4">
              Sécurité & Conformité
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Vos données protégées aux standards internationaux
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              La confiance est au cœur de notre mission. Nous appliquons les standards de sécurité les plus élevés.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECURITY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg p-6 transition-all duration-300 text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ───────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200/60 text-sm font-semibold text-[#6B9B5F] mb-4">
                Offres en vedette
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Les meilleures opportunités du moment
              </h2>
            </div>
            <Link
              href="/offres"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B9B5F] hover:text-[#5A8A4E] whitespace-nowrap group"
            >
              Voir toutes les offres
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_JOBS.map((job) => (
              <Link
                key={job.title}
                href="/offres"
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0"
                    style={{ backgroundColor: job.logoBg, color: job.logoColor }}
                  >
                    {job.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate">{job.company}</p>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight mt-0.5">{job.title}</h3>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Location + type */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {job.location}
                  <span className="mx-1">·</span>
                  <span className="font-semibold text-[#6B9B5F]">{job.type}</span>
                </div>

                {/* Salary */}
                <p className="text-xs font-semibold text-gray-700 mb-4 flex-1">{job.salary}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{job.posted}</span>
                  <span className="text-xs font-semibold text-[#6B9B5F] group-hover:underline">Postuler →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200/60 text-sm font-semibold text-[#6B9B5F] mb-4">
              Témoignages
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des dirigeants RH et recruteurs qui font confiance à INTOWORK pour leurs besoins en talents.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl p-8 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Stars */}
                <StarRating count={t.stars} />

                {/* Quote mark */}
                <div className="text-6xl font-extrabold text-[#6B9B5F]/15 leading-none mt-3 mb-2 select-none">
                  "
                </div>

                {/* Quote text */}
                <blockquote className="text-sm text-gray-600 leading-relaxed flex-1 mb-6">
                  {t.quote}
                </blockquote>

                {/* Metric highlight */}
                <div className="bg-green-50 rounded-xl p-3 mb-6 border border-green-100">
                  <p className="text-lg font-extrabold text-[#6B9B5F]">{t.metric}</p>
                  <p className="text-xs text-gray-500 font-medium">{t.metricLabel}</p>
                </div>

                {/* Author — REAL PHOTO */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#6B9B5F]/20 shadow-sm flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200/60 text-sm font-semibold text-[#6B9B5F] mb-4">
              Tarifs
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Des plans adaptés à votre croissance
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Commencez gratuitement. Évoluez quand vous êtes prêt. Prix en FCFA pour les marchés africains.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  tier.highlighted
                    ? 'bg-[#6B9B5F] text-white shadow-2xl scale-105 ring-4 ring-[#6B9B5F]/30'
                    : 'bg-white border border-gray-200 shadow-sm hover:shadow-lg'
                }`}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-amber-400 text-amber-900 text-xs font-extrabold rounded-full shadow-md whitespace-nowrap">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <h3 className={`text-xl font-bold mb-2 ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  {tier.price === 'Gratuit' || tier.price === 'Sur mesure' ? (
                    <span className={`text-4xl font-extrabold ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {tier.price}
                    </span>
                  ) : (
                    <>
                      <span className={`text-4xl font-extrabold ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                        {tier.price}
                      </span>
                      <span className={`text-sm font-medium ${tier.highlighted ? 'text-green-100' : 'text-gray-500'}`}>
                        {tier.period}
                      </span>
                    </>
                  )}
                </div>
                <p className={`text-sm mb-6 leading-relaxed ${tier.highlighted ? 'text-green-100' : 'text-gray-500'}`}>
                  {tier.description}
                </p>

                <Link
                  href={tier.ctaHref}
                  className={`w-full block text-center py-3.5 px-6 rounded-xl text-sm font-bold transition-all duration-200 mb-8 ${
                    tier.highlighted
                      ? 'bg-white text-[#6B9B5F] hover:bg-green-50 shadow-md'
                      : 'bg-[#6B9B5F] text-white hover:bg-[#5A8A4E] shadow-sm hover:shadow-md'
                  }`}
                >
                  {tier.cta}
                </Link>

                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckIcon color={tier.highlighted ? '#FFFFFF' : '#6B9B5F'} />
                      <span className={`text-sm font-medium ${tier.highlighted ? 'text-green-50' : 'text-gray-600'}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-10">
            Tous les prix sont HT. TVA applicable selon la réglementation locale. 14 jours d'essai gratuit sur les plans payants.
          </p>
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-[#6B9B5F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Prêt à transformer votre recrutement en Afrique?
            </h2>
            <p className="text-lg text-green-100 max-w-xl mx-auto">
              Rejoignez plus de 500 entreprises et 10 000 candidats qui font confiance à INTOWORK. Commencez gratuitement, sans carte bancaire.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="px-10 py-4 text-base font-bold text-[#6B9B5F] bg-white hover:bg-green-50 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/offres"
                className="px-10 py-4 text-base font-bold text-white border-2 border-white/60 hover:border-white hover:bg-white/10 rounded-2xl transition-all duration-200"
              >
                Voir les offres d'emploi
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-8 pt-4">
              {[
                { icon: '✓', text: 'Gratuit pour commencer' },
                { icon: '✓', text: 'Sans carte bancaire' },
                { icon: '✓', text: '14 jours d'essai Pro' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-green-100 text-sm font-medium">
                  <span className="text-green-300 font-bold">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
            {/* Brand column */}
            <div className="col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#6B9B5F] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-lg font-extrabold text-white tracking-tight">
                  INTOWORK <span className="text-[#6B9B5F]">Search</span>
                </span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                La plateforme de recrutement conçue pour l'Afrique de l'Ouest francophone.
              </p>
              <div className="flex gap-3">
                {/* Twitter/X */}
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[#6B9B5F] flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[#6B9B5F] flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                {/* WhatsApp */}
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[#6B9B5F] flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold text-sm mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-[#6B9B5F] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} INTOWORK Search. Tous droits réservés. Fait avec ❤️ pour l'Afrique.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Confidentialité</Link>
              <Link href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Conditions</Link>
              <Link href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
