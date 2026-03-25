'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
});

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [emailNewsletter, setEmailNewsletter] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const placeholders = [
    'Développeur Full Stack',
    'Responsable RH',
    'Chef de Projet',
    'Data Analyst',
    'Community Manager',
  ];

  // Typewriter Effect
  useEffect(() => {
    const currentText = placeholders[placeholderIndex];
    if (charIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setSearchPlaceholder((prev) => prev + currentText[charIndex]);
        setCharIndex(charIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCharIndex(0);
        setSearchPlaceholder('');
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, placeholderIndex]);

  // Navbar Scroll Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect if signed in
  useEffect(() => {
    if (isSignedIn) router.push('/dashboard');
  }, [isSignedIn, router]);

  const navLinks = [
    { label: 'Comment ça marche', href: '#how-it-works' },
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Offres', href: '/offres' },
    { label: 'Tarifs', href: '#pricing' },
  ];

  const jobs = [
    {
      title: 'Chef de projet digital',
      company: 'Orange CI',
      location: 'Abidjan',
      type: 'CDI',
      salary: '450k-650k FCFA',
      match: '94%',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    },
    {
      title: 'Développeur Full Stack',
      company: 'Jumia',
      location: 'Dakar',
      type: 'Remote',
      salary: '500k+ FCFA',
      match: '88%',
      logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100&h=100&fit=crop',
    },
    {
      title: 'Data Analyst Expert',
      company: 'Wave',
      location: 'Remote',
      type: 'CDI',
      salary: '800k+ FCFA',
      match: '96%',
      logo: 'https://images.unsplash.com/photo-1599305090748-3663623883d9?w=100&h=100&fit=crop',
    },
    {
      title: 'Responsable Marketing',
      company: 'MTN',
      location: 'Douala',
      type: 'CDI',
      salary: 'À négocier',
      match: '91%',
      logo: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=100&h=100&fit=crop',
    },
  ];

  const partners = [
    'Orange', 'MTN', 'Ecobank', 'Jumia', 'Wave',
    'Bolloré', 'Canal+', 'Total', 'Société Générale', "L'Oréal Afrique", 'PwC', 'Air France',
  ];

  const countries = [
    { code: 'ci', name: "Côte d'Ivoire" }, { code: 'sn', name: 'Sénégal' },
    { code: 'cm', name: 'Cameroun' }, { code: 'ml', name: 'Mali' },
    { code: 'gn', name: 'Guinée' }, { code: 'bf', name: 'Burkina Faso' },
    { code: 'tg', name: 'Togo' }, { code: 'bj', name: 'Bénin' },
    { code: 'ne', name: 'Niger' }, { code: 'ga', name: 'Gabon' },
    { code: 'cg', name: 'Congo' }, { code: 'cd', name: 'RDC' },
    { code: 'ma', name: 'Maroc' }, { code: 'tn', name: 'Tunisie' },
    { code: 'mg', name: 'Madagascar' },
  ];

  const testimonials = [
    {
      name: 'Aminata Diallo', role: 'DRH Orange CI',
      quote: "INTOWORK a réduit notre temps de recrutement de 60% tout en améliorant la qualité des profils.",
      stat: '-60% temps', img: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=200&h=200&fit=crop',
    },
    {
      name: 'Moussa Keita', role: 'Talent Acquisition, Ecobank',
      quote: "92% des candidats proposés sont validés en entretien. Un outil remarquable pour nos équipes.",
      stat: '92% validation', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    },
    {
      name: 'Fatou Sow', role: 'Placée chez Total Energies',
      quote: "Mon poste idéal en seulement 2 semaines. Les offres sont vraiment adaptées à mon profil.",
      stat: '2 semaines', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter', price: 'Gratuit', period: '', desc: 'Pour découvrir la plateforme',
      features: ['5 candidatures/mois', '1 offre active', 'Matching IA basique', 'Support email'],
      cta: 'Commencer gratuitement', href: '/signup', highlighted: false,
    },
    {
      name: 'Pro', price: '49 900 FCFA', period: '/mois', desc: 'Pour les PME en croissance',
      features: ['Candidatures illimitées', '25 offres actives', 'Matching IA 94%', 'Dashboard analytique', 'Support prioritaire', 'API'],
      cta: 'Essai 14 jours gratuit', href: '/signup?plan=pro', highlighted: true,
    },
    {
      name: 'Enterprise', price: 'Sur mesure', period: '', desc: 'Pour les grandes organisations',
      features: ['Offres illimitées', 'ATS complet', 'SSO', 'SLA 99.9%', 'Account manager dédié'],
      cta: 'Contacter les ventes', href: '/contact', highlighted: false,
    },
  ];

  const securityItems = [
    { label: 'RGPD', val: 'Conforme', desc: 'Protection des données' },
    { label: 'Chiffrement SSL', val: 'TLS 1.3', desc: 'Sécurité maximale' },
    { label: 'SOC 2', val: 'Type II', desc: 'Audit de sécurité' },
    { label: 'SLA', val: '99.9%', desc: 'Garantie de service' },
  ];

  const howItWorks = [
    { num: '1', title: 'Créez votre profil', desc: "Importez votre CV en un clic. Notre IA analyse vos compétences et votre expérience instantanément." },
    { num: '2', title: 'Analyse intelligente', desc: "Notre algorithme matche votre profil avec les besoins réels du marché en Afrique de l'Ouest." },
    { num: '3', title: 'Postulez & Réussissez', desc: "Recevez des offres sur mesure et postulez en un clic. Suivez votre progression en temps réel." },
  ];

  const footerCols = [
    { title: 'Produit', links: ["Offres d'emploi", 'Pour les entreprises', 'Tarifs', 'Partenaires'] },
    { title: 'Entreprise', links: ['À propos', 'Blog', 'Carrières', 'Contact'] },
    { title: 'Ressources', links: ['Guide CV', 'Aide', 'Sécurité', 'IA Matching'] },
    { title: 'Légal', links: ['Confidentialité', 'Conditions', 'Cookies', 'Mentions légales'] },
  ];

  const productFeatures = [
    {
      id: 'matching-ia',
      badge: 'Matching IA',
      title: "L'intelligence artificielle au service de votre carrière",
      description: "Notre algorithme propriétaire analyse en profondeur votre profil et vos compétences pour vous proposer uniquement les opportunités les plus pertinentes en Afrique de l'Ouest.",
      benefits: ['Analyse sémantique des compétences', 'Score de compatibilité dynamique', 'Recommandations personnalisées quotidiennes'],
      reverse: false,
      visual: (
        <div className="w-full max-w-[320px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:-translate-y-2 transition-transform duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-[#7C3AED]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div><p className="text-sm font-bold text-gray-900">Score Matching</p><p className="text-xs text-gray-400">Analyse IA…</p></div>
            </div>
            <span className="text-2xl font-extrabold text-[#6B9B5F]">94%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-4"><div className="h-full bg-[#6B9B5F] rounded-full w-[94%]" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-purple-50 border border-purple-100 text-[10px] font-medium text-[#7C3AED]">Expertise Cloud</div>
            <div className="p-2 rounded-lg bg-green-50 border border-green-100 text-[10px] font-medium text-[#6B9B5F]">Leadership</div>
          </div>
        </div>
      ),
    },
    {
      id: 'cv-builder',
      badge: 'CV Builder',
      title: 'Créez un CV professionnel optimisé pour les ATS',
      description: "Ne laissez plus les robots écarter votre candidature. Utilisez nos templates pré-approuvés par les recruteurs et optimisés pour les systèmes de lecture automatique.",
      benefits: ['Templates modernes et épurés', 'Optimisation automatique des mots-clés', 'Export PDF haute qualité en 1 clic'],
      reverse: true,
      visual: (
        <div className="w-full max-w-[300px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:scale-105 transition-transform duration-500">
          <div className="h-3 bg-[#6B9B5F] w-full" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full bg-gray-100" />
              <div className="space-y-1.5 flex-1"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-2 bg-gray-100 rounded w-1/2" /></div>
            </div>
            <div className="space-y-2"><div className="h-2 bg-gray-100 rounded w-full" /><div className="h-2 bg-gray-100 rounded w-full" /><div className="h-2 bg-gray-100 rounded w-2/3" /></div>
            <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
              <span className="text-[10px] text-[#6B9B5F] font-bold uppercase tracking-wider">ATS Ready ✓</span>
              <div className="px-3 py-1 bg-[#6B9B5F] text-white text-[10px] rounded-lg font-bold">Template 01</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'job-alerts',
      badge: 'Alertes Emploi',
      title: 'Soyez le premier informé des nouvelles opportunités',
      description: 'Paramétrez vos préférences une seule fois et recevez des notifications instantanées dès qu\'un poste correspondant à vos critères est publié.',
      benefits: ['Alertes WhatsApp, Email et Push', 'Filtres ultra-précis par ville et salaire', 'Réactivité maximale face au marché'],
      reverse: false,
      visual: (
        <div className="space-y-3 w-full max-w-[340px]">
          {[1, 2].map((i) => (
            <div key={i} className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-all ${i === 1 ? 'translate-x-4' : '-translate-x-4'}`}>
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#F59E0B] shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1"><span className="text-xs font-bold text-gray-900">Nouvelle offre disponible</span><span className="text-[10px] text-gray-400">À l&apos;instant</span></div>
                <p className="text-xs text-gray-600">Expert Comptable Senior — Abidjan, CI</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'analytics',
      badge: 'Dashboard Analytique',
      title: 'Pilotez vos candidatures comme un pro',
      description: 'Suivez l\'état de chaque dossier, voyez qui consulte votre profil et obtenez des statistiques précises sur l\'impact de vos candidatures.',
      benefits: ['Pipeline de candidatures visuel', 'Statistiques de vues du profil', 'Historique complet des interactions'],
      reverse: true,
      visual: (
        <div className="w-full max-w-[340px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:-rotate-1 transition-transform duration-500">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-red-400" /><div className="w-2 h-2 rounded-full bg-amber-400" /><div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[{ label: 'Postulé', val: '12', color: 'bg-blue-50 text-blue-600' }, { label: 'Entretiens', val: '04', color: 'bg-[#F0F7EE] text-[#6B9B5F]' }, { label: 'Refusé', val: '02', color: 'bg-gray-50 text-gray-500' }].map((s, i) => (
              <div key={i} className={`${s.color} p-3 rounded-2xl text-center`}><p className="text-lg font-extrabold">{s.val}</p><p className="text-[9px] font-bold uppercase tracking-tight">{s.label}</p></div>
            ))}
          </div>
          <div className="space-y-2"><div className="h-8 bg-gray-50 rounded-xl w-full" /><div className="h-8 bg-gray-50 rounded-xl w-[85%]" /></div>
        </div>
      ),
    },
  ];

  const faqData = [
    { question: 'Comment fonctionne le matching IA ?', answer: "Notre algorithme analyse en temps réel les compétences techniques, les expériences passées et les aspirations de carrière pour établir un score de compatibilité précis entre les profils et les opportunités disponibles sur INTOWORK." },
    { question: 'Est-ce gratuit pour les candidats ?', answer: "L'utilisation de la plateforme est entièrement gratuite pour tous les candidats. Vous pouvez créer votre profil, importer vos documents et postuler aux offres sans aucun frais." },
    { question: 'Quels pays sont couverts ?', answer: "INTOWORK couvre 15 pays d'Afrique francophone : Côte d'Ivoire, Sénégal, Cameroun, Mali, Guinée, Burkina Faso, Togo, Bénin, Niger, Gabon, Congo, RDC, Maroc, Tunisie et Madagascar." },
    { question: 'Comment importer mon CV ?', answer: "Depuis votre tableau de bord, importez votre CV au format PDF ou Word. Notre système d'extraction automatique remplira les champs principaux de votre profil instantanément." },
    { question: 'Comment les entreprises accèdent-elles aux profils ?', answer: "Les entreprises partenaires disposent d'un accès sécurisé où elles visualisent uniquement les profils recommandés par l'IA et correspondant à leurs offres actives." },
    { question: 'Mes données sont-elles sécurisées ?', answer: "Oui. Nous sommes conformes au RGPD, utilisons un chiffrement TLS 1.3 et sommes certifiés SOC 2 Type II. Vous gardez à tout moment le contrôle total sur la visibilité de votre profil." },
  ];

  return (
    <div className={`min-h-screen bg-white text-gray-900 selection:bg-[#6B9B5F]/30 ${plusJakarta.variable} font-[family-name:var(--font-plus-jakarta)] antialiased`}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
          @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
          .animate-shimmer { background-size: 200% auto; animation: shimmer 4s linear infinite; }
          .animate-scroll-left { animation: scroll-left 30s linear infinite; }
          .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `
      }} />

      {/* ─── NAVBAR ─────────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100 py-3'
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#6B9B5F] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tighter text-gray-900">INTOWORK</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-sm font-semibold text-gray-600 hover:text-[#6B9B5F] transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/signin" className="hidden sm:block text-sm font-bold text-gray-700 hover:text-[#6B9B5F] px-4 py-2 transition-colors">
              Se connecter
            </Link>
            <Link href="/signup?role=employer" className="px-5 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-all shadow-sm">
              Publier une offre
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-white via-green-50/40 to-white">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-[700px] h-[700px] bg-[#6B9B5F]/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-[#7C3AED]/5 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="animate-fadeInUp">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 text-sm font-semibold text-[#6B9B5F] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B9B5F] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B9B5F]" />
              </span>
              N°1 du recrutement IA en Afrique de l&apos;Ouest
            </div>

            {/* H1 */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6">
              L&apos;emploi en Afrique,<br />
              <span className="animate-shimmer bg-gradient-to-r from-[#6B9B5F] via-[#93C587] to-[#6B9B5F] bg-clip-text text-transparent">
                révolutionné par l&apos;IA.
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              Trouvez les meilleures opportunités en Côte d&apos;Ivoire, au Sénégal et dans toute l&apos;Afrique de l&apos;Ouest.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-5xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
            <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-green-900/5 border border-gray-100 flex flex-col md:flex-row items-center gap-2">
              {/* Field: Métier */}
              <div className="flex-1 w-full flex items-center px-5 py-3">
                <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={searchPlaceholder || 'Quel métier cherchez-vous ?'}
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-900 font-medium placeholder:text-gray-400 text-sm"
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-gray-100 shrink-0" />
              {/* Field: Localisation */}
              <div className="flex-1 w-full flex items-center px-5 py-3">
                <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Abidjan, Dakar, Remote..."
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-900 font-medium placeholder:text-gray-400 text-sm"
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-gray-100 shrink-0" />
              {/* Field: Contrat */}
              <div className="flex-1 w-full flex items-center px-5 py-3">
                <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <select className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-700 font-medium appearance-none text-sm cursor-pointer">
                  <option>Tous types</option>
                  <option>CDI</option>
                  <option>CDD</option>
                  <option>Stage</option>
                  <option>Freelance</option>
                </select>
              </div>
              {/* CTA */}
              <Link
                href="/offres"
                className="w-full md:w-auto px-8 py-4 font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-3xl shadow-lg shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                Trouver mon emploi
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {/* Hero Stats */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { val: '12 000+', label: 'Candidats' },
                { val: '800+', label: 'Entreprises' },
                { val: '94%', label: 'Matching IA' },
                { val: '15', label: 'Pays' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-extrabold text-gray-900">{s.val}</div>
                  <div className="text-sm font-medium text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PARTNERS TICKER ─────────────────────────────────────── */}
      <div className="py-10 border-y border-gray-100 bg-white overflow-hidden">
        <div className="flex animate-scroll-left whitespace-nowrap">
          {[...partners, ...partners].map((p, i) => (
            <span key={i} className="mx-12 text-lg font-black text-gray-300 hover:text-gray-400 transition-colors cursor-default select-none">
              {p.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* ─── FEATURED OFFERS ─────────────────────────────────────── */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Dernières opportunités</h2>
              <p className="text-gray-600 text-lg">Les entreprises qui recrutent maintenant via notre algorithme.</p>
            </div>
            <Link href="/offres" className="group inline-flex items-center gap-2 font-bold text-[#6B9B5F] hover:underline underline-offset-4 shrink-0">
              Voir les 1 450+ offres
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job, i) => (
              <div key={i} className="group border border-gray-100 rounded-3xl p-6 bg-white hover:shadow-xl hover:border-[#6B9B5F]/20 transition-all duration-300 flex items-start gap-5">
                <img src={job.logo} alt={job.company} className="w-16 h-16 rounded-2xl object-cover bg-gray-50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-[#6B9B5F] transition-colors leading-snug">{job.title}</h3>
                      <p className="text-gray-500 font-semibold text-sm">{job.company}</p>
                    </div>
                    <span className="shrink-0 bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 px-3 py-1 rounded-xl text-xs font-extrabold">
                      IA {job.match}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100">{job.location}</span>
                    <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100">{job.type}</span>
                    <span className="px-3 py-1 bg-green-50 text-[#6B9B5F] text-xs font-bold rounded-lg border border-green-100">{job.salary}</span>
                  </div>
                  <button className="w-full py-2.5 bg-gray-50 hover:bg-[#6B9B5F] hover:text-white text-gray-700 text-sm font-bold rounded-2xl transition-all duration-200">
                    Postuler maintenant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SPLIT CANDIDATS / EMPLOYEURS ────────────────────────── */}
      <section className="grid md:grid-cols-2">
        <div className="bg-[#F0F7EE] px-8 py-20 lg:px-24 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-[#6B9B5F] mb-6 shadow-sm w-fit">
            POUR LES CANDIDATS
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-5 leading-tight">Boostez votre carrière avec l&apos;IA</h2>
          <p className="text-lg text-gray-700 mb-10 max-w-md leading-relaxed">
            Créez votre profil en 5 min, notre IA vous connecte aux meilleures entreprises sans aucune recherche manuelle.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-2xl shadow-lg shadow-green-900/10 transition-all w-fit">
            Je cherche un emploi
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
        <div className="bg-gray-50 px-8 py-20 lg:px-24 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-600 mb-6 shadow-sm w-fit">
            POUR LES EMPLOYEURS
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-5 leading-tight">Recrutez les meilleurs talents</h2>
          <p className="text-lg text-gray-700 mb-10 max-w-md leading-relaxed">
            Matching intelligent, pool qualifié, et gain de temps de 60% sur vos processus de sélection.
          </p>
          <Link href="/signup?role=employer" className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white bg-gray-900 hover:bg-black rounded-2xl shadow-lg shadow-gray-900/10 transition-all w-fit">
            Je recrute
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ─── PRODUCT FEATURES ────────────────────────────────────── */}
      <section id="features" className="py-24 lg:py-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 shadow-sm text-sm font-semibold text-[#6B9B5F] mb-6">
              Découvrez la plateforme
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Tout ce dont vous avez besoin pour <span className="text-[#6B9B5F]">réussir</span>
            </h2>
          </div>
          <div className="space-y-32">
            {productFeatures.map((feature) => (
              <div key={feature.id} className={`flex flex-col gap-12 lg:gap-24 lg:items-center ${feature.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                <div className="flex-1 space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50/50 border border-green-100 text-xs font-bold uppercase tracking-widest text-[#6B9B5F]">
                    {feature.badge}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{feature.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                  <ul className="space-y-4">
                    {feature.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-3 group">
                        <div className="w-2 h-2 rounded-full bg-[#6B9B5F] group-hover:scale-125 transition-transform" />
                        <span className="text-gray-900 font-medium">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#6B9B5F]/5 rounded-full blur-3xl -z-10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#7C3AED]/5 rounded-full blur-2xl -z-10 translate-x-12 translate-y-12" />
                  <div className="relative z-10 min-h-[300px] flex items-center justify-center">
                    {feature.visual}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Comment ça marche</h2>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">Une technologie de pointe pour un recrutement simplifié et humain.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                <span className="text-9xl font-black text-gray-50 absolute -top-8 -left-4 select-none pointer-events-none z-0">
                  {step.num}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#6B9B5F]/10 rounded-xl flex items-center justify-center mb-6 text-[#6B9B5F] group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ils nous font confiance</h2>
            <p className="text-gray-600 text-lg">Des résultats concrets pour candidats et recruteurs.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                <div className="flex gap-1 text-amber-400 mb-6">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg italic text-gray-700 leading-relaxed mb-8 flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                  <span className="bg-green-50 text-[#6B9B5F] px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                    {t.stat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tarifs transparents</h2>
            <p className="text-gray-600 text-lg">Choisissez le plan qui correspond à vos besoins.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`rounded-3xl p-10 flex flex-col transition-all ${
                plan.highlighted
                  ? 'bg-white border-2 border-[#6B9B5F] shadow-2xl shadow-green-900/10 relative scale-105 z-10'
                  : 'bg-white border border-gray-100 shadow-sm hover:shadow-xl'
              }`}>
                {plan.highlighted && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1.5 bg-[#6B9B5F] text-white text-xs font-extrabold rounded-full shadow">
                    Le plus populaire
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    {plan.period && <span className={`text-sm font-bold mb-1 ${plan.highlighted ? 'text-[#6B9B5F]' : 'text-gray-500'}`}>{plan.period}</span>}
                  </div>
                  <p className="text-sm text-gray-500">{plan.desc}</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-3 text-sm ${plan.highlighted ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      <svg className="w-5 h-5 text-[#6B9B5F] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full py-4 text-center font-bold rounded-2xl transition-all text-sm ${
                    plan.highlighted
                      ? 'bg-[#6B9B5F] hover:bg-[#5A8A4E] text-white shadow-lg shadow-green-600/20'
                      : 'border-2 border-gray-200 hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ──────────────────────────────────────────── */}
      <section className="bg-[#6B9B5F] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ne manquez aucune opportunité</h2>
            <p className="text-lg text-white/90 mb-10">Recevez les meilleures offres d&apos;emploi en Afrique de l&apos;Ouest directement dans votre boîte mail.</p>
            {!newsletterSuccess ? (
              <form onSubmit={(e) => { e.preventDefault(); setNewsletterSuccess(true); }} className="w-full max-w-md">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email" required placeholder="votre@email.com"
                    value={emailNewsletter} onChange={(e) => setEmailNewsletter(e.target.value)}
                    className="flex-1 px-5 py-4 rounded-2xl bg-white text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-white/50"
                  />
                  <button type="submit" className="px-8 py-4 font-bold text-[#6B9B5F] bg-white hover:bg-gray-100 rounded-2xl transition-all shadow-lg whitespace-nowrap">
                    Recevoir mes alertes
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white/10 border border-white/20 p-8 rounded-3xl w-full max-w-md">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#6B9B5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-white font-bold text-xl mb-1">C&apos;est noté !</p>
                <p className="text-white/80">Vous recevrez bientôt vos premières alertes personnalisées.</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-14 w-full">
              {[
                { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: '15 000 abonnés' },
                { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label: 'Alertes quotidiennes' },
                { icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Désabonnement en 1 clic' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-3 text-white/90">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                  </div>
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECURITY ────────────────────────────────────────────── */}
      <section className="py-16 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-10">
            Sécurité & Conformité
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {securityItems.map((s, i) => (
              <div key={i} className="text-center p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all">
                <div className="text-xs font-bold text-[#6B9B5F] mb-1 uppercase tracking-wide">{s.label}</div>
                <div className="text-xl font-extrabold text-gray-900 mb-1">{s.val}</div>
                <div className="text-xs text-gray-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COUNTRIES ───────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Recrutement dans 15 pays</h2>
          <p className="text-gray-600 mb-12 text-lg">INTOWORK couvre toute l&apos;Afrique francophone.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {countries.map((c) => (
              <div key={c.code} className="group flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-100 rounded-xl hover:border-[#6B9B5F] hover:shadow-md transition-all cursor-default">
                <img src={`https://flagcdn.com/w40/${c.code}.png`} alt={c.name} className="w-6 h-auto rounded-sm shadow-sm" />
                <span className="text-sm font-bold text-gray-700">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Tout ce que vous devez savoir sur la plateforme INTOWORK.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqData.map((item, index) => (
              <div key={index} className={`border border-gray-100 rounded-2xl bg-white transition-all duration-300 ${openFaq === index ? 'shadow-lg border-gray-200' : 'hover:shadow-sm'}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  aria-expanded={openFaq === index}
                >
                  <span className="text-base font-semibold text-gray-900 pr-8">{item.question}</span>
                  <span className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <span className={`absolute w-4 h-0.5 bg-[#6B9B5F] transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                    <span className={`absolute h-4 w-0.5 bg-[#6B9B5F] transition-transform duration-300 ${openFaq === index ? 'rotate-90 opacity-0' : 'rotate-0'}`} />
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 pt-0 text-sm leading-relaxed text-gray-600">{item.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────── */}
      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto rounded-[3rem] bg-gradient-to-r from-[#6B9B5F] to-[#93C587] p-12 lg:p-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tight leading-tight">
              Prêt à transformer<br />votre recrutement ?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto px-10 py-5 bg-white text-[#6B9B5F] font-black rounded-2xl text-lg hover:scale-105 transition-transform shadow-xl">
                Candidat : Créer mon profil
              </Link>
              <Link href="/signup?role=employer" className="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white font-black rounded-2xl text-lg hover:scale-105 transition-transform shadow-xl">
                Employeur : Publier une offre
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#6B9B5F] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg font-black text-gray-900 tracking-tighter">INTOWORK</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed">
                L&apos;IA au service de l&apos;emploi en Afrique de l&apos;Ouest.
              </p>
            </div>

            {/* Cols */}
            {footerCols.map((col) => (
              <div key={col.title}>
                <h4 className="font-black text-gray-900 mb-5 text-sm uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link href="#" className="text-gray-500 hover:text-[#6B9B5F] text-sm font-medium transition-colors">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">© 2024 INTOWORK. Tous droits réservés.</p>
            <p className="text-gray-400 text-xs font-medium">MADE WITH ❤️ FOR AFRICA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
