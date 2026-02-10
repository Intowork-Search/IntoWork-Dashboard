'use client';

// REQUIRED DEPENDENCIES:
// - lucide-react (npm install lucide-react)
// - framer-motion (npm install framer-motion)
// - clsx (npm install clsx)
// - tailwind-merge (npm install tailwind-merge)

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users,
  Building2,
  CheckCircle2,
  Zap,
  Cpu,
  Briefcase,
  Globe,
  ArrowRight,
  Menu,
  X,
  Star,
  Quote,
  LayoutGrid,
  Sparkles
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Fonctionnalités', href: '#features' },
    { name: 'Offres', href: '#jobs' },
    { name: 'Entreprises', href: '#partners' },
    { name: 'Témoignages', href: '#testimonials' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[var(--color-brand-green)] rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[var(--slate-900)]">
            INTO<span className="text-[var(--color-brand-green)]">WORK</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-[var(--slate-600)] hover:text-[var(--color-brand-green)] transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/signin" className="btn btn-ghost text-[var(--slate-700)] font-bold">Connexion</Link>
          <Link href="/signup" className="btn bg-[var(--color-brand-green)] hover:bg-[var(--green-700)] text-white border-none shadow-md">
            Inscription
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-[var(--slate-900)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-6 flex flex-col gap-4 md:hidden shadow-xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-[var(--slate-700)]"
              >
                {link.name}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Link href="/signin" className="btn btn-outline border-[var(--slate-200)]">Connexion</Link>
              <Link href="/signup" className="btn bg-[var(--color-brand-green)] text-white border-none">Inscription</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--color-brand-green)]/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[var(--color-brand-violet)]/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--green-50)] border border-[var(--green-100)] text-[var(--color-brand-green)] text-sm font-bold mb-6">
            <Sparkles size={16} />
            <span>L'IA au service du recrutement en Afrique</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[var(--slate-900)] leading-[1.1] mb-6">
            Trouvez votre <span className="text-[var(--color-brand-green)]">talent idéal.</span><br />
            Trouvez votre <span className="text-[var(--color-brand-violet)]">emploi parfait.</span>
          </h1>
          <p className="text-xl text-[var(--slate-600)] mb-10 max-w-xl leading-relaxed">
            IntoWork utilise l'intelligence artificielle pour connecter les meilleurs talents africains avec les entreprises les plus innovantes. Rapide, précis, humain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="btn h-14 px-8 bg-[var(--color-brand-green)] hover:bg-[var(--green-700)] text-white border-none text-lg shadow-xl shadow-green-100">
              Recruter des talents
            </Link>
            <Link href="/offres" className="btn h-14 px-8 btn-outline border-[var(--slate-200)] text-lg hover:bg-[var(--slate-50)]">
              Chercher un emploi
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-[var(--color-brand-gold)] flex items-center justify-center text-xs font-bold">
                +10k
              </div>
            </div>
            <p className="text-sm text-[var(--slate-500)] font-medium">
              Rejoint par plus de <span className="text-[var(--slate-900)] font-bold">10,000+ candidats</span> ce mois-ci
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Main Visual Element */}
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
             <div className="aspect-square bg-slate-900 flex items-center justify-center relative overflow-hidden">
                {/* Simulated AI Interface */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-brand-green)_0%,_transparent_70%)]" />
                  <div className="h-full w-full opacity-20" style={{ backgroundImage: 'radial-gradient(var(--slate-700) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                </div>

                <div className="z-20 w-full p-8 flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-2/3 bg-white/20 rounded" />
                        <div className="h-2 w-1/2 bg-white/10 rounded" />
                      </div>
                      <div className="px-3 py-1 rounded-full bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] text-[10px] font-bold">
                        98% MATCH
                      </div>
                    </motion.div>
                  ))}

                  <div className="mt-4 flex justify-center">
                    <div className="px-6 py-3 rounded-2xl bg-[var(--color-brand-violet)] text-white font-bold flex items-center gap-2 animate-pulse">
                      <Cpu size={18} /> Optimisation par IA...
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Floating Stats */}
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl z-20 border border-slate-100 hidden sm:block">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--green-50)] rounded-lg text-[var(--color-brand-green)]">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-[var(--slate-900)] leading-none">95%</p>
                <p className="text-xs font-bold text-[var(--slate-500)] uppercase tracking-wider">Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="absolute -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 border border-slate-100 hidden sm:block">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--gold-50)] rounded-lg text-[var(--color-brand-gold)]">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-[var(--slate-900)] leading-none">500+</p>
                <p className="text-xs font-bold text-[var(--slate-500)] uppercase tracking-wider">Entreprises</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      title: "Créez votre profil",
      desc: "Inscrivez-vous en quelques secondes. Importez votre CV ou décrivez vos besoins en recrutement.",
      icon: <Users className="w-8 h-8" />,
      color: "var(--color-brand-green)"
    },
    {
      title: "AI Matching",
      desc: "Notre algorithme analyse des milliers de points de données pour trouver la correspondance parfaite.",
      icon: <Cpu className="w-8 h-8" />,
      color: "var(--color-brand-violet)"
    },
    {
      title: "Connectez-vous",
      desc: "Passez des entretiens directement sur la plateforme et commencez votre nouvelle aventure.",
      icon: <Zap className="w-8 h-8" />,
      color: "var(--color-brand-gold)"
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-[var(--color-brand-green)] uppercase tracking-[0.2em] mb-4">Fonctionnement</h2>
          <p className="text-4xl font-black text-[var(--slate-900)]">Comment IntoWork transforme votre futur</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/4 left-[20%] right-[20%] h-0.5 bg-slate-200 -z-0" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-xl transition-transform hover:scale-110"
                style={{ backgroundColor: step.color, color: 'white' }}
              >
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-[var(--slate-900)] mb-4">{step.title}</h3>
              <p className="text-[var(--slate-600)] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const [activeTab, setActiveTab] = useState<'talent' | 'company'>('talent');

  const talentFeatures = [
    { title: "Matching Intelligent", desc: "Soyez notifié uniquement pour les jobs qui vous correspondent vraiment." },
    { title: "Gestion de Carrière", desc: "Outils d'IA pour optimiser votre profil et vos compétences." },
    { title: "Direct-to-Hiring", desc: "Échangez directement avec les décideurs, sans intermédiaires." },
  ];

  const companyFeatures = [
    { title: "Sourcing Automatisé", desc: "L'IA sélectionne les meilleurs profils pour vous faire gagner du temps." },
    { title: "Tests de Compétences", desc: "Vérifiez les aptitudes techniques des candidats en un clic." },
    { title: "Analytics Recrutement", desc: "Suivez vos performances et optimisez votre marque employeur." },
  ];

  return (
    <section id="features" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-black text-[var(--slate-900)] mb-8">
              Une plateforme, deux expériences <span className="text-[var(--color-brand-green)]">révolutionnaires</span>
            </h2>

            <div className="flex p-1 bg-slate-100 rounded-2xl mb-10 w-fit">
              <button
                onClick={() => setActiveTab('talent')}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold transition-all",
                  activeTab === 'talent' ? "bg-white text-[var(--color-brand-green)] shadow-sm" : "text-[var(--slate-500)]"
                )}
              >
                Pour les Talents
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold transition-all",
                  activeTab === 'company' ? "bg-white text-[var(--color-brand-violet)] shadow-sm" : "text-[var(--slate-500)]"
                )}
              >
                Pour les Entreprises
              </button>
            </div>

            <div className="space-y-6">
              {(activeTab === 'talent' ? talentFeatures : companyFeatures).map((f, i) => (
                <motion.div
                  key={i + activeTab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className={cn(
                    "mt-1 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center",
                    activeTab === 'talent' ? "bg-[var(--green-100)] text-[var(--color-brand-green)]" : "bg-[var(--violet-100)] text-[var(--color-brand-violet)]"
                  )}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--slate-900)] mb-1">{f.title}</h4>
                    <p className="text-[var(--slate-600)]">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href="/signup" className={cn(
              "mt-10 btn border-none text-white inline-flex items-center gap-2",
              activeTab === 'talent' ? "bg-[var(--color-brand-green)]" : "bg-[var(--color-brand-violet)]"
            )}>
              Découvrir plus <ArrowRight size={18} />
            </Link>
          </div>

          <div className="lg:w-1/2 relative">
            <div className={cn(
              "aspect-video rounded-3xl p-8 flex items-center justify-center transition-all duration-500",
              activeTab === 'talent' ? "bg-[var(--green-50)]" : "bg-[var(--violet-50)]"
            )}>
               {/* Contextual Illustration Placeholder */}
               <div className="w-full h-full border-4 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-[var(--slate-400)]">
                  <LayoutGrid size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Interface {activeTab === 'talent' ? 'Candidat' : 'Recruteur'} Interactive</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturedJobs = () => {
  const jobs = [
    { title: "Développeur Fullstack Senior", company: "TechNova Dakar", location: "Sénégal / Remote", type: "CDI", salary: "1.2M - 1.8M FCFA" },
    { title: "Data Scientist AI", company: "Innovate Nairobi", location: "Kenya", type: "CDI", salary: "Confidentiel" },
    { title: "Product Designer", company: "Afriflow", location: "Côte d'Ivoire", type: "Full-time", salary: "800k - 1.1M FCFA" },
  ];

  return (
    <section id="jobs" className="py-24 bg-[var(--slate-900)] text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-sm font-bold text-[var(--color-brand-gold)] uppercase tracking-widest mb-4">Offres du moment</h2>
            <p className="text-4xl font-black">Les meilleures opportunités Tech</p>
          </div>
          <Link href="/offres" className="text-[var(--color-brand-gold)] font-bold flex items-center gap-2 hover:gap-3 transition-all">
            Voir toutes les offres <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {jobs.map((job, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="text-[var(--color-brand-gold)]" size={24} />
                </div>
                <span className="px-3 py-1 bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] text-xs font-bold rounded-full">
                  {job.type}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{job.title}</h3>
              <p className="text-slate-400 mb-6 flex items-center gap-2">
                <Globe size={14} /> {job.company} • {job.location}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <span className="text-sm font-medium text-slate-300">{job.salary}</span>
                <Link href="/offres" className="text-white hover:text-[var(--color-brand-gold)] transition-colors">Postuler</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Partners = () => {
  return (
    <section id="partners" className="py-20 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">Ils nous font confiance</p>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
           {/* Replace with actual partner SVG logos */}
           {['Microsoft Africa', 'Andela', 'Flutterwave', 'Standard Bank', 'MTN', 'Orange'].map(name => (
             <div key={name} className="text-xl font-black text-slate-400 hover:text-slate-900 transition-colors cursor-default">
               {name}
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const reviews = [
    { name: "Amadou Diallo", role: "Software Engineer", text: "Grâce à l'IA d'IntoWork, j'ai trouvé un job qui correspond exactement à mes aspirations techniques en moins de 2 semaines.", avatar: "1" },
    { name: "Sarah Koné", role: "HR Manager @ TechHub", text: "Le filtrage des candidats est d'une précision chirurgicale. Nous avons réduit notre temps de recrutement de 60%.", avatar: "2" },
    { name: "Koffi Mensah", role: "Product Manager", text: "L'interface est fluide et les recommandations sont toujours pertinentes. C'est le futur du recrutement en Afrique.", avatar: "3" },
  ];

  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[var(--slate-900)] mb-4">Ce qu'en disent nos utilisateurs</h2>
          <div className="flex justify-center gap-1 text-[var(--color-brand-gold)]">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" size={20} />)}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((rev, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative">
              <Quote className="absolute top-6 right-8 text-slate-100 w-12 h-12 -z-0" />
              <p className="text-lg text-[var(--slate-600)] mb-8 relative z-10 italic">"{rev.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 overflow-hidden" />
                <div>
                  <h4 className="font-bold text-[var(--slate-900)] leading-none">{rev.name}</h4>
                  <p className="text-sm text-[var(--color-brand-green)] font-medium mt-1">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-[var(--color-brand-green)] to-[var(--green-800)] rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-green-200">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">Prêt à accélérer votre carrière ou votre croissance ?</h2>
        <p className="text-xl text-green-50 mb-10 max-w-2xl mx-auto opacity-90 relative z-10">
          Rejoignez la communauté IntoWork dès aujourd'hui et laissez notre IA travailler pour vous.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
          <Link href="/signup" className="btn bg-white text-[var(--color-brand-green)] hover:bg-slate-50 border-none h-14 px-10 text-lg font-black rounded-2xl">
            Commencer maintenant
          </Link>
          <Link href="#" className="btn btn-ghost border-white/30 text-white hover:bg-white/10 h-14 px-10 text-lg rounded-2xl">
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[var(--color-brand-green)] rounded-lg flex items-center justify-center">
                <Cpu className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[var(--slate-900)]">
                INTO<span className="text-[var(--color-brand-green)]">WORK</span>
              </span>
            </Link>
            <p className="text-[var(--slate-500)] max-w-sm mb-6 leading-relaxed">
              La plateforme de recrutement nouvelle génération alimentée par l'intelligence artificielle, dédiée au marché africain.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                <div key={social} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[var(--slate-400)] hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">
                  <span className="sr-only">{social}</span>
                  <Globe size={20} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[var(--slate-900)] mb-6 uppercase text-xs tracking-widest">Candidats</h4>
            <ul className="space-y-4 text-[var(--slate-600)]">
              <li><Link href="/offres" className="hover:text-[var(--color-brand-green)] transition-colors">Chercher un emploi</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Profil IA</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Conseils carrière</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Webinaires</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[var(--slate-900)] mb-6 uppercase text-xs tracking-widest">Entreprises</h4>
            <ul className="space-y-4 text-[var(--slate-600)]">
              <li><Link href="/signup" className="hover:text-[var(--color-brand-green)] transition-colors">Publier une offre</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Sourcing IA</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Tarification</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Études de cas</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[var(--slate-900)] mb-6 uppercase text-xs tracking-widest">Société</h4>
            <ul className="space-y-4 text-[var(--slate-600)]">
              <li><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">À propos</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">Confidentialité</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--slate-500)]">
            © {new Date().getFullYear()} IntoWork Africa. Tous droits réservés.
          </p>
          <div className="flex gap-8 text-sm text-[var(--slate-500)]">
            <Link href="#" className="hover:text-[var(--color-brand-green)]">CGU</Link>
            <Link href="#" className="hover:text-[var(--color-brand-green)]">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white font-[family-name:var(--font-plus-jakarta-sans)]">
      <Nav />
      <Hero />
      <Partners />
      <HowItWorks />
      <Features />
      <FeaturedJobs />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
