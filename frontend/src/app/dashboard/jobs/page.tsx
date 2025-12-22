'use client';

// Cache buster: 2025-12-18-15h00

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { jobsAPI, Job, JobFilters, applicationsAPI } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  CalendarDaysIcon,
  EyeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  HomeIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function JobsPage() {
  const { getToken } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    limit: 12
  });
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  // Charger les offres d'emploi
  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsAPI.getJobs(filters);
      setJobs(response.jobs);
      setTotalJobs(response.total);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError('Erreur lors du chargement des offres d\'emploi');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [filters]);

  // Polling automatique toutes les 30 secondes pour les mises à jour en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Recharger silencieusement sans afficher le loader
      jobsAPI.getJobs(filters).then(response => {
        setJobs(response.jobs);
        setTotalJobs(response.total);
        setTotalPages(response.total_pages);
      }).catch(err => {
        console.error('Erreur lors du rafraîchissement automatique:', err);
      });
    }, 30000); // 30 secondes

    // Nettoyer l'interval quand le composant est démonté
    return () => clearInterval(interval);
  }, [filters]);

  // Gérer les filtres
  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleLocationFilter = (location: string) => {
    setFilters({ ...filters, location, page: 1 });
  };

  const handleJobTypeFilter = (jobType: string) => {
    setFilters({ ...filters, job_type: jobType, page: 1 });
  };

  const handleLocationTypeFilter = (locationType: string) => {
    setFilters({ ...filters, location_type: locationType, page: 1 });
  };

  // Formater le salaire
  const formatSalary = (min?: number, max?: number, currency: string = 'EUR') => {
    if (!min && !max) return 'Salaire non précisé';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} €`;
    if (min) return `À partir de ${min.toLocaleString()} €`;
    return `Jusqu'à ${max?.toLocaleString()} €`;
  };

  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date non précisée';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Icône pour le type de lieu
  const getLocationTypeIcon = (locationType: string) => {
    switch (locationType) {
      case 'remote': return <ComputerDesktopIcon className="w-4 h-4" />;
      case 'hybrid': return <BriefcaseIcon className="w-4 h-4" />;
      default: return <HomeIcon className="w-4 h-4" />;
    }
  };

  // Ouvrir le modal de candidature
  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setCoverLetter('');
    setShowApplicationModal(true);
  };

  // Soumettre la candidature
  const handleSubmitApplication = async () => {
    if (!selectedJob) return;

    try {
      setApplying(true);
      const token = await getToken();
      if (!token) {
        alert('Vous devez être connecté pour postuler');
        return;
      }

      await applicationsAPI.applyToJob(token, {
        job_id: selectedJob.id,
        cover_letter: coverLetter || undefined
      });

      alert('✅ Candidature envoyée avec succès !');
      setShowApplicationModal(false);
      setSelectedJob(null);
      setCoverLetter('');
      
      // Recharger automatiquement les jobs pour mettre à jour le bouton
      loadJobs();
    } catch (error: any) {
      console.error('Erreur lors de la candidature:', error);
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('déjà postulé')) {
        alert('❌ Vous avez déjà postulé à cette offre');
      } else {
        alert('❌ Erreur lors de l\'envoi de la candidature');
      }
    } finally {
      setApplying(false);
    }
  };

  // Libellé pour le type de lieu
  const getLocationTypeLabel = (locationType: string) => {
    switch (locationType) {
      case 'remote': return 'Télétravail';
      case 'hybrid': return 'Hybride';
      case 'on_site': return 'Présentiel';
      default: return locationType;
    }
  };

  // Libellé pour le type de contrat
  const getJobTypeLabel = (jobType: string) => {
    switch (jobType) {
      case 'full_time': return 'CDI';
      case 'part_time': return 'Temps partiel';
      case 'contract': return 'Contrat';
      case 'temporary': return 'Temporaire';
      case 'internship': return 'Stage';
      default: return jobType;
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">⚠️ {error}</div>
            <button 
              onClick={loadJobs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Recherche d'emplois</h1>
              <p className="text-gray-600">
                Découvrez {totalJobs} offre{totalJobs > 1 ? 's' : ''} d'emploi qui correspondent à votre profil
              </p>
            </div>
            {/* Badge En direct */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-sm font-medium text-green-700">Mises à jour en direct</span>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Titre du poste, entreprise..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Localisation */}
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ville, région..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                onChange={(e) => handleLocationFilter(e.target.value)}
              />
            </div>

            {/* Type de contrat */}
            <select
              title="Filtrer par type de contrat"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              onChange={(e) => handleJobTypeFilter(e.target.value)}
            >
              <option value="">Tous les contrats</option>
              <option value="full_time">CDI</option>
              <option value="part_time">Temps partiel</option>
              <option value="contract">Contrat</option>
              <option value="temporary">Temporaire</option>
              <option value="internship">Stage</option>
            </select>

            {/* Mode de travail */}
            <select
              title="Filtrer par mode de travail"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              onChange={(e) => handleLocationTypeFilter(e.target.value)}
            >
              <option value="">Tous les modes</option>
              <option value="on_site">Présentiel</option>
              <option value="remote">Télétravail</option>
              <option value="hybrid">Hybride</option>
            </select>
          </div>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Chargement des offres d'emploi...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
            <p className="text-gray-600 mb-6">
              Aucune offre d'emploi ne correspond à vos critères actuels.
            </p>
            <button 
              onClick={() => setFilters({ page: 1, limit: 12 })}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 relative"
              >
                {/* Badge Featured */}
                {job.is_featured && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      <StarIcon className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  </div>
                )}

                {/* Logo entreprise */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {job.company_logo_url ? (
                      <img 
                        src={job.company_logo_url} 
                        alt={job.company_name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <BriefcaseIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company_name}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {job.description}
                </p>

                {/* Détails du poste */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{job.location || 'Localisation non précisée'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {getLocationTypeIcon(job.location_type)}
                    <span>{getLocationTypeLabel(job.location_type)}</span>
                    <span className="text-gray-400">•</span>
                    <span>{getJobTypeLabel(job.job_type)}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CurrencyEuroIcon className="w-4 h-4" />
                    <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
                  </div>
                </div>

                {/* Stats et date */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{job.views_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{job.applications_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>{formatDate(job.posted_at)}</span>
                  </div>
                </div>

                {/* Bouton d'action */}
                <div className="mt-4">
                  {job.has_applied ? (
                    <button 
                      disabled
                      className="w-full bg-gray-400 text-white font-medium py-2 px-4 rounded-lg cursor-not-allowed"
                    >
                      Déjà postulé ✓
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(job)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Postuler
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
              disabled={filters.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {filters.page} sur {totalPages}
            </span>
            
            <button
              onClick={() => setFilters({ ...filters, page: Math.min(totalPages, (filters.page || 1) + 1) })}
              disabled={filters.page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Modal de candidature */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Postuler à cette offre</h3>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fermer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Détails de l'offre */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 text-lg mb-2">{selectedJob.title}</h4>
                <p className="text-gray-600 mb-1">{selectedJob.company_name}</p>
                <p className="text-gray-600">{selectedJob.location}</p>
                {selectedJob.salary_min && (
                  <p className="text-blue-600 font-medium mt-2">
                    {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}
                  </p>
                )}
              </div>

              {/* Lettre de motivation */}
              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                  Lettre de motivation (optionnel)
                </label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={8}
                  placeholder="Expliquez pourquoi vous êtes intéressé par ce poste..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Informations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Astuce :</strong> Une lettre de motivation personnalisée augmente vos chances d'être sélectionné !
                </p>
              </div>

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={applying}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitApplication}
                  disabled={applying}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
