'use client';

/**
 * Page des candidatures reçues (Employeur)
 * 
 * Migrée vers React Query pour meilleures performances
 * - Cache automatique (2 min)
 * - Pas de rechargements excessifs
 * - Optimistic updates pour status/notes
 */

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import OnboardingTour from '@/components/OnboardingTour';
import { employerApplicationsTour } from '@/config/onboardingTours';
import { getApiUrl } from '@/lib/getApiUrl';
import { 
  useEmployerApplications,
  useUpdateApplicationStatus,
  useUpdateApplicationNotes
} from '@/hooks';
import { useAuth } from '@/hooks/useNextAuth';
import { 
  UserGroupIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  DocumentTextIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import ScheduleInterviewModal from '@/components/ScheduleInterviewModal';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslations } from 'next-intl';

interface CandidateApplication {
  id: number;
  job_id: number;
  job_title: string;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  status: string;
  applied_at: string;
  cover_letter?: string;
  notes?: string;
  cv_url?: string;
}

interface ApplicationsResponse {
  applications: CandidateApplication[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function CandidatesPage(): React.JSX.Element {
  const t = useTranslations('candidates');
  const tc = useTranslations('common');
  const tas = useTranslations('applicationStatus');
  const { getToken } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 20;
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingApplication, setViewingApplication] = useState<CandidateApplication | null>(null);
  
  // Interview modal state
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{ name: string; email: string; jobTitle: string; applicationId: number } | null>(null);
  const { confirm, isOpen: isConfirmOpen, options: confirmOptions, handleConfirm, handleCancel } = useConfirmModal();

  // Utiliser React Query hooks
  const {
    data,
    isLoading: loading,
    isError,
    error: queryError,
    refetch
  } = useEmployerApplications(page, limit, statusFilter || undefined);

  // Mutations
  const updateStatusMutation = useUpdateApplicationStatus();
  const updateNotesMutation = useUpdateApplicationNotes();

  // Extraire les données
  const applications = data?.applications || [];
  const totalPages = data?.total_pages || 0;
  const total = data?.total || 0;
  const error = isError ? 'Erreur lors du chargement' : null;

  // États de chargement pour les mutations
  const updatingStatus = updateStatusMutation.isPending;
  const updatingNotes = updateNotesMutation.isPending;

  // Changer le statut d'une candidature (avec React Query)
  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    updateStatusMutation.mutate(
      { applicationId, status: newStatus },
      {
        onSuccess: () => {
          // Si la modal est ouverte, mettre à jour l'application affichée
          if (viewingApplication && viewingApplication.id === applicationId) {
            setViewingApplication({ ...viewingApplication, status: newStatus });
          }
          refetch(); // Rafraîchir la liste
        }
      }
    );
  };

