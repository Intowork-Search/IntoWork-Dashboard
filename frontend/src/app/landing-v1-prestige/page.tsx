// REQUIRED DEPENDENCIES:
// - framer-motion (npm install framer-motion)
// - lucide-react (npm install lucide-react)
// - clsx (npm install clsx)
// - tailwind-merge (npm install tailwind-merge)

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Briefcase,
  UserPlus,
  Network,
  ChevronRight,
  Globe2,
  ShieldCheck,
  Zap,
  Quote
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for Tailwind class merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-white/80 backdrop-blur-md border-slate-200 py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[var(--color-brand-green)] rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-tighter italic">IW</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 uppercase">
            Into<span className="text-[var(--color-brand-green)]">Work</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {['Fonctionnalités', 'Offres', 'Entreprises', 'Témoignages'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs font-medium text-slate-600 hover:text-[var(--color-brand-green)] transition-colors tracking-wide uppercase"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/signin" className="text-xs font-semibold px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors rounded">
            Connexion
          </Link>
          <Link href="/signup" className="text-xs font-semibold px-5 py-2.5 bg-[var(--color-brand-green)] text-white hover:brightness-95 transition-all shadow-sm rounded">
            Inscription
          </Link>
        </div>
      </div>
    </nav>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="h-[1px] w-8 bg-[var(--color-brand-gold)]" />
    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-green)]">
      {children}
    </span>
  </div>
);

