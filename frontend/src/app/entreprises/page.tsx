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
});

interface Company {
  id: number;
  name: string;
  industry?: string;
  city?: string;
  country?: string;
  size?: string;
  description?: string;
  website_url?: string;
  total_jobs?: number;
  logo_url?: string;
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

  // Charger les entreprises depuis l'API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/companies/public`);
        
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies || []);
          setTotalCompanies(data.total_companies || 0);
        } else {
          console.error('Erreur lors du chargement des entreprises');
        }
      } catch (error) {
        console.error('Erreur:', error);
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
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-green-600 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-900">INTOWORK</span>
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
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 bg-linear-to-br from-green-50 via-blue-50 to-purple-50">
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
                <div className={`text-3xl sm:text-4xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
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
          
          {!loading && filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune entreprise trouvée</h3>
              <p className="text-slate-600">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
          
          {!loading && filteredCompanies.length > 0 && (
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
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
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
      <section className="py-16 sm:py-24 bg-linear-to-br from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Votre entreprise recrute ?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez les 500+ entreprises qui utilisent INTOWORK pour trouver leurs talents
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn bg-white text-green-600 hover:bg-slate-50 btn-lg rounded-full px-8 normal-case font-bold">
              Créer un compte entreprise
            </Link>
            <Link href="/signin" className="btn btn-outline border-2 border-white text-white hover:bg-white hover:text-green-600 btn-lg rounded-full px-8 normal-case font-semibold">
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
