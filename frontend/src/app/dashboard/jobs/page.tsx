'use client';

/**
 * Page de recherche d'offres d'emploi - INTOWORK Brand Design
 *
 * Refonte visuelle avec la charte graphique INTOWORK:
 * - Vert: #6B9B5F (couleur principale)
 * - Or: #F7C700 (accent)
 * - Violet: #6B46C1 (secondaire)
 * - Bleu: #3B82F6 (complémentaire)
 */

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import OnboardingTour from '@/components/OnboardingTour';
import { candidateJobSearchTour } from '@/config/onboardingTours';
import { JobFilters, candidatesAPI } from '@/lib/api';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import { useJobs, useMyJobs, useApplyToJob } from '@/hooks';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  CalendarDaysIcon,
  EyeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  HomeIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

interface CV {
  id: number;
  filename: string;
  file_size?: number;
  is_active: boolean;
  created_at: string;
}

export default function JobsPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    limit: 12
  });
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedCVId, setSelectedCVId] = useState<number | null>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  // Déterminer le rôle
  const isEmployer = user?.role === 'employer';

  // Récupérer les jobs selon le rôle (avec React Query)
  const {
    data: jobsData,
    isLoading,
    isError,
    error,
    refetch
  } = isEmployer
    ? useMyJobs(filters, { enabled: isLoaded && !!user })
    : useJobs(filters, { enabled: isLoaded });

  // Mutation pour postuler
  const applyToJob = useApplyToJob();

  // Extraire les données
  const jobs = jobsData?.jobs || [];
  const totalJobs = jobsData?.total || 0;
  const totalPages = jobsData?.total_pages || 0;
  const selectedJob = jobs.find(job => job.id === selectedJobId);

  // Gérer les filtres
  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput, location: locationInput, page: 1 });
  };

  const handleJobTypeFilter = (jobType: string) => {
    setFilters({ ...filters, job_type: jobType || undefined, page: 1 });
  };

  const handleLocationTypeFilter = (locationType: string) => {
    setFilters({ ...filters, location_type: locationType || undefined, page: 1 });
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 });
    setSearchInput('');
    setLocationInput('');
  };

  // Ouvrir le modal de candidature
  const handleApply = async (jobId: number) => {
    setSelectedJobId(jobId);
    setCoverLetter('');
    setSelectedCVId(null);
    setShowApplicationModal(true);
    
    // Charger les CVs du candidat
    if (!isEmployer) {
      await loadCandidateCVs();
    }
  };

  // Charger les CVs du candidat
  const loadCandidateCVs = async () => {
    try {
      setLoadingCVs(true);
      const token = await getToken();
      if (!token) return;

      const cvsData = await candidatesAPI.listCVs(token);
      setCvs(cvsData);
      
      // Pré-sélectionner le CV actif
      const activeCV = cvsData.find(cv => cv.is_active);
      if (activeCV) {
        setSelectedCVId(activeCV.id);
      } else if (cvsData.length > 0) {
        setSelectedCVId(cvsData[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des CVs:', error);
      toast.error('Erreur lors du chargement de vos CVs');
    } finally {
      setLoadingCVs(false);
    }
  };

  // Soumettre la candidature (avec React Query mutation)
  const handleSubmitApplication = () => {
    if (!selectedJobId) return;

    // Vérifier qu'un CV est sélectionné
    if (!selectedCVId && cvs.length > 0) {
      toast.error('Veuillez sélectionner un CV');
      return;
    }

    applyToJob.mutate(
      {
        job_id: selectedJobId,
        cv_id: selectedCVId || undefined,
        cover_letter: coverLetter || undefined
      },
      {
        onSuccess: () => {
          setShowApplicationModal(false);
          setSelectedJobId(null);
          setCoverLetter('');
          setSelectedCVId(null);
        }
      }
    );
  };

  // Formater le salaire
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salaire non précisé';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} €`;
    if (min) return `À partir de ${min.toLocaleString()} €`;
    return `Jusqu'à ${max?.toLocaleString()} €`;
  };

  // Formater la date relative
  const formatRelativeDate = (dateString?: string) => {
    if (!dateString) return 'Date non précisée';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Hier';
    if (diff < 7) return `Il y a ${diff} jours`;
    if (diff < 30) return `Il y a ${Math.floor(diff / 7)} semaine(s)`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Icône et couleur pour le type de lieu
  const getLocationTypeInfo = (locationType: string) => {
    switch (locationType) {
      case 'remote': return { icon: ComputerDesktopIcon, label: 'Télétravail', color: '#6B46C1', bg: 'bg-[#6B46C1]/10' };
      case 'hybrid': return { icon: BriefcaseIcon, label: 'Hybride', color: '#F7C700', bg: 'bg-[#F7C700]/10' };
      default: return { icon: HomeIcon, label: 'Présentiel', color: '#6B9B5F', bg: 'bg-[#6B9B5F]/10' };
    }
  };

  // Info pour le type de contrat
  const getJobTypeInfo = (jobType: string) => {
    switch (jobType) {
      case 'full_time': return { label: 'CDI', color: '#6B9B5F' };
      case 'part_time': return { label: 'Temps partiel', color: '#3B82F6' };
      case 'contract': return { label: 'CDD', color: '#F7C700' };
      case 'temporary': return { label: 'Intérim', color: '#6B46C1' };
      case 'internship': return { label: 'Stage', color: '#EC4899' };
      default: return { label: jobType, color: '#6B9B5F' };
    }
  };

  // Affichage de l'erreur
  if (isError) {
    return (
      <DashboardLayout title="Offres d'emploi" subtitle="Recherchez votre prochain emploi">
        <div className="rounded-3xl p-12 bg-red-50 border border-red-200 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
            <XMarkIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-700 mb-2">Erreur de chargement</h3>
          <p className="text-red-600 mb-6">
            {error instanceof Error ? error.message : 'Erreur lors du chargement des offres'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Offres d'emploi" subtitle={isEmployer ? 'Gérez vos offres publiées' : 'Recherchez votre prochain emploi'}>
      <div className="space-y-8">
        {/* Hero Section avec recherche */}
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6B9B5F] via-[#5a8a4f] to-[#4a7a3f] p-8 shadow-xl shadow-[#6B9B5F]/20"
          style={{ animation: 'fadeIn 0.6s ease-out' }}
        >
          {/* Motifs décoratifs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F7C700]/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <BriefcaseIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-2">
                  <SparklesIcon className="w-4 h-4 text-[#F7C700]" />
                  <span className="text-white/90 text-sm font-medium">
                    {isEmployer ? 'Espace Employeur' : 'Espace Candidat'}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white">
                  {totalJobs} offre{totalJobs > 1 ? 's' : ''} disponible{totalJobs > 1 ? 's' : ''}
                </h2>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Recherche titre */}
                <div className="md:col-span-5 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Titre du poste, entreprise..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
                  />
                </div>

                {/* Localisation */}
                <div className="md:col-span-4 relative">
                  <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Ville, région..."
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
                  />
                </div>

                {/* Bouton recherche */}
                <div className="md:col-span-3">
                  <button
                    onClick={handleSearch}
                    className="w-full py-3.5 rounded-xl font-semibold bg-white text-[#6B9B5F] hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    <span>Rechercher</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div
          data-tour="job-filters"
          className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6"
          style={{ animation: 'fadeIn 0.6s ease-out 0.1s both' }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span>Filtres</span>
            </div>

            {/* Type de contrat */}
            <select
              title="Filtrer par type de contrat"
              value={filters.job_type || ''}
              onChange={(e) => handleJobTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-[#6B9B5F] focus:ring-2 focus:ring-[#6B9B5F]/10 transition-all"
            >
              <option value="">Tous les contrats</option>
              <option value="full_time">CDI</option>
              <option value="part_time">Temps partiel</option>
              <option value="contract">CDD</option>
              <option value="temporary">Intérim</option>
              <option value="internship">Stage</option>
            </select>

            {/* Mode de travail */}
            <select
              title="Filtrer par mode de travail"
              value={filters.location_type || ''}
              onChange={(e) => handleLocationTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-[#6B9B5F] focus:ring-2 focus:ring-[#6B9B5F]/10 transition-all"
            >
              <option value="">Tous les modes</option>
              <option value="on_site">Présentiel</option>
              <option value="remote">Télétravail</option>
              <option value="hybrid">Hybride</option>
            </select>

            {/* Bouton reset */}
            {(filters.search || filters.location || filters.job_type || filters.location_type) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        {/* Résultats */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des offres d'emploi...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div
            className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-16 text-center"
            style={{ animation: 'fadeIn 0.6s ease-out 0.2s both' }}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#6B9B5F]/10 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-12 h-12 text-[#6B9B5F]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune offre trouvée</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Aucune offre d'emploi ne correspond à vos critères actuels. Essayez de modifier vos filtres.
            </p>
            <button
              onClick={clearFilters}
              className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/30 hover:shadow-xl hover:shadow-[#6B9B5F]/40 transition-all"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map((job, index) => {
              const locationInfo = getLocationTypeInfo(job.location_type);
              const jobTypeInfo = getJobTypeInfo(job.job_type);
              const LocationIcon = locationInfo.icon;

              return (
                <div
                  key={job.id}
                  data-tour={index === 0 ? "job-card" : undefined}
                  className="group bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-[#6B9B5F]/10 hover:border-[#6B9B5F]/20 transition-all"
                  style={{ animation: `fadeIn 0.4s ease-out ${0.05 * index}s both` }}
                >
                  {/* Header avec logo */}
                  <div className="p-6 pb-0">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-200 group-hover:border-[#6B9B5F]/30 transition-all">
                        {job.company_logo_url ? (
                          <img
                            src={job.company_logo_url}
                            alt={job.company_name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <BuildingOfficeIcon className="w-7 h-7 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#6B9B5F] transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                          {job.is_featured && (
                            <div className="flex-shrink-0 flex items-center gap-1 bg-[#F7C700]/10 text-[#F7C700] text-xs font-semibold px-2 py-1 rounded-full">
                              <StarIcon className="w-3 h-3" />
                              <span>Top</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{job.company_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {job.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${locationInfo.bg}`}
                        style={{ color: locationInfo.color }}
                      >
                        <LocationIcon className="w-3.5 h-3.5" />
                        {locationInfo.label}
                      </span>
                      <span
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: `${jobTypeInfo.color}15`, color: jobTypeInfo.color }}
                      >
                        {jobTypeInfo.label}
                      </span>
                    </div>

                    {/* Détails */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{job.location || 'Localisation non précisée'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <CurrencyEuroIcon className="w-4 h-4 flex-shrink-0" />
                        <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          {job.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          {job.applications_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {formatRelativeDate(job.posted_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action button */}
                    {!isEmployer && (
                      <div className="mt-4">
                        {job.has_applied ? (
                          <button
                            disabled
                            className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <CheckBadgeIcon className="w-5 h-5" />
                            <span>Candidature envoyée</span>
                          </button>
                        ) : (
                          <button
                            data-tour="apply-button"
                            onClick={() => handleApply(job.id)}
                            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/20 hover:shadow-xl hover:shadow-[#6B9B5F]/30 transition-all flex items-center justify-center gap-2"
                          >
                            <PaperAirplaneIcon className="w-5 h-5" />
                            <span>Postuler</span>
                          </button>
                        )}
                      </div>
                    )}

                    {isEmployer && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link
                          href={`/dashboard/job-posts`}
                          className="py-3 rounded-xl font-semibold bg-gradient-to-r from-[#F7C700] to-[#e5b800] text-white shadow-lg shadow-[#F7C700]/20 hover:shadow-xl hover:shadow-[#F7C700]/30 transition-all flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="w-5 h-5" />
                          <span>Gérer</span>
                        </Link>
                        <Link
                          href={`/dashboard/ai-scoring/${job.id}`}
                          className="py-3 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/20 hover:shadow-xl hover:shadow-[#6B9B5F]/30 transition-all flex items-center justify-center gap-2"
                        >
                          <SparklesIcon className="w-5 h-5" />
                          <span>IA</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex justify-center items-center gap-4 pt-4"
            style={{ animation: 'fadeIn 0.6s ease-out 0.3s both' }}
          >
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
              disabled={filters.page === 1}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#6B9B5F] hover:text-[#6B9B5F] transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Précédent</span>
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if ((filters.page || 1) <= 3) {
                  pageNum = i + 1;
                } else if ((filters.page || 1) >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = (filters.page || 1) - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setFilters({ ...filters, page: pageNum })}
                    className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                      filters.page === pageNum
                        ? 'bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/30'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#6B9B5F] hover:text-[#6B9B5F]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setFilters({ ...filters, page: Math.min(totalPages, (filters.page || 1) + 1) })}
              disabled={filters.page === totalPages}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#6B9B5F] hover:text-[#6B9B5F] transition-all"
            >
              <span>Suivant</span>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal de candidature */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#6B9B5F]/5 to-transparent">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6B9B5F] to-[#5a8a4f] flex items-center justify-center shadow-lg shadow-[#6B9B5F]/30">
                  <PaperAirplaneIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Postuler pour ce poste
                  </h2>
                  <p className="text-gray-500">{selectedJob.title}</p>
                  <p className="text-[#6B9B5F] font-medium">{selectedJob.company_name}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Info box */}
              <div className="bg-[#F7C700]/10 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-[#F7C700] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700 font-medium">Votre profil sera automatiquement partagé</p>
                  <p className="text-sm text-gray-500">Les recruteurs verront votre CV et vos informations de profil.</p>
                </div>
              </div>

              {/* Sélection du CV */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📄 Sélectionnez un CV
                </label>
                
                {loadingCVs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : cvs.length === 0 ? (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800 mb-2">
                      ⚠️ Aucun CV uploadé. Vous devez d&apos;abord ajouter un CV.
                    </p>
                    <Link 
                      href="/dashboard/cv" 
                      className="text-sm font-semibold text-[#6B9B5F] hover:text-[#5a8a4f] underline"
                    >
                      → Ajouter un CV maintenant
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cvs.map(cv => (
                      <label 
                        key={cv.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedCVId === cv.id 
                            ? 'border-[#6B9B5F] bg-[#6B9B5F]/5 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cv"
                          checked={selectedCVId === cv.id}
                          onChange={() => setSelectedCVId(cv.id)}
                          className="w-5 h-5 text-[#6B9B5F] focus:ring-[#6B9B5F] cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{cv.filename}</p>
                          <p className="text-sm text-gray-500">
                            Uploadé le {new Date(cv.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        {cv.is_active && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            ✓ Principal
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover letter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lettre de motivation (optionnel)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={8}
                  placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-4">
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setSelectedJobId(null);
                  setCoverLetter('');
                }}
                disabled={applyToJob.isPending}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={applyToJob.isPending}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/30 hover:shadow-xl hover:shadow-[#6B9B5F]/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {applyToJob.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    <span>Envoyer ma candidature</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Système d'onboarding */}
      {!isEmployer && (
        <OnboardingTour
          tourId="candidate-job-search"
          steps={candidateJobSearchTour}
        />
      )}

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