const Hero = () => {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden bg-slate-50">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--color-brand-green)]/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--color-brand-violet)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[var(--color-brand-gold)] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recrutement Intelligent en Afrique</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Trouvez votre talent idéal. <br />
              <span className="text-[var(--color-brand-green)]">Trouvez votre emploi parfait.</span>
            </h1>

            <p className="text-base text-slate-600 mb-10 leading-relaxed max-w-2xl font-light">
              La première plateforme panafricaine alliant l'intelligence artificielle
              au capital humain pour connecter les leaders de demain aux opportunités
              qui comptent.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/offres" className="group relative flex items-center justify-center gap-2 px-8 py-3.5 bg-[var(--color-brand-green)] text-white rounded font-semibold text-sm overflow-hidden transition-all shadow-md active:scale-[0.98]">
                Explorer les offres
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/signup" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-slate-200 text-slate-900 rounded font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm">
                Recruter des talents
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats - Refined Positioning */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {[
            { label: "Candidats Qualifiés", value: "10K+", icon: Users },
            { label: "Partenaires Entreprises", value: "500+", icon: Building2 },
            { label: "Taux de Satisfaction", value: "95%", icon: CheckCircle2 },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="bg-white p-6 border border-slate-200 rounded shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded bg-slate-50 group-hover:bg-[var(--color-brand-green)]/10 transition-colors">
                  <stat.icon className="w-5 h-5 text-[var(--color-brand-green)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      title: "Création de Profil",
      desc: "Inscrivez-vous et laissez notre algorithme analyser vos compétences uniques.",
      icon: UserPlus,
      color: "var(--color-brand-green)"
    },
    {
      title: "Matching par IA",
      desc: "Notre IA identifie les correspondances parfaites basées sur la culture et l'expertise.",
      icon: Sparkles,
      color: "var(--color-brand-violet)"
    },
    {
      title: "Connexion Directe",
      desc: "Échangez avec vos futurs collaborateurs et finalisez votre prochain succès.",
      icon: Network,
      color: "var(--color-brand-gold)"
    }
  ];

  return (
    <section className="py-24 bg-white border-y border-slate-100" id="fonctionnalités">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <SectionLabel>Processus</SectionLabel>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Comment ça fonctionne</h2>
          <div className="h-1 w-12 bg-[var(--color-brand-green)] mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-[1px] bg-slate-100 z-0" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6 group-hover:border-[var(--color-brand-green)] transition-all duration-500">
                <step.icon className="w-6 h-6 text-slate-400 group-hover:text-[var(--color-brand-green)] transition-colors" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                  0{idx + 1}
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-light px-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const [activeTab, setActiveTab] = useState<'candidate' | 'employer'>('candidate');

  const candidateFeatures = [
    { title: "Profil IA Prédictif", desc: "Mise en avant de vos soft skills et potentiel futur.", icon: Zap },
    { title: "Alertes sur mesure", desc: "Soyez le premier informé des opportunités d'élite.", icon: Globe2 },
    { title: "Accompagnement", desc: "Conseils carrière personnalisés via nos experts régionaux.", icon: ShieldCheck },
  ];

  const employerFeatures = [
    { title: "Sourcing Automatisé", desc: "Réduisez votre temps de recrutement de 60%.", icon: Briefcase },
    { title: "Vérification de Background", desc: "Talents certifiés et références vérifiées par nos soins.", icon: CheckCircle2 },
    { title: "Dashboard Analytique", desc: "Suivez vos performances de recrutement en temps réel.", icon: Network },
  ];

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <SectionLabel>Excellence</SectionLabel>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Une technologie de pointe pour des <span className="text-[var(--color-brand-violet)]">relations humaines</span> durables.
            </h2>
          </div>

          <div className="flex p-1 bg-slate-200 rounded-lg">
            <button
              onClick={() => setActiveTab('candidate')}
              className={cn(
                "px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'candidate' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Candidats
            </button>
            <button
              onClick={() => setActiveTab('employer')}
              className={cn(
                "px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'employer' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Entreprises
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {(activeTab === 'candidate' ? candidateFeatures : employerFeatures).map((feature, idx) => (
              <motion.div
                key={`${activeTab}-${idx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded border border-slate-200 hover:border-[var(--color-brand-green)]/30 transition-colors group"
              >
                <div className="mb-6 p-3 w-fit rounded-lg bg-slate-50 group-hover:bg-[var(--color-brand-green)]/10 transition-colors">
                  <feature.icon className="w-5 h-5 text-[var(--color-brand-green)]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-light">{feature.desc}</p>
                <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-[var(--color-brand-green)] opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest translate-y-2 group-hover:translate-y-0">
                  En savoir plus <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const JobsSection = () => (
  <section className="py-24 bg-white" id="offres">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-center mb-12">
        <div>
          <SectionLabel>Opportunités</SectionLabel>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Offres à la une</h2>
        </div>
        <Link href="/offres" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-[var(--color-brand-green)] transition-colors">
          Voir tous les postes
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="group border border-slate-100 rounded-lg p-5 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400">LOGO</div>
              <span className="text-[9px] font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded border border-slate-100">CDI</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[var(--color-brand-green)] transition-colors mb-1">
              {["Product Designer Senior", "Développeur Fullstack", "Responsable Marketing", "Data Analyst"][i-1]}
            </h4>
            <p className="text-xs text-slate-500 mb-4">{["Dakar, Sénégal", "Abidjan, CIV", "Lagos, Nigeria", "Nairobi, Kenya"][i-1]}</p>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
              <span className="text-[9px] text-slate-400 font-medium italic">Il y a {i*2} jours</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Partners = () => (
  <section className="py-16 bg-slate-50 border-y border-slate-100" id="entreprises">
    <div className="max-w-7xl mx-auto px-6">
      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-10">
        Ils nous font confiance pour leur croissance
      </p>
      <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
        {['ORANGE', 'ECOBANK', 'MTN', 'DANGOTE', 'JUMIA', 'INTERSWITCH'].map((name) => (
          <span key={name} className="text-lg font-black text-slate-600 tracking-tighter hover:text-slate-900 transition-colors cursor-default">
            {name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials = () => {
  const reviews = [
    {
      name: "Amadou Diallo",
      role: "CTO, TechAfrique",
      content: "IntoWork a transformé notre manière de recruter. Le matching IA est d'une précision chirurgicale, nous faisant gagner un temps précieux.",
      image: "AD"
    },
    {
      name: "Sarah Mensah",
      role: "Senior Developer",
      content: "Une plateforme qui comprend vraiment le marché africain. J'ai trouvé mon poste actuel en moins de deux semaines.",
      image: "SM"
    },
    {
      name: "Ousmane Keita",
      role: "HR Director, Sahel Group",
      content: "L'institutionnalité et le sérieux de la plateforme nous ont rassurés dès le départ. La qualité des profils est exceptionnelle.",
      image: "OK"
    }
  ];

  return (
    <section className="py-24 bg-white" id="témoignages">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center mb-16">
          <SectionLabel>Témoignages</SectionLabel>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Paroles de leaders</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div key={idx} className="relative p-8 border border-slate-100 rounded shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-full bg-white">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-50" />
              <p className="text-sm text-slate-600 leading-relaxed font-light mb-8 italic relative z-10">
                "{rev.content}"
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[var(--color-brand-gold)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-brand-gold)]">
                  {rev.image}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">{rev.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-24 px-6">
    <div className="max-w-5xl mx-auto bg-slate-900 rounded-2xl p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-green)]/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-brand-violet)]/10 blur-[80px] rounded-full" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
          Prêt à redéfinir votre <span className="text-[var(--color-brand-gold)]">avenir professionnel</span> ?
        </h2>
        <p className="text-slate-400 max-w-xl mb-10 font-light leading-relaxed">
          Rejoignez des milliers de professionnels et d'entreprises qui façonnent déjà le futur de l'Afrique sur IntoWork.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup" className="px-8 py-3 bg-[var(--color-brand-green)] text-white text-xs font-bold uppercase tracking-widest rounded hover:brightness-110 transition-all">
            Créer un compte candidat
          </Link>
          <Link href="/signup" className="px-8 py-3 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-white/10 transition-all">
            Espace recruteur
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <div className="w-8 h-8 bg-[var(--color-brand-green)] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tighter italic">IW</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 uppercase">
              Into<span className="text-[var(--color-brand-green)]">Work</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed font-light mb-6">
            La plateforme institutionnelle de recrutement IA dédiée à l'excellence professionnelle en Afrique.
          </p>
          <div className="flex gap-4">
            {['Twitter', 'LinkedIn', 'Facebook'].map(s => (
              <div key={s} className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 hover:text-[var(--color-brand-green)] hover:border-[var(--color-brand-green)] cursor-pointer transition-all">
                {s[0]}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-6">Plateforme</h4>
          <ul className="space-y-4">
            {["Offres d'emploi", 'Profil Talent', 'IA Matching', 'Recrutement PME'].map(item => (
              <li key={item}>
                <Link href="#" className="text-xs text-slate-500 hover:text-[var(--color-brand-green)] transition-colors">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-6">Ressources</h4>
          <ul className="space-y-4">
            {['Blog Carrière', 'Guides Employeurs', 'Études de marché', 'Webinaires'].map(item => (
              <li key={item}>
                <Link href="#" className="text-xs text-slate-500 hover:text-[var(--color-brand-green)] transition-colors">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-6">Support</h4>
          <ul className="space-y-4">
            {['Contactez-nous', 'FAQ', 'Confidentialité', 'Conditions'].map(item => (
              <li key={item}>
                <Link href="#" className="text-xs text-slate-500 hover:text-[var(--color-brand-green)] transition-colors">{item}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-slate-400 font-medium tracking-wide">
          © {new Date().getFullYear()} INTOWORK. Tous droits réservés.
        </p>
        <div className="flex items-center gap-6">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <Globe2 className="w-3 h-3" /> Afrique Centrale & Ouest
          </span>
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingPrestige() {
  return (
    <main className="min-h-screen bg-white selection:bg-[var(--color-brand-green)]/10 selection:text-[var(--color-brand-green)]">
      <Nav />
      <Hero />
      <Partners />
      <HowItWorks />
      <Features />
      <JobsSection />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
