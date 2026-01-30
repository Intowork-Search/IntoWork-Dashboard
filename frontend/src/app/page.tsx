'use client';

import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { jobsAPI } from '@/lib/api';
import type { Job } from '@/lib/api';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  preload: false, // Only load when this route is accessed
  adjustFontFallback: true,
});

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Array<{ name: string; count: number }>>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Charger les offres en vedette et les entreprises
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingJobs(true);
        console.log('🚀 Début chargement des données...'); // Debug
        
        // Récupérer plus d'offres pour avoir plus de données et plus d'entreprises différentes
        const response = await jobsAPI.getJobs({ 
          limit: 50  // Augmenté de 10 à 50 pour avoir plus d'entreprises
        });
        
        console.log('✅ Response from API:', response); // Debug
        console.log('📊 Total jobs:', response.total); // Debug
        console.log('📋 Jobs array:', response.jobs); // Debug
        
        if (response && response.jobs && Array.isArray(response.jobs) && response.jobs.length > 0) {
          // Prendre les 2 premières offres pour la section vedette
          const featured = response.jobs.slice(0, 2);
          setFeaturedJobs(featured);
          console.log('⭐ Featured jobs set:', featured); // Debug
          
          // Extraire les entreprises uniques avec leur nombre d'offres
          const companyMap = new Map<string, number>();
          response.jobs.forEach(job => {
            const companyName = job.company_name || 'Entreprise';
            companyMap.set(companyName, (companyMap.get(companyName) || 0) + 1);
          });
          
          const companiesList = Array.from(companyMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count) // Trier par nombre d'offres décroissant
            .slice(0, 4); // Prendre 4 entreprises avec le plus d'offres
          
          setCompanies(companiesList);
          console.log('🏢 Companies set:', companiesList); // Debug
        } else {
          console.warn('⚠️ No jobs found in response or invalid format'); // Debug
          console.warn('Response structure:', {
            hasResponse: !!response,
            hasJobs: !!(response && response.jobs),
            isArray: !!(response && Array.isArray(response.jobs)),
            length: response?.jobs?.length
          });
        }
      } catch (error) {
        console.error('❌ Erreur chargement données:', error);
        console.error('Error details:', error instanceof Error ? error.message : error);
      } finally {
        setLoadingJobs(false);
        console.log('✅ Loading finished'); // Debug
      }
    };
    
    loadData();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="loading loading-spinner loading-lg text-(--color-brand-green)"></div>
      </div>
    );
  }

  return (
    <div className={`${plusJakarta.variable} font-sans`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/logo-intowork.png" 
                alt="INTOWORK" 
                className="h-32 sm:h-40 md:h-48 lg:h-56 w-auto"
              />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-green-600 font-medium transition-colors text-sm">
                Fonctionnalités
              </a>
              <Link href="/offres" className="text-slate-600 hover:text-green-600 font-medium transition-colors text-sm">
                Offres
              </Link>
              <Link href="/entreprises" className="text-slate-600 hover:text-green-600 font-medium transition-colors text-sm">
                Entreprises
              </Link>
              <a href="#testimonials" className="text-slate-600 hover:text-green-600 font-medium transition-colors text-sm">
                Témoignages
              </a>
            </div>

            <div className="hidden sm:flex items-center space-x-3 sm:space-x-4">
              <Link href="/signin" className="text-slate-700 hover:text-(--color-brand-green) font-semibold transition-colors text-sm">
                Connexion
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm rounded-full px-4 sm:px-6 normal-case font-semibold text-sm h-9 sm:h-10">
                Inscription
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden pb-4 animate-fade-in">
              <div className="flex flex-col space-y-3">
                <a
                  href="#features"
                  className="text-slate-600 hover:text-green-600 font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fonctionnalités
                </a>
                <Link
                  href="/offres"
                  className="text-slate-600 hover:text-green-600 font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Offres
                </Link>
                <Link
                  href="/entreprises"
                  className="text-slate-600 hover:text-green-600 font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entreprises
                </Link>
                <a
                  href="#testimonials"
                  className="text-slate-600 hover:text-green-600 font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Témoignages
                </a>
                <div className="border-t border-slate-200 pt-3 flex flex-col space-y-2">
                  <Link href="/signin" className="text-slate-700 hover:text-(--color-brand-green) font-semibold transition-colors py-2 text-center">
                    Connexion
                  </Link>
                  <Link href="/signup" className="btn btn-primary rounded-full normal-case font-semibold w-full">
                    Inscription
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-48 lg:pb-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-(--green-100) mb-6 sm:mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-(--color-brand-green) rounded-full"></span>
            <span className="text-xs sm:text-sm font-semibold text-(--color-brand-green)">IA de recrutement nouvelle génération</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-slate-900 mb-6 sm:mb-8 leading-[1.15] sm:leading-[1.1] tracking-tight animate-fade-in animation-delay-100">
            Trouvez votre talent idéal.{' '}
            <span className="text-(--color-brand-green)">Trouvez votre emploi parfait.</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-slate-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
            La plateforme B2B2C qui connecte candidats et entreprises grâce à l'intelligence artificielle pour un matching précis et des résultats concrets.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 animate-fade-in animation-delay-300 px-4 sm:px-0">
            <Link href="/signup" className="btn btn-primary btn-md sm:btn-lg rounded-full px-8 sm:px-10 normal-case font-semibold text-sm sm:text-base">
              Commencer gratuitement
            </Link>
            <button type="button" className="btn bg-white border-2 border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-slate-400 btn-md sm:btn-lg rounded-full px-8 sm:px-10 normal-case font-semibold text-sm sm:text-base transition-all duration-300">
              Voir une démo
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:gap-16 max-w-2xl mx-auto animate-fade-in animation-delay-400">
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-(--color-brand-green) mb-1 sm:mb-2">10K+</div>
              <div className="text-xs sm:text-sm text-slate-600">Candidats</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-(--color-brand-violet) mb-1 sm:mb-2">500+</div>
              <div className="text-xs sm:text-sm text-slate-600">Entreprises</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-(--color-brand-gold) mb-1 sm:mb-2">95%</div>
              <div className="text-xs sm:text-sm text-slate-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 lg:py-32 bg-(--color-brand-green)">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              Simple et efficace
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight px-4">
              Comment ça marche ?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto px-4">
              Trois étapes pour transformer votre recrutement ou votre recherche d'emploi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-(--color-brand-green) flex items-center justify-center mb-5 sm:mb-6 lg:mb-8">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 lg:mb-5">Créez votre profil</h3>
              <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed">
                Candidats : Complétez votre profil et uploadez votre CV. Recruteurs : Présentez votre entreprise et vos besoins.
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-(--color-brand-violet) flex items-center justify-center mb-5 sm:mb-6 lg:mb-8">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 lg:mb-5">IA de matching</h3>
              <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed">
                Notre IA analyse et crée des correspondances parfaites basées sur les compétences, l'expérience et les aspirations.
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-(--color-brand-gold) flex items-center justify-center mb-5 sm:mb-6 lg:mb-8">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">3</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 lg:mb-5">Connectez-vous</h3>
              <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed">
                Candidats : Postulez en un clic. Recruteurs : Organisez vos entretiens directement depuis la plateforme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-(--green-100) text-(--color-brand-green) text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              Fonctionnalités
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 tracking-tight px-4">
              Une plateforme complète
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-4">
              Tout ce dont vous avez besoin pour réussir votre recrutement
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Candidates */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border-2 border-(--green-200) hover:border-(--color-brand-green) transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-(--color-brand-green) flex items-center justify-center mb-5 sm:mb-6 lg:mb-8">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 sm:mb-5 lg:mb-6">Pour les candidats</h3>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  'Profil professionnel complet',
                  'Recommandations IA personnalisées',
                  'Candidature en un clic',
                  'Notifications en temps réel',
                  'Suivi de candidatures'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start space-x-2 sm:space-x-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-(--color-brand-green) shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-700 text-sm sm:text-base lg:text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn btn-primary rounded-full px-6 sm:px-8 mt-6 sm:mt-8 normal-case font-semibold w-full sm:w-auto">
                Créer mon profil
              </Link>
            </div>

            {/* Employers */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border-2 border-(--violet-200) hover:border-(--color-brand-violet) transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-(--color-brand-violet) flex items-center justify-center mb-5 sm:mb-6 lg:mb-8">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 sm:mb-5 lg:mb-6">Pour les recruteurs</h3>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  'Offres d\'emploi illimitées',
                  'ATS intégré',
                  'Matching IA avancé',
                  'Gestion d\'entretiens',
                  'Analytics détaillées'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start space-x-2 sm:space-x-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-(--color-brand-violet) shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-700 text-sm sm:text-base lg:text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn btn-accent rounded-full px-6 sm:px-8 mt-6 sm:mt-8 normal-case font-semibold w-full sm:w-auto">
                Créer mon espace
              </Link>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-(--green-100) flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-(--color-brand-green)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-bold text-base sm:text-lg text-slate-900 mb-1 sm:mb-2">Sécurisé</h4>
              <p className="text-xs sm:text-sm text-slate-600">Cryptage de niveau bancaire</p>
            </div>

            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-(--violet-100) flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-(--color-brand-violet)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-bold text-base sm:text-lg text-slate-900 mb-1 sm:mb-2">Rapide</h4>
              <p className="text-xs sm:text-sm text-slate-600">Matching en temps réel</p>
            </div>

            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-(--gold-100) flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-(--color-brand-gold)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-base sm:text-lg text-slate-900 mb-1 sm:mb-2">Support 24/7</h4>
              <p className="text-xs sm:text-sm text-slate-600">Toujours disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offres en vedette */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-(--color-brand-green)/10 text-(--color-brand-green) text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              Opportunités
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 tracking-tight">
              Offres en vedette
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Découvrez quelques-unes des opportunités disponibles sur notre plateforme
            </p>
          </div>

          {loadingJobs ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-(--color-brand-green) border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8">
              {featuredJobs.map((job) => (
                <Link 
                  key={job.id} 
                  href={`/offres`}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-(--color-brand-green) hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-(--color-brand-green) transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-base sm:text-lg text-slate-600 font-medium">
                        {job.company_name}
                      </p>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-(--color-brand-green)/10 flex items-center justify-center flex-shrink-0 ml-4">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-(--color-brand-green)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    {job.location && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                    )}
                    {job.job_type && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--color-brand-green)/10 text-(--color-brand-green) text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.job_type}
                      </span>
                    )}
                  </div>

                  {job.description && (
                    <p className="text-sm sm:text-base text-slate-600 line-clamp-2 mb-4">
                      {job.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-sm text-slate-500">
                      {job.posted_at ? `Publié le ${new Date(job.posted_at).toLocaleDateString('fr-FR')}` : 'Récent'}
                    </span>
                    <span className="text-(--color-brand-green) font-semibold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Voir l'offre
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8">
              <p className="text-slate-900 font-bold mb-2">Debug Info:</p>
              <p className="text-slate-600">Loading: {loadingJobs ? 'true' : 'false'}</p>
              <p className="text-slate-600">Featured Jobs Count: {featuredJobs.length}</p>
              <p className="text-slate-600 mt-4">Aucune offre disponible pour le moment</p>
              <p className="text-slate-500 text-sm mt-2">Vérifiez la console pour plus de détails</p>
            </div>
          )}

          <div className="text-center">
            <Link href="/offres" className="btn btn-primary btn-lg rounded-full px-8 sm:px-12 normal-case font-bold text-sm sm:text-base">
              Voir toutes les offres
            </Link>
          </div>
        </div>
      </section>

      {/* Entreprises partenaires */}
      <section className="py-16 sm:py-24 lg:py-32 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-(--color-brand-violet)/10 text-(--color-brand-violet) text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              Partenaires
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 tracking-tight">
              Entreprises partenaires
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Des entreprises de confiance qui recrutent sur INTOWORK
            </p>
          </div>

          {loadingJobs ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-(--color-brand-violet) border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : companies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {companies.map((company) => (
                <Link
                  key={company.name}
                  href="/entreprises"
                  className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-slate-200 hover:border-(--color-brand-violet) hover:shadow-xl transition-all duration-300 group text-center"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-(--color-brand-violet) to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-(--color-brand-violet) transition-colors line-clamp-1">
                    {company.name}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 font-medium mb-3">
                    {company.count} offre{company.count > 1 ? 's' : ''}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-(--color-brand-violet) font-semibold text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
                    Voir les offres
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-purple-50 border-2 border-purple-300 rounded-xl p-8">
              <p className="text-slate-900 font-bold mb-2">Debug Info:</p>
              <p className="text-slate-600">Loading: {loadingJobs ? 'true' : 'false'}</p>
              <p className="text-slate-600">Companies Count: {companies.length}</p>
              <p className="text-slate-600 mt-4">Aucune entreprise partenaire pour le moment</p>
              <p className="text-slate-500 text-sm mt-2">Vérifiez la console pour plus de détails</p>
            </div>
          )}

          <div className="text-center">
            <Link href="/entreprises" className="btn bg-(--color-brand-violet) hover:bg-purple-700 text-white btn-lg rounded-full px-8 sm:px-12 normal-case font-bold text-sm sm:text-base border-0">
              Voir toutes les entreprises
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-24 lg:py-32 bg-(--color-brand-violet)">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              Témoignages
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight px-4">
              Ils nous font confiance
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto px-4">
              Des milliers de professionnels utilisent INTOWORK chaque jour
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1 mb-5 sm:mb-6 lg:mb-8">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-warning fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-slate-800 mb-6 sm:mb-8 lg:mb-10 leading-relaxed font-medium">
                "Emploi de rêve trouvé en deux semaines. Le matching IA est impressionnant."
              </p>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-(--color-brand-green) shrink-0"></div>
                <div>
                  <div className="font-bold text-base sm:text-lg text-slate-900">Sophie Martin</div>
                  <div className="text-sm sm:text-base text-slate-600">UX Designer</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1 mb-5 sm:mb-6 lg:mb-8">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-warning fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-slate-800 mb-6 sm:mb-8 lg:mb-10 leading-relaxed font-medium">
                "INTOWORK a transformé notre processus. Gain de temps énorme sur chaque embauche."
              </p>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-(--color-brand-violet) shrink-0"></div>
                <div>
                  <div className="font-bold text-base sm:text-lg text-slate-900">Pierre Durand</div>
                  <div className="text-sm sm:text-base text-slate-600">RH Manager</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1 mb-5 sm:mb-6 lg:mb-8">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-warning fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-slate-800 mb-6 sm:mb-8 lg:mb-10 leading-relaxed font-medium">
                "Interface intuitive, fonctionnalités complètes. Exactement ce qu'il nous fallait."
              </p>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-(--color-brand-gold) shrink-0"></div>
                <div>
                  <div className="font-bold text-base sm:text-lg text-slate-900">Laura Chen</div>
                  <div className="text-sm sm:text-base text-slate-600">CEO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 mb-6 sm:mb-8 tracking-tight">
            Prêt à transformer votre{' '}
            <span className="text-(--color-brand-green) font-extrabold">carrière</span> ?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-700 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Rejoignez les milliers de professionnels qui ont fait le choix de l'excellence avec INTOWORK.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4 sm:px-0">
            <Link href="/signup" className="btn btn-primary btn-md sm:btn-lg rounded-full px-8 sm:px-12 normal-case font-bold text-sm sm:text-base">
              Créer mon compte gratuit
            </Link>
            <button type="button" className="btn bg-white border-2 border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-slate-400 btn-md sm:btn-lg rounded-full px-8 sm:px-12 normal-case font-semibold text-sm sm:text-base transition-all duration-300">
              Planifier une démo
            </button>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm">
            Aucune carte bancaire • Gratuit • Sans engagement
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-block mb-4 sm:mb-6">
                <img 
                  src="/logo-intowork.png" 
                  alt="INTOWORK" 
                  className="h-32 sm:h-40 md:h-48 w-auto"
                />
              </Link>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Plateforme B2B2C de recrutement par IA
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Produit</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#features" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">Fonctionnalités</a></li>
                <li><a href="#how-it-works" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">Comment ça marche</a></li>
                <li><Link href="/cv-builder" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">Créateur de CV</Link></li>
                <li><a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">Tarifs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Entreprise</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">À propos</a></li>
                <li><a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">Carrières</a></li>
                <li><a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Légal</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">Conditions</a></li>
                <li><a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">Confidentialité</a></li>
                <li><a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">Mentions légales</a></li>
                <li><a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs sm:text-sm text-slate-400 text-center md:text-left">
              © 2026 INTOWORK. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-(--color-brand-green) transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
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
