'use client';

// VIBE: Precision Executive
// A lean, high-utility aesthetic designed for the busy recruiter who values data and speed.
// Scale: Refined (small, elegant)
// Keywords: lean, clinical, organized, efficient, data-driven, metrics, executive, minimal

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Briefcase,
  UserCheck,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Globe2,
  ChevronRight,
  Activity,
  PieChart
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-white border-b border-slate-100 py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-900 flex items-center justify-center">
            <BarChart3 className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900">
            INTOWORK
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {['Plateforme', 'Offres', 'Entreprises', 'Données'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/signin" className="text-xs font-medium px-3 py-1.5 text-slate-600 hover:text-slate-900 transition-colors">
            Se connecter
          </Link>
          <Link href="/signup" className="text-xs font-medium px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            Accès plateforme
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="pt-24 pb-16 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 bg-[var(--color-brand-green)] rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Plateforme de recrutement IA
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4 tracking-tight">
                Recrutement de précision.
                <br />
                <span className="text-slate-400">Résultats mesurables.</span>
              </h1>

              <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-md">
                IntoWork optimise votre processus de recrutement grâce à l'IA.
                Réduisez votre time-to-hire de 60% avec des données actionnables.
              </p>

              <div className="flex gap-3 mb-10">
                <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors">
                  Demander une démo
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link href="/offres" className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors">
                  Explorer les offres
                </Link>
              </div>

              {/* Metrics row */}
              <div className="flex gap-8 pt-6 border-t border-slate-100">
                {[
                  { value: "10K+", label: "Candidats" },
                  { value: "500+", label: "Entreprises" },
                  { value: "95%", label: "Satisfaction" },
                ].map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right side - Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-slate-50 border border-slate-200 p-6">
              {/* Mini dashboard */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dashboard Recruteur</span>
                <span className="text-[9px] text-slate-400">Mis à jour il y a 2min</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { icon: Users, value: "147", label: "Candidatures", trend: "+12%" },
                  { icon: UserCheck, value: "23", label: "Shortlistés", trend: "+8%" },
                  { icon: Clock, value: "4.2j", label: "Temps moyen", trend: "-15%" },
                ].map((metric, idx) => (
                  <div key={idx} className="bg-white p-3 border border-slate-100">
                    <metric.icon className="w-4 h-4 text-slate-400 mb-2" />
                    <div className="text-lg font-bold text-slate-900">{metric.value}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400">{metric.label}</span>
                      <span className={cn(
                        "text-[9px] font-bold",
                        metric.trend.startsWith('+') ? "text-[var(--color-brand-green)]" : "text-red-500"
                      )}>{metric.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pipeline preview */}
              <div className="bg-white p-3 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-600">Pipeline de recrutement</span>
                  <Activity className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex gap-1 h-2">
                  <div className="flex-[4] bg-[var(--color-brand-green)]" />
                  <div className="flex-[3] bg-[var(--color-brand-violet)]" />
                  <div className="flex-[2] bg-[var(--color-brand-gold)]" />
                  <div className="flex-[1] bg-slate-200" />
                </div>
                <div className="flex justify-between mt-2">
                  {['Sourcing', 'Entretiens', 'Offres', 'Embauche'].map((stage, i) => (
                    <span key={i} className="text-[8px] text-slate-400">{stage}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ProcessSection = () => {
  const steps = [
    {
      number: "01",
      title: "Import & Analyse",
      desc: "Importez vos données candidats. L'IA analyse instantanément les profils.",
      icon: Target
    },
    {
      number: "02",
      title: "Matching Algorithmique",
      desc: "Scores de compatibilité précis basés sur 50+ critères pondérés.",
      icon: BarChart3
    },
    {
      number: "03",
      title: "Action & Mesure",
      desc: "Prenez des décisions éclairées. Suivez vos KPIs en temps réel.",
      icon: TrendingUp
    }
  ];

  return (
    <section className="py-16 bg-white" id="plateforme">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 block mb-2">Processus</span>
            <h2 className="text-xl font-bold text-slate-900">Workflow optimisé</h2>
          </div>
          <Link href="#" className="text-[10px] font-medium text-slate-400 hover:text-slate-900 flex items-center gap-1">
            Documentation <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-slate-200">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-6 group hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between mb-6">
                <span className="text-[10px] font-bold text-slate-300">{step.number}</span>
                <step.icon className="w-4 h-4 text-slate-300 group-hover:text-[var(--color-brand-green)] transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = {
    candidates: [
      { title: "Profil optimisé IA", desc: "Analyse automatique de votre CV et recommandations.", icon: Zap },
      { title: "Matching précis", desc: "Score de compatibilité pour chaque offre.", icon: Target },
      { title: "Suivi transparent", desc: "Visibilité complète sur vos candidatures.", icon: Activity },
    ],
    employers: [
      { title: "ATS intelligent", desc: "Gestion centralisée de tous vos recrutements.", icon: PieChart },
      { title: "Analytics avancées", desc: "Rapports détaillés et KPIs personnalisables.", icon: BarChart3 },
      { title: "Intégrations API", desc: "Connectez vos outils RH existants.", icon: Shield },
    ]
  };

  const [activeTab, setActiveTab] = useState<'candidates' | 'employers'>('employers');

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 block mb-2">Fonctionnalités</span>
            <h2 className="text-xl font-bold text-slate-900">Solutions B2B & B2C</h2>
          </div>

          <div className="flex bg-white border border-slate-200 p-0.5">
            {(['employers', 'candidates'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                  activeTab === tab
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab === 'employers' ? 'Entreprises' : 'Candidats'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {features[activeTab].map((feature, idx) => (
            <motion.div
              key={`${activeTab}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-100 p-5 hover:border-slate-300 transition-colors group"
            >
              <feature.icon className="w-4 h-4 text-slate-300 mb-4 group-hover:text-[var(--color-brand-green)] transition-colors" />
              <h3 className="text-sm font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const JobsSection = () => (
  <section className="py-16 bg-white" id="offres">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 block mb-2">Opportunités</span>
          <h2 className="text-xl font-bold text-slate-900">Offres actives</h2>
        </div>
        <Link href="/offres" className="text-[10px] font-medium text-slate-900 border border-slate-200 px-4 py-2 hover:bg-slate-50 transition-colors">
          Voir tout →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">Poste</th>
              <th className="text-left py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">Entreprise</th>
              <th className="text-left py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">Localisation</th>
              <th className="text-left py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">Type</th>
              <th className="text-right py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">Candidatures</th>
            </tr>
          </thead>
          <tbody>
            {[
              { title: "Senior Software Engineer", company: "TechCorp Africa", location: "Dakar", type: "CDI", applications: 47 },
              { title: "Product Manager", company: "Fintech SA", location: "Lagos", type: "Remote", applications: 32 },
              { title: "Data Analyst", company: "E-Commerce Ltd", location: "Nairobi", type: "CDI", applications: 28 },
              { title: "UX Designer", company: "Design Studio", location: "Abidjan", type: "Freelance", applications: 19 },
            ].map((job, idx) => (
              <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                <td className="py-4">
                  <span className="text-sm font-medium text-slate-900 group-hover:text-[var(--color-brand-green)] transition-colors">{job.title}</span>
                </td>
                <td className="py-4 text-xs text-slate-500">{job.company}</td>
                <td className="py-4 text-xs text-slate-500">{job.location}</td>
                <td className="py-4">
                  <span className="text-[9px] font-bold px-2 py-1 bg-slate-100 text-slate-500">{job.type}</span>
                </td>
                <td className="py-4 text-right">
                  <span className="text-xs font-bold text-slate-900">{job.applications}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

const Partners = () => (
  <section className="py-12 bg-slate-50 border-y border-slate-100" id="entreprises">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Clients Enterprise
        </span>
        <div className="flex flex-wrap items-center justify-center gap-12 opacity-40">
          {['ORANGE', 'MTN', 'ECOBANK', 'STANDARD BANK', 'TOTAL', 'DANGOTE'].map((name) => (
            <span key={name} className="text-sm font-bold text-slate-600 tracking-tight">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const MetricsSection = () => (
  <section className="py-16 bg-white" id="données">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 block mb-2">Performance</span>
        <h2 className="text-xl font-bold text-slate-900">Métriques qui comptent</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200">
        {[
          { value: "-60%", label: "Time-to-hire", desc: "Réduction moyenne" },
          { value: "3.2x", label: "ROI", desc: "Retour sur investissement" },
          { value: "89%", label: "Rétention", desc: "À 12 mois" },
          { value: "4.8/5", label: "NPS", desc: "Score satisfaction" },
        ].map((metric, idx) => (
          <div key={idx} className="bg-white p-8 text-center">
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{metric.value}</div>
            <div className="text-xs font-bold text-slate-600 mb-1">{metric.label}</div>
            <div className="text-[10px] text-slate-400">{metric.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section className="py-16 bg-slate-50">
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { quote: "IntoWork a réduit notre cycle de recrutement de 45%. Les données sont précises et actionnables.", author: "M. Diallo", role: "DRH, TechCorp" },
          { quote: "L'interface est sobre et efficace. Exactement ce dont nous avions besoin.", author: "S. Mensah", role: "Talent Manager" },
          { quote: "Le ROI est mesurable dès le premier mois. Recommandé pour les équipes data-driven.", author: "K. Traoré", role: "CEO, Startup" },
        ].map((t, idx) => (
          <div key={idx} className="bg-white border border-slate-100 p-6">
            <p className="text-sm text-slate-600 mb-6 leading-relaxed italic">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                {t.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{t.author}</div>
                <div className="text-[10px] text-slate-400">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="py-16 bg-slate-900">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
        Prêt à optimiser votre recrutement ?
      </h2>
      <p className="text-sm text-slate-400 mb-8 max-w-lg mx-auto">
        Demandez une démo personnalisée et découvrez comment IntoWork peut transformer vos processus RH.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/signup" className="px-8 py-3 bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors">
          Demander une démo
        </Link>
        <Link href="#" className="px-8 py-3 border border-slate-700 text-white text-xs font-bold hover:bg-slate-800 transition-colors">
          Contacter les ventes
        </Link>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-white border-t border-slate-100 py-12">
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-slate-900 flex items-center justify-center">
              <BarChart3 className="text-white w-3 h-3" />
            </div>
            <span className="font-bold text-xs text-slate-900">INTOWORK</span>
          </Link>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Plateforme de recrutement IA pour l'Afrique.
          </p>
        </div>

        {[
          { title: "Produit", links: ["Fonctionnalités", "Tarifs", "API", "Intégrations"] },
          { title: "Ressources", links: ["Documentation", "Blog", "Guides", "Webinaires"] },
          { title: "Entreprise", links: ["À propos", "Carrières", "Contact", "Presse"] },
          { title: "Légal", links: ["Confidentialité", "CGU", "Cookies", "Sécurité"] },
        ].map((col, idx) => (
          <div key={idx}>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(link => (
                <li key={link}>
                  <Link href="#" className="text-[10px] text-slate-400 hover:text-slate-900 transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-slate-400">
          © {new Date().getFullYear()} IntoWork. Tous droits réservés.
        </p>
        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><Globe2 className="w-3 h-3" /> Afrique</span>
          <span>|</span>
          <span>Status: <span className="text-[var(--color-brand-green)]">●</span> Opérationnel</span>
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingExecutive() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased">
      <Nav />
      <Hero />
      <ProcessSection />
      <FeaturesSection />
      <JobsSection />
      <Partners />
      <MetricsSection />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