  // Mettre à jour les notes (avec React Query)
  const handleNotesUpdate = async (applicationId: number, notes: string) => {
    updateNotesMutation.mutate(
      { applicationId, notes },
      {
        onSuccess: () => {
          // Si la modal est ouverte, mettre à jour l'application affichée
          if (viewingApplication && viewingApplication.id === applicationId) {
            setViewingApplication({ ...viewingApplication, notes });
          }
          refetch(); // Rafraîchir la liste
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = {
      'applied': { label: tas('pending'), className: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      'pending': { label: tas('pending'), className: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      'viewed': { label: tas('viewed'), className: 'bg-blue-100 text-blue-800', icon: EyeIcon },
      'shortlisted': { label: tas('shortlisted'), className: 'bg-purple-100 text-purple-800', icon: CheckCircleIcon },
      'interview': { label: tas('interview'), className: 'bg-indigo-100 text-indigo-800', icon: UserGroupIcon },
      'accepted': { label: tas('accepted'), className: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      'rejected': { label: tas('rejected'), className: 'bg-red-100 text-red-800', icon: XCircleIcon },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200', icon: ClockIcon };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        <Icon className="w-4 h-4" />
        <span>{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredApplications = applications.filter((app: CandidateApplication) =>
    app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
  <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
      <div className="space-y-6">
        {/* Header avec stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('statTotal')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('statPending')}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {applications.filter((a: CandidateApplication) => a.status === 'applied' || a.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('statInterviews')}</p>
            <p className="text-2xl font-bold text-indigo-600">
              {applications.filter((a: CandidateApplication) => a.status === 'interview').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('statAccepted')}</p>
            <p className="text-2xl font-bold text-green-600">
              {applications.filter((a: CandidateApplication) => a.status === 'accepted').length}
            </p>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600" data-tour="application-filters">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                {...{ placeholder: t('searchPlaceholder') }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Filtre par statut */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                aria-label="Filtrer par statut"
              >
                <option value="">{t('filterAllStatuses')}</option>
                <option value="viewed">{tas('viewed')}</option>
                <option value="shortlisted">{tas('shortlisted')}</option>
                <option value="interview">{tas('interview')}</option>
                <option value="accepted">{tas('accepted')}</option>
                <option value="pending">{tas('pending')}</option>
                <option value="rejected">{tas('rejected')}</option>
              </select>
            </div>

            {/* Espace vide pour équilibrer la grille */}
            <div className="flex items-center justify-end">
              {/* Badge "Mise à jour auto" supprimé suite au correctif de performance */}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Liste des candidatures */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <UserGroupIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('emptyTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter ? t('emptyFiltered') : t('emptyDefault')}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('colCandidate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Offre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('colStatus')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {filteredApplications.map((application: CandidateApplication, index: number) => (
                    <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition" data-tour={index === 0 ? "candidate-card" : undefined}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {application.candidate_name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{application.candidate_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                              <EnvelopeIcon className="w-4 h-4" />
                              <span>{application.candidate_email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{application.job_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(application.applied_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setViewingApplication(application)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center space-x-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Voir</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            >
              {tc('previous')}
            </button>
            <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
              {tc('page', { current: page, total: totalPages })}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            >
              {tc('next')}
            </button>
          </div>
        )}
      </div>

      {/* Modal de détail */}
      {viewingApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setViewingApplication(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#6B9B5F]/10 to-transparent shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6B9B5F] to-[#4a7a43] flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {viewingApplication.candidate_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{viewingApplication.candidate_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{viewingApplication.job_title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(viewingApplication.status)}
                <button
                  onClick={() => setViewingApplication(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition"
                  aria-label={tc('close')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">

                {/* Colonne gauche : infos + actions statut */}
                <div className="lg:col-span-1 p-5 space-y-5">

                  {/* Coordonnées */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact</p>
                    <div className="space-y-2">
                      <a href={`mailto:${viewingApplication.candidate_email}`} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-[#6B9B5F] transition group">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <EnvelopeIcon className="w-4 h-4 text-blue-500" />
                        </span>
                        <span className="truncate">{viewingApplication.candidate_email}</span>
                      </a>
                      {viewingApplication.candidate_phone && (
                        <a href={`tel:${viewingApplication.candidate_phone}`} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-[#6B9B5F] transition">
                          <span className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                            <PhoneIcon className="w-4 h-4 text-green-500" />
                          </span>
                          <span>{viewingApplication.candidate_phone}</span>
                        </a>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                        </span>
                        <span>{formatDate(viewingApplication.applied_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* CV */}
                  {viewingApplication.cv_url && (
                    <div data-tour="download-cv">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">CV</p>
                      <a
                        href={(() => {
                          const url = viewingApplication.cv_url!;
                          if (url.startsWith('http')) return url;
                          const baseUrl = getApiUrl().replace(/\/api$/, '');
                          // Compatibilité : chemin absolu (ancien) ou relatif (nouveau)
                          const match = url.match(/uploads[/\\](.+)/);
                          if (match) return `${baseUrl}/uploads/${match[1].replace(/\\/g, '/')}`;
                          return `${baseUrl}/uploads/${url}`;
                        })()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#6B9B5F] hover:bg-[#5a8a4f] text-white rounded-xl text-sm font-medium transition w-full justify-center"
                      >
                        <DocumentTextIcon className="w-4 h-4 shrink-0" />
                        {t('downloadCV')}
                      </a>
                    </div>
                  )}

                  {/* Changer statut */}
                  <div data-tour="change-status">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('sectionStatus')}</p>
                    <div className="relative">
                      <select
                        value={viewingApplication.status}
                        onChange={(e) => handleStatusChange(viewingApplication.id, e.target.value)}
                        disabled={updatingStatus}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#6B9B5F] text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 disabled:opacity-50"
                        aria-label="Changer le statut"
                      >
                        <option value="applied">{tas('pending')}</option>
                        <option value="viewed">{tas('viewed')}</option>
                        <option value="shortlisted">{tas('shortlisted')}</option>
                        <option value="interview">{tas('interview')}</option>
                        <option value="accepted">{tas('accepted')}</option>
                        <option value="rejected">{tas('rejected')}</option>
                      </select>
                      {updatingStatus && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6B9B5F]"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Actions rapides</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedCandidate({
                            name: viewingApplication.candidate_name,
                            email: viewingApplication.candidate_email,
                            jobTitle: viewingApplication.job_title,
                            applicationId: viewingApplication.id
                          });
                          setInterviewModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-[#6B9B5F]/10 text-[#6B9B5F] hover:bg-[#6B9B5F]/20 transition"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        {t('scheduleInterview')}
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleStatusChange(viewingApplication.id, 'shortlisted')}
                          disabled={updatingStatus}
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 transition disabled:opacity-50"
                        >
                          <CheckCircleIcon className="w-3.5 h-3.5" />{t('shortlist')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(viewingApplication.id, 'accepted')}
                          disabled={updatingStatus}
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 transition disabled:opacity-50"
                        >
                          <CheckCircleIcon className="w-3.5 h-3.5" />{t('accept')}
                        </button>
                        <button
                          onClick={async () => {
                            const ok = await confirm({
                              title: t('rejectConfirmTitle'),
                              message: `Vous allez rejeter la candidature de ${viewingApplication.candidate_name}.`,
                              confirmLabel: t('reject'),
                            });
                            if (ok) handleStatusChange(viewingApplication.id, 'rejected');
                          }}
                          disabled={updatingStatus}
                          className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 transition disabled:opacity-50"
                        >
                          <XCircleIcon className="w-3.5 h-3.5" />{t('reject')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colonne droite : lettre + notes */}
                <div className="lg:col-span-2 p-5 space-y-5">

                  {/* Lettre de motivation */}
                  {viewingApplication.cover_letter ? (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('sectionCoverLetter')}</p>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
                        {viewingApplication.cover_letter}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center text-sm text-gray-400">
                      Aucune lettre de motivation fournie
                    </div>
                  )}

                  {/* Notes */}
                  <div data-tour="add-notes">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('sectionNotes')}</p>
                    <div className="relative">
                      <textarea
                        value={viewingApplication.notes || ''}
                        onChange={(e) => setViewingApplication({ ...viewingApplication, notes: e.target.value })}
                        onBlur={() => handleNotesUpdate(viewingApplication.id, viewingApplication.notes || '')}
                        disabled={updatingNotes}
                        {...{ placeholder: t('notesPlaceholder') }}
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#6B9B5F] text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 disabled:opacity-50 resize-none"
                      />
                      {updatingNotes && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6B9B5F]"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {updatingNotes ? tc('saving') : t('notesAutoSave')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
              <button
                onClick={() => setViewingApplication(null)}
                className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
              >
                {tc('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Modal */}
      {selectedCandidate && (
        <ScheduleInterviewModal
          isOpen={interviewModalOpen}
          onClose={() => {
            setInterviewModalOpen(false);
            setSelectedCandidate(null);
          }}
          candidateName={selectedCandidate.name}
          candidateEmail={selectedCandidate.email}
          jobTitle={selectedCandidate.jobTitle}
          applicationId={selectedCandidate.applicationId}
          getToken={getToken}
        />
      )}

      {/* Système d'onboarding */}
      <OnboardingTour
        tourId="employer-applications"
        steps={employerApplicationsTour}
      />
      <ConfirmDialog
        isOpen={isConfirmOpen}
        options={confirmOptions}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}
