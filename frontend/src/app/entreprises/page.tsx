'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  MapPinIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { getApiUrl } from '@/lib/getApiUrl';

const API_URL = getApiUrl();

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
});

interface Company {
  id: number;
  name: string;
  industry?: string;
  city?: string;
  country?: string;
  size?: string;
  description?: string;
  website_url?: string | null;
  total_jobs?: number;
  logo_url?: string | null;
}

const stats = [
  { label: 'Entreprises partenaires', value: '500+', color: 'from-green-500 to-emerald-600' },
  { label: 'Offres actives', value: '2,500+', color: 'from-blue-500 to-indigo-600' },
  { label: 'Recrutements réussis', value: '10,000+', color: 'from-purple-500 to-pink-600' },
  { label: 'Satisfaction moyenne', value: '4.8/5', color: 'from-amber-500 to-orange-600' },
];

export default function EntreprisesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sectorFilter, setSectorFilter] = useState('all');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Charger les entreprises depuis l'API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Vérifier si l'API URL est configurée
        let apiUrl: string;
        try {
          apiUrl = API_URL;
        } catch {
          setError('Configuration API manquante. Veuillez vérifier votre fichier .env.local');
          setLoading(false);
          return;
        }

        // Récupérer les jobs pour extraire les entreprises
        const response = await fetch(`${apiUrl}/jobs/?page=1&limit=50`);

        if (response.ok) {
          const data = await response.json();

          // Extraire les entreprises uniques des jobs
          const companiesMap = new Map<string, Company>();
          data.jobs.forEach((job: any) => {
            if (job.company_name && !companiesMap.has(job.company_name)) {
              companiesMap.set(job.company_name, {
                id: companiesMap.size + 1,
                name: job.company_name,
                industry: 'Non spécifié',
                city: job.location?.split('/')[0] || job.location || 'Non spécifié',
                country: 'Sénégal',
                size: 'Non spécifié',
                description: `${job.company_name} recrute sur INTOWORK.`,
                website_url: null,
                total_jobs: 0,
                logo_url: job.company_logo_url
              });
            }
            // Compter les jobs par entreprise
            const company = companiesMap.get(job.company_name);
            if (company) {
              company.total_jobs = (company.total_jobs || 0) + 1;
            }
          });

          const companiesArray = Array.from(companiesMap.values());
          setCompanies(companiesArray);
          setTotalCompanies(companiesArray.length);
        } else {
          setError('Erreur lors du chargement des entreprises. Veuillez réessayer.');
          console.error('Erreur API:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = sectorFilter === 'all' 
    ? companies 
    : companies.filter(c => c.industry === sectorFilter);

  const uniqueSectors = ['all', ...Array.from(new Set(companies.map(c => c.industry).filter(Boolean)))];

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getLocation = (company: Company) => {
    if (company.city && company.country) {
      return `${company.city}, ${company.country}`;
    }
    return company.city || company.country || 'France';
  };

  return (
    <div className={`${plusJakarta.variable} font-sans min-h-screen bg-slate-50`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center">
              <img 
                src="/logo-intowork.png" 
                alt="INTOWORK" 
                className="h-32 sm:h-40 md:h-48 lg:h-56 w-auto"
              />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-600 hover:text-green-600 font-medium transition-colors text-sm">
                Accueil
              </Link>
              <Link href="/offres" className="text-slate-600 hover:text-green-600 font-medium transition-colors text-sm">
                Offres
              </Link>
              <Link href="/entreprises" className="text-green-600 font-semibold transition-colors text-sm">
                Entreprises
              </Link>
            </div>

            <div className="hidden sm:flex items-center space-x-3 sm:space-x-4">
              <Link href="/signin" className="text-slate-700 hover:text-green-600 font-semibold transition-colors text-sm">
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
                <Link href="/" className="text-slate-600 hover:text-green-600 font-medium transition-colors py-2">
                  Accueil
                </Link>
                <Link href="/offres" className="text-slate-600 hover:text-green-600 font-medium transition-colors py-2">
                  Offres
                </Link>
                <Link href="/entreprises" className="text-green-600 font-semibold transition-colors py-2">
                  Entreprises
                </Link>
                <div className="border-t border-slate-200 pt-3 flex flex-col space-y-2">
                  <Link href="/signin" className="text-slate-700 hover:text-green-600 font-semibold transition-colors py-2 text-center">
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
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-100 mb-6">
              <CheckBadgeIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-600">Entreprises vérifiées</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
              Les meilleures <span className="text-green-600">entreprises</span> recrutent sur INTOWORK
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto">
              {loading ? 'Chargement...' : `Découvrez les ${totalCompanies} entreprises innovantes qui font confiance à notre plateforme pour trouver leurs talents`}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 text-center border border-slate-200 hover:shadow-lg transition-all"
              >
                <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filtres */}
          {!loading && uniqueSectors.length > 1 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {uniqueSectors.map((sector) => (
                <button
                  key={sector || 'all'}
                  onClick={() => setSectorFilter(sector || 'all')}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    sectorFilter === sector
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {sector === 'all' ? 'Tous les secteurs' : sector}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Liste des entreprises */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-semibold text-red-800 mb-2">Erreur de connexion</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-outline border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {!loading && !error && filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune entreprise trouvée</h3>
              <p className="text-slate-600">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
          
          {!loading && !error && filteredCompanies.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 hover:border-green-500 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.name} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {getCompanyInitials(company.name)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                        {company.name}
                      </h3>
                      <CheckBadgeIcon className="w-6 h-6 text-green-600" />
                    </div>
                    {company.industry && (
                      <p className="text-slate-600 font-medium mb-2">{company.industry}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
                  {company.description || 'Cette entreprise recrute sur INTOWORK.'}
                </p>

                {/* Infos */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{getLocation(company)}</span>
                  </div>
                  {company.size && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{company.size} employés</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                    <BriefcaseIcon className="w-4 h-4" />
                    <span>{company.total_jobs || 0} postes ouverts</span>
                  </div>
                  {company.website_url && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                      <GlobeAltIcon className="w-4 h-4" />
                      <span className="truncate">{company.website_url.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/offres?company=${company.id}`}
                    className="flex-1 btn btn-primary rounded-xl normal-case font-semibold"
                  >
                    Voir les offres
                  </Link>
                  <Link
                    href={`/signin?redirect=/entreprises/${company.id}`}
                    className="btn btn-outline border-2 border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl normal-case font-semibold"
                  >
                    En savoir plus
                  </Link>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-(--color-brand-green)">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Votre entreprise recrute ?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez les entreprises qui utilisent INTOWORK pour trouver leurs talents
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn bg-white text-(--color-brand-green) hover:bg-slate-50 btn-lg rounded-full px-8 normal-case font-bold">
              Créer un compte entreprise
            </Link>
            <Link href="/signin" className="btn btn-outline border-2 border-white text-white hover:bg-white hover:text-(--color-brand-green) btn-lg rounded-full px-8 normal-case font-semibold">
              Se connecter
            </Link>
          </div>
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
                <li><Link href="/#features" className="text-slate-400 hover:text-green-400 transition-colors">Fonctionnalités</Link></li>
                <li><Link href="/#how-it-works" className="text-slate-400 hover:text-green-400 transition-colors">Comment ça marche</Link></li>
                <li><Link href="/offres" className="text-slate-400 hover:text-green-400 transition-colors">Offres</Link></li>
                <li><Link href="/entreprises" className="text-slate-400 hover:text-green-400 transition-colors">Entreprises</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Entreprise</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#" className="text-slate-400 hover:text-green-400 transition-colors">À propos</a></li>
                <li><a href="#" className="text-slate-400 hover:text-green-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-green-400 transition-colors">Carrières</a></li>
                <li><a href="#" className="text-slate-400 hover:text-green-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Légal</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#" className="text-slate-400 hover:text-green-400 transition-colors">Conditions</a></li>
                <li><a href="#" className="text-slate-400 hover:text-green-400 transition-colors">Confidentialité</a></li>
                <li><a href="#" className="text-slate-400 hover:text-green-400 transition-colors">Mentions légales</a></li>
                <li><a href="#" className="text-slate-400 hover:text-green-400 transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs sm:text-sm text-slate-400 text-center md:text-left">
              © 2026 INTOWORK. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <a href="#" className="text-slate-400 hover:text-green-400 transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-green-400 transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-green-400 transition-colors" aria-label="GitHub">
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
