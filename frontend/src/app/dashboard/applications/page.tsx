'use client';

/**
 * Page des candidatures (Candidat)
 * 
 * Migrée vers React Query pour meilleures performances
 * - Cache automatique (5 min)
 * - Pas de rechargements excessifs
 * - Retry automatique en cas d'erreur
 */

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useMyApplications, useWithdrawApplication } from '@/hooks';
import {
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  BriefcaseIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function ApplicationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  // Utiliser React Query hook
  const {
    data,
    isLoading: loading,
    isError,
    error: queryError,
    refetch
  } = useMyApplications(currentPage, limit);

  // Mutation pour retirer une candidature
  const withdrawMutation = useWithdrawApplication();

  // Extraire les données
  const applications = data?.applications || [];
  const totalPages = data?.total_pages || 0;
  const totalApplications = data?.total || 0;
  const error = isError ? (queryError as any)?.message || 'Erreur lors du chargement' : null;

  // Retirer une candidature
  const handleWithdrawApplication = async (applicationId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette candidature ?')) {
      return;
    }

    withdrawMutation.mutate(applicationId, {
      onSuccess: () => {
        // React Query va automatiquement refetch
        refetch();
      }
    });
  };

  // Icône et couleur selon le statut
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'applied':
      case 'pending':
        return {
          icon: <ClockIcon className="w-5 h-5" />,
          label: 'En attente',
          color: 'text-yellow-600 bg-yellow-100'
        };
      case 'viewed':
        return {
          icon: <EyeIcon className="w-5 h-5" />,
          label: 'Vue',
          color: 'text-blue-600 bg-blue-100'
        };
      case 'shortlisted':
        return {
          icon: <CheckCircleIcon className="w-5 h-5" />,
          label: 'Présélectionné',
          color: 'text-purple-600 bg-purple-100'
        };
      case 'interview':
        return {
          icon: <EyeIcon className="w-5 h-5" />,
          label: 'Entretien',
          color: 'text-indigo-600 bg-indigo-100'
        };
      case 'accepted':
        return {
          icon: <CheckCircleIcon className="w-5 h-5" />,
          label: 'Acceptée',
          color: 'text-green-600 bg-green-100'
        };
      case 'rejected':
        return {
          icon: <XCircleIcon className="w-5 h-5" />,
          label: 'Rejetée',
          color: 'text-red-600 bg-red-100'
        };
      default:
        return {
          icon: <ExclamationTriangleIcon className="w-5 h-5" />,
          label: status,
          color: 'text-gray-600 bg-gray-100'
        };
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
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
              onClick={() => refetch()}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes candidatures</h1>
              <p className="text-gray-600">
                Suivez l'évolution de vos {totalApplications} candidature{totalApplications > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-sm font-medium">Mise à jour auto</span>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'applied' || app.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vues</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'viewed' || app.status === 'shortlisted').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Acceptées</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'accepted').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejetées</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des candidatures */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Chargement de vos candidatures...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune candidature</h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore postulé à des offres d'emploi.
            </p>
            <Link 
              href="/dashboard/jobs"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Découvrir les offres
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusInfo = getStatusInfo(application.status);
              
              return (
                <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {application.job.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <BriefcaseIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium mr-4">{application.job.company_name}</span>
                        {application.job.location && (
                          <>
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm mr-4">{application.job.location}</span>
                          </>
                        )}
                        <span className="text-sm px-2 py-1 bg-gray-100 rounded text-gray-700">
                          {getLocationTypeLabel(application.job.location_type)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-4">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm mr-4">Postulé le {formatDate(application.applied_at)}</span>
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {getJobTypeLabel(application.job.job_type)}
                        </span>
                        {application.job.salary_min && (
                          <div className="flex items-center ml-4">
                            <CurrencyEuroIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {application.job.salary_min.toLocaleString()} €
                              {application.job.salary_max && ` - ${application.job.salary_max.toLocaleString()} €`}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {application.notes && (
                        <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                          <strong>Notes:</strong> {application.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      <Link
                        href={`/dashboard/jobs/${application.job.id}`}
                        className="flex items-center gap-1 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                        title="Voir l'offre"
                      >
                        <EyeIcon className="w-5 h-5" />
                        <span>Voir</span>
                      </Link>
                      {(application.status === 'applied' || application.status === 'pending') && (
                        <button
                          onClick={() => handleWithdrawApplication(application.id)}
                          disabled={withdrawMutation.isPending}
                          className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Retirer la candidature"
                        >
                          {withdrawMutation.isPending ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <TrashIcon className="w-5 h-5" />
                          )}
                          <span>Supprimer</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages} ({totalApplications} candidatures au total)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading || withdrawMutation.isPending}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading || withdrawMutation.isPending}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
