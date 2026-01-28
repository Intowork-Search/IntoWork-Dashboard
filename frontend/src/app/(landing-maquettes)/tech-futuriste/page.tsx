'use client';

import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export default function TechFuturisteLanding() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`${inter.variable} font-sans bg-slate-950 text-white overflow-x-hidden`}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-xl font-black text-white">iW</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                INTOWORK
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {['Fonctionnalites', 'Solutions', 'Tarifs', 'Ressources'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-400 hover:text-cyan-400 font-medium transition-all duration-300 text-sm tracking-wide"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden sm:flex items-center space-x-4">
              <Link
                href="/signin"
                className="text-slate-300 hover:text-white font-medium transition-colors px-4 py-2"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="relative group px-6 py-2.5 font-semibold text-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <span className="relative text-white">Commencer</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden pb-6 border-t border-white/5 mt-2 pt-4">
              <div className="flex flex-col space-y-4">
                {['Fonctionnalites', 'Solutions', 'Tarifs', 'Ressources'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-slate-400 hover:text-cyan-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="flex flex-col space-y-3 pt-4 border-t border-white/5">
                  <Link href="/signin" className="text-slate-300 font-medium py-2 text-center">
                    Connexion
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 rounded-full text-center"
                  >
                    Commencer gratuitement
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 lg:pt-52 lg:pb-40 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span className="text-sm font-medium text-slate-300">Propulse par l'IA de nouvelle generation</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tight mb-8">
              <span className="text-white">Le recrutement</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                reinvente par l'IA
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Notre algorithme de matching intelligent connecte les meilleurs talents
              aux entreprises les plus innovantes d'Afrique.{' '}
              <span className="text-cyan-400">En quelques secondes.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/signup"
                className="group relative px-8 py-4 font-bold text-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <span className="relative flex items-center justify-center space-x-2 text-white">
                  <span>Demarrer gratuitement</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              <button
                type="button"
                className="group px-8 py-4 font-semibold text-lg rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <span className="flex items-center justify-center space-x-2 text-slate-300">
                  <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>Voir la demo</span>
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: '10K+', label: 'Candidats actifs', color: 'cyan' },
                { value: '500+', label: 'Entreprises', color: 'purple' },
                { value: '95%', label: 'Satisfaction', color: 'pink' },
                { value: '48h', label: 'Temps moyen matching', color: 'emerald' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-300 bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="relative py-24 sm:py-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold mb-6">
              Fonctionnalites
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Technologie de pointe
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Des outils puissants pour transformer votre processus de recrutement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🧠',
                title: 'Matching IA',
                description: 'Algorithme de deep learning pour des correspondances parfaites entre candidats et postes.',
                gradient: 'from-cyan-500 to-blue-500',
              },
              {
                icon: '📄',
                title: 'CV Builder Pro',
                description: 'Creez des CV professionnels avec nos templates optimises pour l\'ATS.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: '📊',
                title: 'Analytics Avances',
                description: 'Tableaux de bord en temps reel pour suivre vos performances de recrutement.',
                gradient: 'from-emerald-500 to-cyan-500',
              },
              {
                icon: '🔔',
                title: 'Alertes Intelligentes',
                description: 'Notifications en temps reel pour ne jamais manquer une opportunite.',
                gradient: 'from-orange-500 to-red-500',
              },
              {
                icon: '🔒',
                title: 'Securite Enterprise',
                description: 'Chiffrement de bout en bout et conformite RGPD garantie.',
                gradient: 'from-slate-500 to-slate-400',
              },
              {
                icon: '🌍',
                title: 'Reseau Africain',
                description: 'Acces au plus grand reseau de talents et d\'entreprises en Afrique.',
                gradient: 'from-yellow-500 to-orange-500',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 sm:py-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold mb-6">
              Comment ca marche
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              3 etapes simples
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Creez votre profil', desc: 'Renseignez vos informations et importez votre CV en quelques clics.' },
              { step: '02', title: 'Notre IA analyse', desc: 'Notre algorithme trouve les meilleures correspondances pour vous.' },
              { step: '03', title: 'Connectez-vous', desc: 'Postulez ou recrutez directement depuis la plateforme.' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-8xl font-black text-white/5 absolute -top-4 -left-2">{item.step}</div>
                <div className="relative pt-12 pl-4">
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-slate-700">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-3xl opacity-50"></div>
            <div className="relative p-12 sm:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Pret a transformer votre recrutement ?
              </h2>
              <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
                Rejoignez les milliers de professionnels qui ont deja fait le choix de l'excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  Commencer gratuitement
                </Link>
                <button
                  type="button"
                  className="px-8 py-4 bg-white/10 text-white font-semibold text-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Contacter les ventes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                  <span className="text-xl font-black text-white">iW</span>
                </div>
                <span className="text-xl font-bold text-white">INTOWORK</span>
              </div>
              <p className="text-slate-500 text-sm">
                Plateforme de recrutement IA pour l'Afrique
              </p>
            </div>

            {[
              { title: 'Produit', links: ['Fonctionnalites', 'Tarifs', 'API', 'Integrations'] },
              { title: 'Entreprise', links: ['A propos', 'Carrieres', 'Blog', 'Contact'] },
              { title: 'Legal', links: ['Confidentialite', 'CGU', 'Cookies', 'RGPD'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-white mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 INTOWORK. Tous droits reserves.
            </p>
            <div className="flex items-center space-x-6">
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a key={social} href="#" className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
