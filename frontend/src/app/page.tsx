'use client';

import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className={`${plusJakarta.variable} font-sans`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                INTOWORK
              </span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-base-content/70 hover:text-primary font-medium transition-colors">
                Fonctionnalités
              </a>
              <a href="#how-it-works" className="text-base-content/70 hover:text-primary font-medium transition-colors">
                Comment ça marche
              </a>
              <a href="#testimonials" className="text-base-content/70 hover:text-primary font-medium transition-colors">
                Témoignages
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-base-content/80 hover:text-primary font-semibold transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="btn btn-primary rounded-full px-6 normal-case font-semibold"
              >
                Inscription gratuite
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-fade-in animation-delay-100">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-primary">Matching IA nouvelle génération</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight animate-fade-in animation-delay-200">
                Recrutez les meilleurs talents.{' '}
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Trouvez votre emploi idéal.
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-base-content/70 leading-relaxed max-w-2xl animate-fade-in animation-delay-300">
                La plateforme de recrutement B2B2C qui connecte candidats et entreprises grâce à l'intelligence artificielle.
                Un matching précis, des processus simplifiés, des résultats concrets.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animation-delay-400">
                <Link
                  href="/auth/signup"
                  className="btn btn-primary btn-lg rounded-full px-8 normal-case text-lg font-semibold group"
                >
                  Commencer gratuitement
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <button className="btn btn-outline btn-lg rounded-full px-8 normal-case text-lg font-semibold">
                  Voir la démo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 animate-fade-in animation-delay-500">
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">10K+</div>
                  <div className="text-sm text-base-content/60 mt-1">Candidats actifs</div>
                </div>
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">500+</div>
                  <div className="text-sm text-base-content/60 mt-1">Entreprises</div>
                </div>
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">95%</div>
                  <div className="text-sm text-base-content/60 mt-1">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative animate-fade-in animation-delay-300">
              {/* Floating Cards */}
              <div className="relative h-[600px]">
                {/* Card 1 - Job Posting */}
                <div className="absolute top-0 right-0 w-80 bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="badge badge-success gap-2">
                      <span className="w-1.5 h-1.5 bg-success-content rounded-full"></span>
                      Actif
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Développeur Full-Stack</h3>
                  <p className="text-sm text-base-content/60 mb-4">Paris • CDI • 50-65K€</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="badge badge-primary badge-sm">React</span>
                    <span className="badge badge-primary badge-sm">Node.js</span>
                    <span className="badge badge-primary badge-sm">TypeScript</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-base-100"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary border-2 border-base-100"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary border-2 border-base-100 flex items-center justify-center text-xs font-bold text-white">+12</div>
                    </div>
                    <span className="text-sm font-semibold text-primary">14 candidats</span>
                  </div>
                </div>

                {/* Card 2 - Candidate Profile */}
                <div className="absolute top-48 left-0 w-72 bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 hover:shadow-accent/20 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-secondary"></div>
                    <div>
                      <h3 className="font-bold">Marie Dubois</h3>
                      <p className="text-sm text-base-content/60">Product Designer</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-base-content/60">Match IA</span>
                      <span className="font-bold text-accent">96%</span>
                    </div>
                    <div className="w-full bg-base-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-accent to-secondary h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="badge badge-outline badge-sm">UI/UX</span>
                      <span className="badge badge-outline badge-sm">Figma</span>
                      <span className="badge badge-outline badge-sm">Webflow</span>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Notification */}
                <div className="absolute bottom-0 right-8 w-80 bg-white rounded-3xl shadow-2xl p-5 border border-slate-200 hover:shadow-secondary/20 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">Nouvelle candidature</h4>
                      <p className="text-xs text-base-content/60">Thomas Martin a postulé pour le poste de Data Analyst</p>
                      <div className="text-xs text-primary mt-2">Il y a 2 minutes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="text-sm font-semibold text-accent">Simple et efficace</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
              Un processus en trois étapes pour transformer votre recherche d'emploi ou votre recrutement
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="relative bg-white rounded-3xl p-8 border border-slate-200 hover:border-primary/50 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Créez votre profil</h3>
                <p className="text-base-content/70 leading-relaxed">
                  Candidats : Remplissez votre profil, uploadez votre CV.
                  Recruteurs : Présentez votre entreprise et vos besoins.
                </p>
                <div className="mt-6 flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
                  Commencer
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group lg:mt-8">
              <div className="relative bg-white rounded-3xl p-8 border border-slate-200 hover:border-accent/50 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">IA de matching</h3>
                <p className="text-base-content/70 leading-relaxed">
                  Notre intelligence artificielle analyse les profils et les offres pour créer des matchs parfaits basés sur les compétences, l'expérience et les aspirations.
                </p>
                <div className="mt-6 flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
                  Découvrir
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group lg:mt-16">
              <div className="relative bg-white rounded-3xl p-8 border border-slate-200 hover:border-secondary/50 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Connectez-vous</h3>
                <p className="text-base-content/70 leading-relaxed">
                  Candidats : Postulez en un clic.
                  Recruteurs : Organisez vos entretiens directement depuis la plateforme.
                </p>
                <div className="mt-6 flex items-center text-secondary font-semibold group-hover:translate-x-2 transition-transform">
                  Explorer
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-sm font-semibold text-primary">Fonctionnalités</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Une plateforme complète pour tous
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Candidates Card */}
            <div className="relative group">
              <div className="relative bg-white rounded-3xl p-10 border border-slate-200 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold">Pour les candidats</h3>
                </div>

                <div className="space-y-4">
                  {[
                    'Profil professionnel complet et CV en ligne',
                    'Recommandations d\'emplois personnalisées par IA',
                    'Candidature en un clic avec suivi en temps réel',
                    'Notifications instantanées des nouvelles opportunités',
                    'Dashboard de suivi de toutes vos candidatures'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 group/item">
                      <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-primary transition-colors">
                        <svg className="w-4 h-4 text-primary group-hover/item:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-base-content/80 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/auth/signup" className="btn btn-primary mt-8 rounded-full px-8 normal-case font-semibold">
                  Créer mon profil candidat
                </Link>
              </div>
            </div>

            {/* Employers Card */}
            <div className="relative group">
              <div className="relative bg-white rounded-3xl p-10 border border-slate-200 hover:border-accent/50 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                    <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold">Pour les recruteurs</h3>
                </div>

                <div className="space-y-4">
                  {[
                    'Publication d\'offres d\'emploi illimitées',
                    'ATS intégré pour gérer toutes vos candidatures',
                    'Matching IA des candidats les plus pertinents',
                    'Planification d\'entretiens et suivi des processus',
                    'Analytiques et statistiques de recrutement avancées'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 group/item">
                      <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-accent transition-colors">
                        <svg className="w-4 h-4 text-accent group-hover/item:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-base-content/80 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/auth/signup" className="btn btn-accent mt-8 rounded-full px-8 normal-case font-semibold">
                  Créer mon espace recruteur
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-bold text-lg mb-2">100% Sécurisé</h4>
              <p className="text-sm text-base-content/70">Vos données sont protégées avec un cryptage de niveau bancaire.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-accent/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-bold text-lg mb-2">Ultra Rapide</h4>
              <p className="text-sm text-base-content/70">Matching en temps réel grâce à notre infrastructure optimisée.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-secondary/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-lg mb-2">Support 24/7</h4>
              <p className="text-sm text-base-content/70">Notre équipe est disponible pour vous accompagner à tout moment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <span className="text-sm font-semibold text-secondary">Témoignages</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
              Des milliers de candidats et d'entreprises utilisent INTOWORK pour transformer leur recrutement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-warning fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-base-content/80 mb-6 leading-relaxed">
                "J'ai trouvé mon emploi de rêve en moins de deux semaines ! Le système de matching est vraiment impressionnant."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent"></div>
                <div>
                  <div className="font-bold">Sophie Martin</div>
                  <div className="text-sm text-base-content/60">UX Designer</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-warning fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-base-content/80 mb-6 leading-relaxed">
                "En tant que recruteur, INTOWORK a transformé notre processus. Nous gagnons un temps précieux sur chaque embauche."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-secondary"></div>
                <div>
                  <div className="font-bold">Pierre Durand</div>
                  <div className="text-sm text-base-content/60">RH Manager, TechCorp</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-warning fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-base-content/80 mb-6 leading-relaxed">
                "Interface intuitive, fonctionnalités complètes. C'est exactement ce dont notre startup avait besoin."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary"></div>
                <div>
                  <div className="font-bold">Laura Chen</div>
                  <div className="text-sm text-base-content/60">CEO, Startup Innovante</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-white border-4 border-primary/20 rounded-3xl p-12 lg:p-16 text-center">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
              Prêt à transformer votre{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                carrière ou votre recrutement ?
              </span>
            </h2>
            <p className="text-xl text-base-content/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Rejoignez les milliers de professionnels qui ont déjà fait le choix de l'excellence avec INTOWORK.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="btn btn-primary btn-lg rounded-full px-10 normal-case text-lg font-bold"
              >
                Créer mon compte gratuit
              </Link>
              <button className="btn btn-outline btn-lg rounded-full px-10 normal-case text-lg font-semibold">
                Planifier une démo
              </button>
            </div>
            <p className="text-base-content/60 text-sm mt-6">
              Aucune carte bancaire requise • Essai gratuit • Sans engagement
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral text-neutral-content">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">INTOWORK</span>
              </div>
              <p className="text-neutral-content/70 text-sm leading-relaxed">
                La plateforme de recrutement B2B2C qui connecte talents et opportunités grâce à l'IA.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-neutral-content/70 hover:text-primary transition-colors">Fonctionnalités</a></li>
                <li><a href="#how-it-works" className="text-neutral-content/70 hover:text-primary transition-colors">Comment ça marche</a></li>
                <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Tarifs</a></li>
                <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">À propos</a></li>
                <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Carrières</a></li>
                <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Mentions légales</a></li>
                <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-neutral-content/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-neutral-content/60">
              © 2024 INTOWORK. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
