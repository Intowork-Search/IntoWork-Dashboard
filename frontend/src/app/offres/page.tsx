'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { getApiUrl } from '@/lib/getApiUrl';

const API_URL = getApiUrl();

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

interface Job {
  id: number;
  title: string;
  company_name: string;
  company_logo_url: string | null;
  location: string;
  location_type: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  description: string;
  posted_at: string;
  is_featured: boolean;
  views_count: number;
  applications_count: number;
  has_applied: boolean;
}

export default function OffresPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);

  // Charger les offres depuis l'API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/jobs/?page=1&limit=100`);
        
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
          setTotalJobs(data.total || 0);
        } else {
          console.error('Erreur lors du chargement des offres');
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || job.job_type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const formatSalary = (job: Job) => {
    const currency = job.currency === 'XOF' ? 'FCFA' : '€';
    if (job.salary_min && job.salary_max) {
      if (job.currency === 'XOF') {
        return `${(job.salary_min / 1000).toFixed(0)}K - ${(job.salary_max / 1000).toFixed(0)}K FCFA`;
      }
      return `${job.salary_min / 1000}K - ${job.salary_max / 1000}K ${currency}`;
    } else if (job.salary_min) {
      if (job.currency === 'XOF') {
        return `À partir de ${(job.salary_min / 1000).toFixed(0)}K FCFA`;
      }
      return `À partir de ${job.salary_min / 1000}K ${currency}`;
    } else if (job.salary_max) {
      if (job.currency === 'XOF') {
        return `Jusqu'à ${(job.salary_max / 1000).toFixed(0)}K FCFA`;
      }
      return `Jusqu'à ${job.salary_max / 1000}K ${currency}`;
    }
    return 'Salaire non spécifié';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  const formatJobType = (jobType: string) => {
    const types: { [key: string]: string } = {
      'full_time': 'Temps plein',
      'part_time': 'Temps partiel',
      'contract': 'Contrat',
      'temporary': 'Temporaire',
      'internship': 'Stage',
      'freelance': 'Freelance'
    };
    return types[jobType] || jobType;
  };

  const handleJobClick = (jobId: number) => {
    // Rediriger vers la page de connexion avec l'ID de l'offre en paramètre
    router.push(`/signin?redirect=/dashboard/jobs/${jobId}`);
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
              <Link href="/offres" className="text-green-600 font-semibold transition-colors text-sm">
                Offres
              </Link>
              <Link href="/entreprises" className="text-slate-600 hover:text-green-600 font-medium transition-colors text-sm">
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
                <Link href="/offres" className="text-green-600 font-semibold transition-colors py-2">
                  Offres
                </Link>
                <Link href="/entreprises" className="text-slate-600 hover:text-green-600 font-medium transition-colors py-2">
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
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 bg-linear-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
              Découvrez nos <span className="text-green-600">offres d'emploi</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto">
              {loading ? 'Chargement...' : `${filteredJobs.length} opportunité${filteredJobs.length > 1 ? 's' : ''} correspond${filteredJobs.length > 1 ? 'ent' : ''} à votre recherche`}
            </p>
          </div>

          {/* Filtres de recherche */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Poste, mots-clés..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>
              
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ville, région..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                aria-label="Filtrer par type de contrat"
              >
                <option value="all">Tous les types</option>
                <option value="full_time">Temps plein</option>
                <option value="part_time">Temps partiel</option>
                <option value="contract">Contrat</option>
                <option value="temporary">Temporaire</option>
                <option value="internship">Stage</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des offres */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune offre trouvée</h3>
              <p className="text-slate-600">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleJobClick(job.id)}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 hover:border-green-500 hover:shadow-xl transition-all duration-300 cursor-pointer group w-full text-left"
                  type="button"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-linear-to-br from-green-500 to-blue-600 flex items-center justify-center shrink-0">
                          <BuildingOfficeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-base sm:text-lg text-slate-700 font-medium mb-3">
                            {job.company_name || 'Entreprise'}
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-600 mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                          <BriefcaseIcon className="w-4 h-4" />
                          <span>{formatJobType(job.job_type)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                          <CurrencyEuroIcon className="w-4 h-4" />
                          <span>{formatSalary(job)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatDate(job.posted_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-4">
                      <button className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all group-hover:shadow-lg" type="button">
                        <span>Postuler</span>
                        <ArrowRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-linear-to-br from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Prêt à postuler ?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Créez votre compte gratuitement et accédez à toutes nos offres d'emploi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn bg-white text-green-600 hover:bg-slate-50 btn-lg rounded-full px-8 normal-case font-bold">
              Créer mon compte
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
