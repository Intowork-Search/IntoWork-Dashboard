'use client';

// VIBE: Empowering Growth
// A warm and accessible atmosphere that prioritizes the human element of recruitment.
// Scale: Zoomed (large elements)
// Keywords: warm, accessible, human, friendly, supportive, encouraging, growth, opportunity

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Briefcase,
  UserPlus,
  Heart,
  TrendingUp,
  Award,
  MessageCircle,
  Globe2,
  Menu,
  X,
  Star,
  Lightbulb,
  Target,
  Smile
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-brand-green)] to-[var(--green-600)] rounded-2xl flex items-center justify-center shadow-lg shadow-green-200/50 group-hover:scale-105 transition-transform">
            <Heart className="text-white w-7 h-7" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tight text-slate-900 block">
              INTO<span className="text-[var(--color-brand-green)]">WORK</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">Votre futur commence ici</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {['Fonctionnalités', 'Offres', 'Entreprises', 'Témoignages'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-base font-semibold text-slate-600 hover:text-[var(--color-brand-green)] transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/signin" className="text-base font-bold px-6 py-3 text-slate-700 hover:text-[var(--color-brand-green)] transition-colors rounded-xl">
            Connexion
          </Link>
          <Link href="/signup" className="text-base font-bold px-8 py-4 bg-gradient-to-r from-[var(--color-brand-green)] to-[var(--green-600)] text-white rounded-2xl shadow-lg shadow-green-200/50 hover:shadow-xl hover:scale-105 transition-all">
            Commencer gratuitement
          </Link>
        </div>

        <button className="lg:hidden p-3" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-8 lg:hidden shadow-2xl"
          >
            {['Fonctionnalités', 'Offres', 'Entreprises', 'Témoignages'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xl font-medium text-slate-700 py-4 border-b border-slate-100"
              >
                {item}
              </Link>
            ))}
            <div className="flex flex-col gap-4 mt-6">
              <Link href="/signin" className="btn btn-outline btn-lg rounded-2xl">Connexion</Link>
              <Link href="/signup" className="btn bg-[var(--color-brand-green)] text-white btn-lg rounded-2xl">Inscription</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-40 pb-32 overflow-hidden bg-gradient-to-b from-[var(--green-50)] to-white">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-[var(--color-brand-gold)]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-[var(--color-brand-green)]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[var(--color-brand-violet)]/10 rounded-full blur-2xl" />

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border-2 border-[var(--green-200)] mb-10 shadow-sm">
            <Smile className="w-6 h-6 text-[var(--color-brand-gold)]" />
            <span className="text-lg font-bold text-[var(--color-brand-green)]">Bienvenue chez IntoWork</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
            Trouvez votre <br />
            <span className="text-[var(--color-brand-green)] relative">
              talent idéal
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C100 2 200 2 298 10" stroke="var(--color-brand-gold)" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Nous croyons que chaque personne mérite une opportunité de s'épanouir.
            IntoWork connecte les <span className="text-[var(--color-brand-green)] font-bold">rêves</span> aux <span className="text-[var(--color-brand-violet)] font-bold">réalités</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/signup" className="group flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-[var(--color-brand-green)] to-[var(--green-600)] text-white rounded-2xl font-bold text-xl shadow-xl shadow-green-200/50 hover:shadow-2xl hover:scale-105 transition-all">
              <span>Je cherche un emploi</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/signup" className="flex items-center justify-center gap-3 px-10 py-5 bg-white border-3 border-[var(--color-brand-violet)] text-[var(--color-brand-violet)] rounded-2xl font-bold text-xl hover:bg-[var(--violet-50)] transition-all shadow-lg">
              <Building2 className="w-6 h-6" />
              <span>Je recrute</span>
            </Link>
          </div>

          {/* Stats with friendly icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { label: "Candidats heureux", value: "10K+", icon: Users, color: "var(--color-brand-green)" },
              { label: "Entreprises partenaires", value: "500+", icon: Building2, color: "var(--color-brand-violet)" },
              { label: "Satisfaction", value: "95%", icon: Heart, color: "var(--color-brand-gold)" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
                </div>
                <div className="text-4xl font-black text-slate-900 mb-2">{stat.value}</div>
                <div className="text-base font-semibold text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
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
      desc: "Racontez votre histoire, vos compétences et vos aspirations. Nous sommes là pour vous écouter.",
      icon: UserPlus,
      color: "var(--color-brand-green)"
    },
    {
      title: "L'IA vous accompagne",
      desc: "Notre technologie bienveillante trouve les opportunités qui correspondent vraiment à vos valeurs.",
      icon: Sparkles,
      color: "var(--color-brand-violet)"
    },
    {
      title: "Grandissez ensemble",
      desc: "Connectez-vous avec des entreprises qui partagent votre vision et construisez votre avenir.",
      icon: TrendingUp,
      color: "var(--color-brand-gold)"
    }
  ];

  return (
    <section className="py-32 bg-white" id="fonctionnalités">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--green-100)] text-[var(--color-brand-green)] font-bold text-sm mb-6">
            <Lightbulb size={18} />
            Simple comme bonjour
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Trois étapes simples vers votre prochain chapitre professionnel
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative group"
            >
              <div className="bg-slate-50 rounded-[2rem] p-10 hover:bg-white hover:shadow-2xl transition-all duration-500 h-full border-2 border-transparent hover:border-slate-100">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: step.color }}
                >
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute top-8 right-8 text-7xl font-black text-slate-100 group-hover:text-slate-200 transition-colors">
                  0{idx + 1}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">{step.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed relative z-10">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const candidateFeatures = [
    { title: "Accompagnement personnalisé", desc: "Un parcours adapté à votre rythme et vos objectifs.", icon: Heart },
    { title: "Conseils de carrière", desc: "Des experts à votre écoute pour vous guider.", icon: MessageCircle },
    { title: "Opportunités ciblées", desc: "Plus de bruit, seulement ce qui vous correspond.", icon: Target },
  ];

  const employerFeatures = [
    { title: "Talents motivés", desc: "Accédez à des candidats vraiment engagés.", icon: Award },
    { title: "Culture first", desc: "Trouvez des personnes qui partagent vos valeurs.", icon: Users },
    { title: "Suivi humanisé", desc: "Un processus de recrutement bienveillant.", icon: Heart },
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-[var(--green-50)] to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Une plateforme qui vous <span className="text-[var(--color-brand-green)]">comprend</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Que vous cherchiez un emploi ou des talents, nous mettons l'humain au centre
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Candidats */}
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-[var(--green-100)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-green)] flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Pour les candidats</h3>
            </div>
            <div className="space-y-6">
              {candidateFeatures.map((f, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-[var(--green-50)] transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[var(--green-100)] flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-6 h-6 text-[var(--color-brand-green)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{f.title}</h4>
                    <p className="text-slate-600">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/signup" className="mt-8 w-full btn bg-[var(--color-brand-green)] text-white btn-lg rounded-2xl hover:bg-[var(--green-700)]">
              Créer mon profil
            </Link>
          </div>

          {/* Entreprises */}
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-[var(--violet-100)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-violet)] flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Pour les recruteurs</h3>
            </div>
            <div className="space-y-6">
              {employerFeatures.map((f, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-[var(--violet-50)] transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[var(--violet-100)] flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-6 h-6 text-[var(--color-brand-violet)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{f.title}</h4>
                    <p className="text-slate-600">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/signup" className="mt-8 w-full btn bg-[var(--color-brand-violet)] text-white btn-lg rounded-2xl hover:bg-[var(--violet-700)]">
              Commencer à recruter
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const JobsSection = () => (
  <section className="py-32 bg-white" id="offres">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold-100)] text-[var(--color-brand-gold)] font-bold text-sm mb-4">
            <Briefcase size={16} />
            Opportunités
          </div>
          <h2 className="text-4xl font-black text-slate-900">Des jobs qui vous ressemblent</h2>
        </div>
        <Link href="/offres" className="flex items-center gap-2 text-[var(--color-brand-green)] font-bold text-lg hover:gap-3 transition-all">
          Voir toutes les offres <ArrowRight />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { title: "Designer UX Senior", company: "TechHub Dakar", location: "Sénégal", type: "CDI" },
          { title: "Développeur Frontend", company: "AfriConnect", location: "Côte d'Ivoire", type: "Remote" },
          { title: "Product Manager", company: "StartUp Lagos", location: "Nigeria", type: "Full-time" },
        ].map((job, i) => (
          <div key={i} className="bg-slate-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl border-2 border-transparent hover:border-[var(--green-200)] transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-[var(--color-brand-green)]" />
              </div>
              <span className="px-4 py-2 bg-[var(--green-100)] text-[var(--color-brand-green)] text-sm font-bold rounded-full">
                {job.type}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[var(--color-brand-green)] transition-colors">{job.title}</h3>
            <p className="text-slate-500 mb-6 flex items-center gap-2">
              <Building2 size={16} /> {job.company} • {job.location}
            </p>
            <Link href="/offres" className="w-full btn btn-outline border-[var(--color-brand-green)] text-[var(--color-brand-green)] rounded-xl hover:bg-[var(--color-brand-green)] hover:text-white">
              En savoir plus
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Partners = () => (
  <section className="py-20 bg-slate-50" id="entreprises">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <p className="text-lg font-semibold text-slate-500 mb-10">
        Ils font confiance à IntoWork pour grandir ensemble
      </p>
      <div className="flex flex-wrap justify-center items-center gap-16 opacity-60 hover:opacity-100 transition-opacity">
        {['Orange', 'MTN', 'Ecobank', 'Jumia', 'Dangote', 'Andela'].map((name) => (
          <span key={name} className="text-2xl font-black text-slate-400 hover:text-[var(--color-brand-green)] transition-colors cursor-default">
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
      name: "Fatou Diop",
      role: "Designer UI/UX",
      content: "IntoWork m'a permis de trouver une entreprise qui partage mes valeurs. Je n'ai jamais été aussi épanouie au travail !",
      rating: 5
    },
    {
      name: "Kwame Asante",
      role: "DRH, AfriTech",
      content: "La qualité des profils est exceptionnelle. On sent que les candidats sont vraiment motivés et bien accompagnés.",
      rating: 5
    },
    {
      name: "Aminata Traoré",
      role: "Développeuse",
      content: "Enfin une plateforme qui prend le temps de comprendre ce qu'on cherche vraiment. Merci IntoWork !",
      rating: 5
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-white to-[var(--green-50)]" id="témoignages">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--gold-100)] text-[var(--color-brand-gold)] font-bold text-sm mb-6">
            <Heart size={18} />
            Témoignages
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Ils ont trouvé leur bonheur
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-[var(--color-brand-gold)] fill-current" />
                ))}
              </div>
              <p className="text-lg text-slate-700 mb-8 leading-relaxed">
                "{rev.content}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-brand-green)] to-[var(--green-600)] flex items-center justify-center text-white font-bold text-lg">
                  {rev.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{rev.name}</h4>
                  <p className="text-slate-500">{rev.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-24 px-6">
    <div className="max-w-5xl mx-auto bg-gradient-to-br from-[var(--color-brand-green)] via-[var(--green-600)] to-[var(--green-700)] rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black mb-6">
          Prêt à écrire votre prochaine <span className="text-[var(--color-brand-gold)]">histoire</span> ?
        </h2>
        <p className="text-xl text-green-50 mb-10 max-w-2xl mx-auto">
          Rejoignez une communauté de professionnels bienveillants et trouvez l'opportunité qui vous correspond vraiment.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/signup" className="px-10 py-5 bg-white text-[var(--color-brand-green)] font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-xl">
            Commencer maintenant
          </Link>
          <Link href="#" className="px-10 py-5 bg-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white/30 transition-colors backdrop-blur-sm">
            En savoir plus
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-900 text-white pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[var(--color-brand-green)] rounded-xl flex items-center justify-center">
              <Heart className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-xl">INTOWORK</span>
          </Link>
          <p className="text-slate-400 leading-relaxed mb-6">
            Une plateforme humaine pour des connexions authentiques entre talents et entreprises.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Candidats</h4>
          <ul className="space-y-4 text-slate-400">
            {['Chercher un emploi', 'Créer mon CV', 'Conseils carrière', 'Témoignages'].map(item => (
              <li key={item}><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">{item}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Entreprises</h4>
          <ul className="space-y-4 text-slate-400">
            {['Publier une offre', 'Rechercher des talents', 'Nos tarifs', 'Success stories'].map(item => (
              <li key={item}><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">{item}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Contact</h4>
          <ul className="space-y-4 text-slate-400">
            {['À propos', 'Blog', 'Support', 'Confidentialité'].map(item => (
              <li key={item}><Link href="#" className="hover:text-[var(--color-brand-green)] transition-colors">{item}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500">
          © {new Date().getFullYear()} IntoWork. Fait avec <Heart className="inline w-4 h-4 text-[var(--color-brand-green)]" /> en Afrique.
        </p>
        <div className="flex items-center gap-6">
          <span className="text-slate-400 flex items-center gap-2">
            <Globe2 className="w-4 h-4" /> Afrique Francophone
          </span>
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingGrowth() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <JobsSection />
      <Partners />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
