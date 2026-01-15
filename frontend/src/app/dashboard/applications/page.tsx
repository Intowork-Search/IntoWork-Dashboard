'use client';

/**
 * Page des candidatures (Candidat) - INTOWORK Brand Design
 *
 * Refonte visuelle avec la charte graphique INTOWORK:
 * - Vert: #6B9B5F (couleur principale)
 * - Or: #F7C700 (accent)
 * - Violet: #6B46C1 (secondaire)
 * - Bleu: #3B82F6 (complémentaire)
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
  ExclamationTriangleIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function ApplicationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
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

  // Filtrer par statut
  const filteredApplications = selectedStatus
    ? applications.filter(app => app.status === selectedStatus)
    : applications;

  // Statistiques
  const stats = {
    pending: applications.filter(app => app.status === 'applied' || app.status === 'pending').length,
    viewed: applications.filter(app => app.status === 'viewed' || app.status === 'shortlisted').length,
    interview: applications.filter(app => app.status === 'interview').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  // Retirer une candidature
  const handleWithdrawApplication = async (applicationId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette candidature ?')) {
      return;
    }

    withdrawMutation.mutate(applicationId, {
      onSuccess: () => {
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
          icon: ClockIcon,
          label: 'En attente',
          color: '#F7C700',
          bg: 'bg-[#F7C700]/10',
          border: 'border-[#F7C700]/20'
        };
      case 'viewed':
        return {
          icon: EyeIcon,
          label: 'Consultée',
          color: '#3B82F6',
          bg: 'bg-[#3B82F6]/10',
          border: 'border-[#3B82F6]/20'
        };
      case 'shortlisted':
        return {
          icon: StarIcon,
          label: 'Présélectionné',
          color: '#6B46C1',
          bg: 'bg-[#6B46C1]/10',
          border: 'border-[#6B46C1]/20'
        };
      case 'interview':
        return {
          icon: ChatBubbleLeftRightIcon,
          label: 'Entretien',
          color: '#6B46C1',
          bg: 'bg-[#6B46C1]/10',
          border: 'border-[#6B46C1]/20'
        };
      case 'accepted':
        return {
          icon: CheckCircleIcon,
          label: 'Acceptée',
          color: '#6B9B5F',
          bg: 'bg-[#6B9B5F]/10',
          border: 'border-[#6B9B5F]/20'
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          label: 'Rejetée',
          color: '#EF4444',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          label: status,
          color: '#6B7280',
          bg: 'bg-gray-100',
          border: 'border-gray-200'
        };
    }
  };

  // Formater la date relative
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Hier';
    if (diff < 7) return `Il y a ${diff} jours`;
    if (diff < 30) return `Il y a ${Math.floor(diff / 7)} semaine(s)`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Info pour le type de lieu
  const getLocationTypeInfo = (locationType: string) => {
    switch (locationType) {
      case 'remote': return { label: 'Télétravail', color: '#6B46C1', bg: 'bg-[#6B46C1]/10' };
      case 'hybrid': return { label: 'Hybride', color: '#F7C700', bg: 'bg-[#F7C700]/10' };
      default: return { label: 'Présentiel', color: '#6B9B5F', bg: 'bg-[#6B9B5F]/10' };
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

  // Formater le salaire
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Non précisé';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} €`;
    if (min) return `À partir de ${min.toLocaleString()} €`;
    return `Jusqu'à ${max?.toLocaleString()} €`;
  };

  // Affichage d'erreur
  if (error) {
    return (
      <DashboardLayout title="Mes candidatures" subtitle="Suivez vos candidatures">
        <div className="rounded-3xl p-12 bg-red-50 border border-red-200 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
            <XMarkIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-700 mb-2">Erreur de chargement</h3>
          <p className="text-red-600 mb-6">{error}</p>
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
    <DashboardLayout title="Mes candidatures" subtitle="Suivez l'évolution de vos candidatures">
      <div className="space-y-8">
        {/* Hero Section */}
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6B46C1] via-[#5b3aa1] to-[#4a2d91] p-8 shadow-xl shadow-[#6B46C1]/20"
          style={{ animation: 'fadeIn 0.6s ease-out' }}
        >
          {/* Motifs décoratifs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F7C700]/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <DocumentTextIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-2">
                    <SparklesIcon className="w-4 h-4 text-[#F7C700]" />
                    <span className="text-white/90 text-sm font-medium">Suivi des candidatures</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">
                    {totalApplications} candidature{totalApplications > 1 ? 's' : ''}
                  </h2>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-[#F7C700]" />
                  <span className="text-white font-medium">{stats.viewed + stats.interview} en cours</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">{stats.accepted} acceptée{stats.accepted > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
          style={{ animation: 'fadeIn 0.6s ease-out 0.1s both' }}
        >
          {[
            { key: 'pending', label: 'En attente', icon: ClockIcon, color: '#F7C700', count: stats.pending },
            { key: 'viewed', label: 'Consultées', icon: EyeIcon, color: '#3B82F6', count: stats.viewed },
            { key: 'interview', label: 'Entretiens', icon: ChatBubbleLeftRightIcon, color: '#6B46C1', count: stats.interview },
            { key: 'accepted', label: 'Acceptées', icon: CheckCircleIcon, color: '#6B9B5F', count: stats.accepted },
            { key: 'rejected', label: 'Rejetées', icon: XCircleIcon, color: '#EF4444', count: stats.rejected },
          ].map((stat, index) => (
            <button
              key={stat.key}
              onClick={() => setSelectedStatus(selectedStatus === stat.key ? '' : stat.key === 'pending' ? 'applied' : stat.key)}
              className={`group bg-white rounded-2xl shadow-lg shadow-gray-200/50 border p-5 text-left transition-all hover:shadow-xl ${
                selectedStatus === stat.key || (selectedStatus === 'applied' && stat.key === 'pending')
                  ? 'border-2'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
              style={{
                animation: `fadeIn 0.4s ease-out ${0.05 * index}s both`,
                borderColor: selectedStatus === stat.key || (selectedStatus === 'applied' && stat.key === 'pending') ? stat.color : undefined
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Filtres actifs */}
        {selectedStatus && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtre actif:</span>
            <button
              onClick={() => setSelectedStatus('')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#6B46C1]/10 text-[#6B46C1] hover:bg-[#6B46C1]/20 transition-colors"
            >
              {getStatusInfo(selectedStatus).label}
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Liste des candidatures */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#6B46C1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement de vos candidatures...</p>
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div
            className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-16 text-center"
            style={{ animation: 'fadeIn 0.6s ease-out 0.2s both' }}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#6B46C1]/10 flex items-center justify-center">
              <DocumentTextIcon className="w-12 h-12 text-[#6B46C1]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {selectedStatus ? 'Aucune candidature avec ce statut' : 'Aucune candidature'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {selectedStatus
                ? 'Essayez de retirer le filtre pour voir toutes vos candidatures.'
                : "Vous n'avez pas encore postulé à des offres d'emploi. Commencez dès maintenant !"}
            </p>
            {selectedStatus ? (
              <button
                onClick={() => setSelectedStatus('')}
                className="px-8 py-4 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                Voir toutes les candidatures
              </button>
            ) : (
              <Link
                href="/dashboard/jobs"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-[#6B46C1] to-[#5b3aa1] text-white shadow-lg shadow-[#6B46C1]/30 hover:shadow-xl hover:shadow-[#6B46C1]/40 transition-all"
              >
                <BriefcaseIcon className="w-5 h-5" />
                <span>Découvrir les offres</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application, index) => {
              const statusInfo = getStatusInfo(application.status);
              const locationInfo = getLocationTypeInfo(application.job.location_type);
              const jobTypeInfo = getJobTypeInfo(application.job.job_type);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={application.id}
                  className={`group bg-white rounded-2xl shadow-lg shadow-gray-200/50 border overflow-hidden hover:shadow-xl transition-all ${statusInfo.border}`}
                  style={{ animation: `fadeIn 0.4s ease-out ${0.05 * index}s both` }}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Logo et infos principales */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <BuildingOfficeIcon className="w-7 h-7 text-gray-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#6B46C1] transition-colors">
                              {application.job.title}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${statusInfo.bg}`}
                              style={{ color: statusInfo.color }}
                            >
                              <StatusIcon className="w-4 h-4" />
                              {statusInfo.label}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 font-medium mb-3">
                            {application.job.company_name}
                          </p>

                          {/* Tags et infos */}
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            {application.job.location && (
                              <span className="inline-flex items-center gap-1.5 text-gray-500">
                                <MapPinIcon className="w-4 h-4" />
                                {application.job.location}
                              </span>
                            )}
                            <span className="text-gray-300">•</span>
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${locationInfo.bg}`}
                              style={{ color: locationInfo.color }}
                            >
                              {locationInfo.label}
                            </span>
                            <span
                              className="px-2.5 py-1 rounded-lg text-xs font-medium"
                              style={{ backgroundColor: `${jobTypeInfo.color}15`, color: jobTypeInfo.color }}
                            >
                              {jobTypeInfo.label}
                            </span>
                            {(application.job.salary_min || application.job.salary_max) && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="inline-flex items-center gap-1.5 text-gray-500">
                                  <CurrencyEuroIcon className="w-4 h-4" />
                                  {formatSalary(application.job.salary_min, application.job.salary_max)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Date et actions */}
                      <div className="flex lg:flex-col items-center lg:items-end gap-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-400">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>{formatRelativeDate(application.applied_at)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/jobs/${application.job.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-[#6B46C1]/10 text-[#6B46C1] hover:bg-[#6B46C1]/20 transition-all text-sm"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>Voir l'offre</span>
                          </Link>

                          {(application.status === 'applied' || application.status === 'pending') && (
                            <button
                              onClick={() => handleWithdrawApplication(application.id)}
                              disabled={withdrawMutation.isPending}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {withdrawMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <TrashIcon className="w-4 h-4" />
                              )}
                              <span>Retirer</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {application.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                          <span className="font-semibold text-gray-700">Notes:</span> {application.notes}
                        </p>
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
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading || withdrawMutation.isPending}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#6B46C1] hover:text-[#6B46C1] transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Précédent</span>
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading || withdrawMutation.isPending}
                    className={`w-10 h-10 rounded-xl font-semibold transition-all disabled:opacity-50 ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-[#6B46C1] to-[#5b3aa1] text-white shadow-lg shadow-[#6B46C1]/30'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#6B46C1] hover:text-[#6B46C1]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || loading || withdrawMutation.isPending}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#6B46C1] hover:text-[#6B46C1] transition-all"
            >
              <span>Suivant</span>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

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
