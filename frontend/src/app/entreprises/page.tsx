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

        // Utiliser l'URL de l'API depuis les variables d'environnement
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        if (!apiUrl) {
          setError('Configuration API manquante. Veuillez vérifier votre fichier .env.local');
          setLoading(false);
          return;
        }

        console.log('🏢 Fetching companies from:', `${apiUrl}/companies/`); // Debug

        // Récupérer les entreprises directement depuis l'endpoint dédié
        const response = await fetch(`${apiUrl}/companies/?limit=100`);

        console.log('📊 Response status:', response.status); // Debug

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Data received:', data); // Debug

          // Les entreprises sont déjà dans le bon format
          setCompanies(data.companies || []);
          setTotalCompanies(data.total || 0);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Logo et description */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo-intowork.png" 
                  alt="INTOWORK" 
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">INTOWORK</h3>
                  <p className="text-xs text-slate-400">Executive Search by H&C</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Votre partenaire de confiance pour le recrutement de cadres dirigeants en Afrique francophone, au Maghreb et au Moyen-Orient.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-green-400 transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-green-400 transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-green-400 transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Entreprises */}
            <div>
              <h4 className="text-base font-bold text-white mb-4">Entreprises</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/signup" className="text-slate-400 hover:text-green-400 transition-colors">
                    Compte Entreprise
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-slate-400 hover:text-green-400 transition-colors">
                    Publier une offre
                  </Link>
                </li>
                <li>
                  <Link href="/entreprises" className="text-slate-400 hover:text-green-400 transition-colors">
                    Recherche de talents
                  </Link>
                </li>
                <li>
                  <a href="#premium" className="text-slate-400 hover:text-green-400 transition-colors">
                    Solutions Premium
                  </a>
                </li>
                <li>
                  <a href="#ressources" className="text-slate-400 hover:text-green-400 transition-colors">
                    Ressources employeurs
                  </a>
                </li>
              </ul>
            </div>

            {/* Candidats */}
            <div>
              <h4 className="text-base font-bold text-white mb-4">Candidats</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/signup" className="text-slate-400 hover:text-green-400 transition-colors">
                    Compte Candidat
                  </Link>
                </li>
                <li>
                  <Link href="/offres" className="text-slate-400 hover:text-green-400 transition-colors">
                    Rechercher un emploi
                  </Link>
                </li>
                <li>
                  <a href="#conseils" className="text-slate-400 hover:text-green-400 transition-colors">
                    Conseils carrière
                  </a>
                </li>
                <li>
                  <a href="#premium" className="text-slate-400 hover:text-green-400 transition-colors">
                    Devenir Premium
                  </a>
                </li>
                <li>
                  <Link href="/cv-builder" className="text-slate-400 hover:text-green-400 transition-colors">
                    Créateur de CV
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className="text-base font-bold text-white mb-4">Contact & Support</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#apropos" className="text-slate-400 hover:text-green-400 transition-colors">
                    À propos de nous
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-slate-400 hover:text-green-400 transition-colors">
                    Contactez-nous
                  </a>
                </li>
                <li>
                  <a href="mailto:support@intowork.com" className="text-slate-400 hover:text-green-400 transition-colors">
                    support@intowork.com
                  </a>
                </li>
                <li>
                  <a href="tel:+33123456789" className="text-slate-400 hover:text-green-400 transition-colors">
                    +33 1 23 45 67 89
                  </a>
                </li>
                <li className="text-slate-400 text-xs leading-relaxed pt-2">
                  123 Avenue des Champs-Élysées<br />
                  75008 Paris, France
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-400 text-center md:text-left">
                © 2025 INTOWORK Executive Search by H&C. Tous droits réservés.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <a href="#confidentialite" className="text-slate-400 hover:text-green-400 transition-colors">
                  Politique de confidentialité
                </a>
                <a href="#conditions" className="text-slate-400 hover:text-green-400 transition-colors">
                  Conditions d'utilisation
                </a>
                <a href="#cookies" className="text-slate-400 hover:text-green-400 transition-colors">
                  Politique des cookies
                </a>
                <a href="#sitemap" className="text-slate-400 hover:text-green-400 transition-colors">
                  Plan du site
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
