'use client';

/**
 * Page de gestion des offres d'emploi (Employeur) - INTOWORK Brand Design
 *
 * Refonte visuelle avec la charte graphique INTOWORK:
 * - Vert: #6B9B5F (couleur principale)
 * - Or: #F7C700 (accent)
 * - Violet: #6B46C1 (secondaire)
 * - Bleu: #3B82F6 (complémentaire)
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useNextAuth';
import { jobsAPI, Job } from '@/lib/api';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/api';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/constants/geo';
import DashboardLayout from '@/components/DashboardLayout';
import OnboardingTour from '@/components/OnboardingTour';
import { employerCreateJobTour } from '@/config/onboardingTours';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  HomeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  LinkIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import PublishToLinkedInModal from '@/components/PublishToLinkedInModal';

export default function JobPostsPage(): React.JSX.Element {
  const { getToken } = useAuth();
  const t = useTranslations('jobPosts');
  const tc = useTranslations('common');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Job>>({});
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // LinkedIn modal state
  const [linkedInModalOpen, setLinkedInModalOpen] = useState(false);
  const [selectedJobForLinkedIn, setSelectedJobForLinkedIn] = useState<{ id: number; title: string } | null>(null);
  const [deletingJob, setDeletingJob] = useState(false);
  const [shareMenuJobId, setShareMenuJobId] = useState<number | null>(null);
  const [shareMenuPos, setShareMenuPos] = useState<{ top: number; left: number } | null>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu de partage en cliquant en dehors
  const handleCloseShareMenu = useCallback((e: MouseEvent) => {
    if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
      setShareMenuJobId(null);
      setShareMenuPos(null);
    }
  }, []);

  useEffect(() => {
    if (shareMenuJobId !== null) {
      document.addEventListener('mousedown', handleCloseShareMenu);
    } else {
      document.removeEventListener('mousedown', handleCloseShareMenu);
    }
    return () => document.removeEventListener('mousedown', handleCloseShareMenu);
  }, [shareMenuJobId, handleCloseShareMenu]);

  const handleToggleShareMenu = (e: React.MouseEvent<HTMLButtonElement>, jobId: number) => {
    if (shareMenuJobId === jobId) {
      setShareMenuJobId(null);
      setShareMenuPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setShareMenuPos({ top: rect.bottom + 8, left: rect.right - 208 });
    setShareMenuJobId(jobId);
  };

  const SHARE_CHANNELS = [
    { key: 'whatsapp', label: 'WhatsApp', icon: <ChatBubbleLeftIcon className="w-4 h-4" />, color: '#25D366' },
    { key: 'linkedin', label: 'LinkedIn', icon: <LinkIcon className="w-4 h-4" />, color: '#0A66C2' },
    { key: 'email', label: 'Email', icon: <EnvelopeIcon className="w-4 h-4" />, color: '#6B9B5F' },
    { key: 'facebook', label: 'Facebook', icon: <GlobeAltIcon className="w-4 h-4" />, color: '#1877F2' },
    { key: 'direct', label: 'Lien direct', icon: <ShareIcon className="w-4 h-4" />, color: '#7C3AED' },
  ] as const;

  const handleShareJob = (jobId: number, channel: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}/dashboard/jobs/${jobId}?ref=${channel}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success(`📋 Lien copié !`);
    });
    setShareMenuJobId(null);
  };
  const { confirm, isOpen: isConfirmOpen, options: confirmOptions, handleConfirm, handleCancel } = useConfirmModal();

  // Helper functions
  const getJobTypeInfo = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      full_time: { label: 'CDI', color: '#6B9B5F' },
      part_time: { label: 'Temps partiel', color: '#3B82F6' },
      contract: { label: 'CDD', color: '#F7C700' },
      temporary: { label: 'Intérim', color: '#6B46C1' },
      internship: { label: 'Stage', color: '#EC4899' },
    };
    return types[type] || { label: type, color: '#6B9B5F' };
  };

  const getLocationTypeInfo = (type: string) => {
    const types: Record<string, { label: string; color: string; icon: typeof HomeIcon }> = {
      on_site: { label: 'Présentiel', color: '#6B9B5F', icon: HomeIcon },
      remote: { label: 'Télétravail', color: '#6B46C1', icon: ComputerDesktopIcon },
      hybrid: { label: 'Hybride', color: '#F7C700', icon: BriefcaseIcon },
    };
    return types[type] || { label: type, color: '#6B9B5F', icon: HomeIcon };
  };

  const formatRelativeDate = (dateString?: string) => {
    if (!dateString) return 'Date non précisée';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Hier';
    if (diff < 7) return `Il y a ${diff} jours`;
    if (diff < 30) return `Il y a ${Math.floor(diff / 7)} sem.`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await jobsAPI.getMyJobs(token);
      setJobs(response.jobs || []);
    } catch (err: unknown) {
      logger.error("Erreur lors de la recuperation des offres:", err);
      setError('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: number) => {
    const ok = await confirm({
      title: 'Supprimer cette offre ?',
      message: 'Cette offre sera définitivement supprimée.',
      detail: 'Cette action est irréversible.',
      confirmLabel: 'Supprimer',
    });
    if (!ok) return;

    setDeletingJob(true);
    try {
      const token = await getToken();
      if (!token) return;

      await jobsAPI.deleteJob(jobId, token);
      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success(t('deleteSuccess'));
    } catch (err: unknown) {
      logger.error("Erreur lors de la suppression:", err);
      toast.error(t('deleteError'));
    } finally {
      setDeletingJob(false);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      location_type: job.location_type,
      job_type: job.job_type,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      currency: job.currency || 'XOF',
      context: job.context,
      mission_principale: job.mission_principale,
      profil_formation: job.profil_formation,
      profil_experience: job.profil_experience,
      profil_competences: job.profil_competences,
      profil_posture: job.profil_posture,
      profil_autre: job.profil_autre,
    });
    setImageFile(null);
    setImagePreview(job.image_url ?? null);
  };

  const handleCloseModal = () => {
    setEditingJob(null);
    setIsCreating(false);
    setFormData({});
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setFormData({ currency: 'XAF' });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleView = (job: Job) => {
    setViewingJob(job);
  };

  const handleCloseViewModal = () => {
    setViewingJob(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number | undefined = value;

    if (name === 'salary_min' || name === 'salary_max') {
      processedValue = value ? Number.parseInt(value, 10) : undefined;
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne peut pas dépasser 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const token = await getToken();
      if (!token) {
        toast.error(t('authRequired'));
        return;
      }

      if (isCreating) {
        const newJob = await jobsAPI.createJob(formData, token);
        let finalJob = newJob;
        if (imageFile) {
          finalJob = await jobsAPI.uploadJobImage(newJob.id, imageFile, token);
        }
        setJobs([finalJob, ...jobs]);
        toast.success(t('createSuccess'));
      } else if (editingJob) {
        await jobsAPI.updateJob(editingJob.id, formData, token);
        if (imageFile) {
          await jobsAPI.uploadJobImage(editingJob.id, imageFile, token);
        }
        await fetchJobs();
        toast.success(t('updateSuccess'));
      }

      handleCloseModal();
    } catch (err: unknown) {
      logger.error("Erreur lors de la sauvegarde:", err);
      toast.error(getErrorMessage(err, t('saveError')));
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">{t('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Stats
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);
  const totalViews = jobs.reduce((sum, job) => sum + (job.views_count || 0), 0);
  const activeJobs = jobs.length; // Toutes les offres de l'employeur sont considérées actives

  return (
    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
      <div className="space-y-8">
        {/* Hero Section */}
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6B9B5F] via-[#5a8a4f] to-[#4a7a3f] p-8 shadow-xl shadow-[#6B9B5F]/20"
          style={{ animation: 'fadeIn 0.6s ease-out' }}
        >
          {/* Motifs décoratifs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F7C700]/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <BriefcaseIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-2">
                    <SparklesIcon className="w-4 h-4 text-[#F7C700]" />
                    <span className="text-white/90 text-sm font-medium">Espace Recruteur</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">
                    {jobs.length} offre{jobs.length > 1 ? 's' : ''} publiée{jobs.length > 1 ? 's' : ''}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-[#6B9B5F] hover:bg-white/90 shadow-lg transition-all"
              >
                <PlusIcon className="w-5 h-5" />
                {t('newJobButton')}
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          style={{ animation: 'fadeIn 0.6s ease-out 0.1s both' }}
        >
          {[
            { label: t('statActive'), value: activeJobs, icon: BriefcaseIcon, color: '#6B9B5F' },
            { label: t('statTotal'), value: jobs.length, icon: ChartBarIcon, color: '#3B82F6' },
            { label: t('statApplications'), value: totalApplications, icon: UserGroupIcon, color: '#6B46C1' },
            { label: t('statViews'), value: totalViews, icon: EyeIcon, color: '#F7C700' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-5 hover:shadow-xl transition-all"
              style={{ animation: `fadeIn 0.4s ease-out ${0.05 * index}s both` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
            <XMarkIcon className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Liste des offres */}
        {jobs.length === 0 ? (
          <div
            className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-16 text-center"
            style={{ animation: 'fadeIn 0.6s ease-out 0.2s both' }}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#6B9B5F]/10 flex items-center justify-center">
              <BriefcaseIcon className="w-12 h-12 text-[#6B9B5F]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('emptyTitle')}</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {t('emptyDescription')}
            </p>
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/30 hover:shadow-xl hover:shadow-[#6B9B5F]/40 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              {t('createFirstButton')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, index) => {
              const jobTypeInfo = getJobTypeInfo(job.job_type);
              const locationTypeInfo = getLocationTypeInfo(job.location_type);
              const LocationIcon = locationTypeInfo.icon;

              return (
                <div
                  key={job.id}
                  className="group bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#6B9B5F]/20 transition-all"
                  style={{ animation: `fadeIn 0.4s ease-out ${0.05 * index}s both` }}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Visuel de l'offre */}
                      {job.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={job.image_url}
                          alt={job.title}
                          className="w-full lg:w-40 h-32 lg:h-24 object-cover rounded-xl flex-shrink-0"
                        />
                      )}
                      {/* Info principale */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#6B9B5F] transition-colors">
                            {job.title}
                          </h3>
                          {job.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-[#F7C700]/10 text-[#F7C700]">
                              <StarIcon className="w-3 h-3" />
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{ backgroundColor: `${jobTypeInfo.color}15`, color: jobTypeInfo.color }}
                          >
                            {jobTypeInfo.label}
                          </span>
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{ backgroundColor: `${locationTypeInfo.color}15`, color: locationTypeInfo.color }}
                          >
                            <LocationIcon className="w-3.5 h-3.5" />
                            {locationTypeInfo.label}
                          </span>
                          {job.location && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                              <MapPinIcon className="w-3.5 h-3.5" />
                              {job.location}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 line-clamp-2 mb-4">{job.description}</p>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          <span className="inline-flex items-center gap-1.5 text-gray-500">
                            <UserGroupIcon className="w-4 h-4 text-[#6B46C1]" />
                            {job.applications_count || 0} candidature{(job.applications_count || 0) > 1 ? 's' : ''}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-gray-500">
                            <EyeIcon className="w-4 h-4 text-[#3B82F6]" />
                            {job.views_count || 0} vue{(job.views_count || 0) > 1 ? 's' : ''}
                          </span>
                          {job.salary_min && job.salary_max && (
                            <span className="inline-flex items-center gap-1.5 text-gray-500">
                              <CurrencyEuroIcon className="w-4 h-4 text-[#6B9B5F]" />
                              {formatCurrency(job.salary_min, job.currency || 'XAF')} - {formatCurrency(job.salary_max, job.currency || 'XAF')}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-gray-400">
                            <CalendarDaysIcon className="w-4 h-4" />
                            {formatRelativeDate(job.posted_at)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(job)}
                          className="p-3 rounded-xl text-[#6B9B5F] bg-[#6B9B5F]/10 hover:bg-[#6B9B5F]/20 transition-all"
                          title="Voir les détails"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        {(job.status === 'published' || job.status === 'active') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJobForLinkedIn({ id: job.id, title: job.title });
                              setLinkedInModalOpen(true);
                            }}
                            className="p-3 rounded-xl text-[#0A66C2] bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 transition-all"
                            title="Publier sur LinkedIn"
                          >
                            <LinkIcon className="w-5 h-5" />
                          </button>
                        )}
                        <Link
                          href={`/dashboard/ai-scoring/${job.id}`}
                          className="p-3 rounded-xl text-[#F7C700] bg-[#F7C700]/10 hover:bg-[#F7C700]/20 transition-all"
                          title="Scoring IA des candidatures"
                        >
                          <SparklesIcon className="w-5 h-5" />
                        </Link>
                        {/* Bouton Partager avec menu canaux — visible pour toutes les offres sauf archivées */}
                        {job.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleShareMenu(e, job.id)}
                            className="p-3 rounded-xl text-[#7C3AED] bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 transition-all"
                            title="Partager l'offre avec lien tracé"
                          >
                            <ShareIcon className="w-5 h-5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEdit(job)}
                          className="p-3 rounded-xl text-[#3B82F6] bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 transition-all"
                          title={tc('edit')}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(job.id)}
                          className="p-3 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                          title="Supprimer"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de création/modification */}
      {(editingJob || isCreating) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 p-6 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6B9B5F]/10 flex items-center justify-center">
                    {isCreating ? <PlusIcon className="w-6 h-6 text-[#6B9B5F]" /> : <PencilIcon className="w-6 h-6 text-[#6B9B5F]" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {isCreating ? t('modalCreateTitle') : t('modalEditTitle')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image / visuel de l'offre (optionnel) */}
              <div>
                <label htmlFor="job-image" className="block text-sm font-semibold text-gray-700 mb-2">
                  Image de l'offre <span className="font-normal text-gray-400">(optionnel)</span>
                </label>
                {imagePreview ? (
                  <div className="relative w-full max-w-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Aperçu du visuel de l'offre"
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-all"
                      aria-label="Retirer l'image"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="job-image"
                    className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                  >
                    <SparklesIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Cliquez pour ajouter une image (max 5MB)</span>
                    <span className="text-xs text-gray-400 mt-1">Recommandé : 1200×627 px</span>
                  </label>
                )}
                <input
                  id="job-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Cette image sera utilisée comme visuel lors du partage sur LinkedIn.
                </p>
              </div>

              {/* Titre */}
              <div data-tour="job-basics">
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre du poste *
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                  placeholder="Ex: Développeur Full Stack"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all resize-none"
                  placeholder="Décrivez le poste en détail..."
                />
              </div>

              {/* Type de contrat et Mode de travail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-tour="job-requirements">
                <div>
                  <label htmlFor="job_type" className="block text-sm font-semibold text-gray-700 mb-2">
                    Type de contrat *
                  </label>
                  <select
                    id="job_type"
                    name="job_type"
                    value={formData.job_type || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                  >
                    <option value="">{tc('selectPlaceholder')}</option>
                    <option value="full_time">{tc('fullTime')}</option>
                    <option value="part_time">{tc('partTime')}</option>
                    <option value="contract">{tc('contract')}</option>
                    <option value="temporary">{tc('temporary')}</option>
                    <option value="internship">{tc('internship')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="location_type" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('formLocationType')}
                  </label>
                  <select
                    id="location_type"
                    name="location_type"
                    value={formData.location_type || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                  >
                    <option value="">{tc('selectPlaceholder')}</option>
                    <option value="on_site">{tc('onSite')}</option>
                    <option value="remote">{tc('remote')}</option>
                    <option value="hybrid">{tc('hybrid')}</option>
                  </select>
                </div>
              </div>

              {/* Localisation */}
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Localisation
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                  placeholder="Ex: Dakar, Sénégal"
                />
              </div>

              {/* Salaire */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-tour="job-salary">
                <div>
                  <label htmlFor="salary_min" className="block text-sm font-semibold text-gray-700 mb-2">
                    Salaire minimum
                  </label>
                  <input
                    id="salary_min"
                    type="number"
                    name="salary_min"
                    value={formData.salary_min || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                    placeholder="Ex: 500000"
                  />
                </div>
                <div>
                  <label htmlFor="salary_max" className="block text-sm font-semibold text-gray-700 mb-2">
                    Salaire maximum
                  </label>
                  <input
                    id="salary_max"
                    type="number"
                    name="salary_max"
                    value={formData.salary_max || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                    placeholder="Ex: 800000"
                  />
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-2">
                    Devise
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency || 'XOF'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                  >
                    <option value="XAF">XAF (Franc CFA CEMAC)</option>
                    <option value="XOF">XOF (Franc CFA UEMOA)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar)</option>
                  </select>
                </div>
              </div>

              {/* ===== SECTION ENRICHIE ===== */}
              <div className="border-t border-gray-100 pt-6 space-y-5">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-[#6B9B5F]" />
                  Détails du poste
                </h3>

                {/* Contexte */}
                <div>
                  <label htmlFor="context" className="block text-sm font-semibold text-gray-700 mb-2">
                    Contexte
                  </label>
                  <textarea
                    id="context"
                    name="context"
                    value={formData.context || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all resize-none"
                    placeholder="Décrivez le contexte et l'environnement du poste..."
                  />
                </div>

                {/* Mission principale */}
                <div>
                  <label htmlFor="mission_principale" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mission principale
                  </label>
                  <textarea
                    id="mission_principale"
                    name="mission_principale"
                    value={formData.mission_principale || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all resize-none"
                    placeholder="Décrivez la mission principale du poste..."
                  />
                </div>

                {/* Profil recherché */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-gray-800">Profil recherché</h4>

                  <div>
                    <label htmlFor="profil_formation" className="block text-sm font-semibold text-gray-600 mb-1.5">
                      Formation
                    </label>
                    <textarea
                      id="profil_formation"
                      name="profil_formation"
                      value={formData.profil_formation || ''}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all resize-none"
                      placeholder="Ex: Bac+5 en Informatique, Finance..."
                    />
                  </div>

                  <div>
                    <label htmlFor="profil_experience" className="block text-sm font-semibold text-gray-600 mb-1.5">
                      Profil &amp; Expérience
                    </label>
                    <textarea
                      id="profil_experience"
                      name="profil_experience"
                      value={formData.profil_experience || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all resize-none"
                      placeholder="Ex: 3 ans d'expérience minimum en gestion de projet..."
                    />
                  </div>

                  <div>
                    <label htmlFor="profil_competences" className="block text-sm font-semibold text-gray-600 mb-1.5">
                      Compétences
                    </label>
                    <textarea
                      id="profil_competences"
                      name="profil_competences"
                      value={formData.profil_competences || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all resize-none"
                      placeholder="Ex: Maîtrise de Python, SQL, gestion budgétaire..."
                    />
                  </div>

                  <div>
                    <label htmlFor="profil_posture" className="block text-sm font-semibold text-gray-600 mb-1.5">
                      Posture comportementale
                    </label>
                    <textarea
                      id="profil_posture"
                      name="profil_posture"
                      value={formData.profil_posture || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all resize-none"
                      placeholder="Ex: Sens du leadership, autonomie, esprit d'équipe..."
                    />
                  </div>

                  <div>
                    <label htmlFor="profil_autre" className="block text-sm font-semibold text-gray-600 mb-1.5">
                      Autre
                    </label>
                    <textarea
                      id="profil_autre"
                      name="profil_autre"
                      value={formData.profil_autre || ''}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all resize-none"
                      placeholder="Autres critères ou informations complémentaires..."
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  data-tour="publish-job"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/30 hover:shadow-xl hover:shadow-[#6B9B5F]/40 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{tc('saving')}</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>{tc('save')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {viewingJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 p-6 border-b border-gray-100 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{viewingJob.title}</h3>
                  <div className="flex items-center gap-2 text-gray-500">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>{viewingJob.company_name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Visuel de l'offre */}
              {viewingJob.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={viewingJob.image_url}
                  alt={viewingJob.title}
                  className="w-full h-56 object-cover rounded-2xl"
                />
              )}
              {/* Tags */}
              <div className="flex flex-wrap gap-3">
                <span
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: `${getJobTypeInfo(viewingJob.job_type).color}15`,
                    color: getJobTypeInfo(viewingJob.job_type).color,
                  }}
                >
                  {getJobTypeInfo(viewingJob.job_type).label}
                </span>
                <span
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: `${getLocationTypeInfo(viewingJob.location_type).color}15`,
                    color: getLocationTypeInfo(viewingJob.location_type).color,
                  }}
                >
                  {getLocationTypeInfo(viewingJob.location_type).label}
                </span>
                {viewingJob.location && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700">
                    <MapPinIcon className="w-4 h-4" />
                    {viewingJob.location}
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Description du poste</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingJob.description}</p>
              </div>

              {/* Contexte */}
              {viewingJob.context && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Contexte</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingJob.context}</p>
                </div>
              )}

              {/* Mission principale */}
              {viewingJob.mission_principale && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Mission principale</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingJob.mission_principale}</p>
                </div>
              )}

              {/* Profil recherché */}
              {(viewingJob.profil_formation || viewingJob.profil_experience || viewingJob.profil_competences || viewingJob.profil_posture || viewingJob.profil_autre) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Profil recherché</h4>
                  <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                    {viewingJob.profil_formation && (
                      <div>
                        <p className="text-sm font-bold text-[#6B9B5F] mb-1">Formation</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{viewingJob.profil_formation}</p>
                      </div>
                    )}
                    {viewingJob.profil_experience && (
                      <div>
                        <p className="text-sm font-bold text-[#6B9B5F] mb-1">Profil &amp; Expérience</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{viewingJob.profil_experience}</p>
                      </div>
                    )}
                    {viewingJob.profil_competences && (
                      <div>
                        <p className="text-sm font-bold text-[#6B9B5F] mb-1">Compétences</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{viewingJob.profil_competences}</p>
                      </div>
                    )}
                    {viewingJob.profil_posture && (
                      <div>
                        <p className="text-sm font-bold text-[#6B9B5F] mb-1">Posture comportementale</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{viewingJob.profil_posture}</p>
                      </div>
                    )}
                    {viewingJob.profil_autre && (
                      <div>
                        <p className="text-sm font-bold text-[#6B9B5F] mb-1">Autre</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{viewingJob.profil_autre}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Salaire */}
              {viewingJob.salary_min && viewingJob.salary_max && (
                <div className="bg-gradient-to-r from-[#6B9B5F]/10 to-[#F7C700]/10 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CurrencyEuroIcon className="w-5 h-5 text-[#6B9B5F]" />
                    Rémunération
                  </h4>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(viewingJob.salary_min, viewingJob.currency || 'XAF')} - {formatCurrency(viewingJob.salary_max, viewingJob.currency || 'XAF')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{t('viewPerMonth')}</p>
                </div>
              )}

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#6B46C1]/10 rounded-2xl p-5 text-center">
                  <p className="text-3xl font-bold text-[#6B46C1]">{viewingJob.applications_count || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Candidature{(viewingJob.applications_count || 0) > 1 ? 's' : ''}</p>
                </div>
                <div className="bg-[#3B82F6]/10 rounded-2xl p-5 text-center">
                  <p className="text-3xl font-bold text-[#3B82F6]">{viewingJob.views_count || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Vue{(viewingJob.views_count || 0) > 1 ? 's' : ''}</p>
                </div>
                <div className="bg-[#F7C700]/10 rounded-2xl p-5 text-center">
                  <div className="text-3xl font-bold text-[#F7C700]">
                    {viewingJob.is_featured ? <StarIcon className="w-8 h-8 mx-auto" /> : '—'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{viewingJob.is_featured ? t('viewFeatured') : t('viewStandard')}</p>
                </div>
              </div>

              {/* Date de publication */}
              {viewingJob.posted_at && (
                <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>
                    {tc('publishedOn')}{' '}
                    {new Date(viewingJob.posted_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  {tc('close')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCloseViewModal();
                    handleEdit(viewingJob);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white shadow-lg shadow-[#3B82F6]/30 hover:shadow-xl hover:shadow-[#3B82F6]/40 transition-all"
                >
                  <PencilIcon className="w-5 h-5" />
                  <span>{tc('edit')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
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

      {/* Système d'onboarding */}
      <OnboardingTour
        tourId="employer-create-job"
        steps={employerCreateJobTour}
      />

      {/* Menu de partage — portail fixed pour éviter overflow-hidden des cards */}
      {shareMenuJobId !== null && shareMenuPos && (
        <div
          ref={shareMenuRef}
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-2xl w-52"
          style={{ top: shareMenuPos.top, left: Math.max(8, shareMenuPos.left) }}
        >
          <p className="text-xs text-gray-400 font-semibold px-3 pt-3 pb-2 uppercase tracking-wide">Copier le lien tracé</p>
          {SHARE_CHANNELS.map(ch => (
            <button
              key={ch.key}
              type="button"
              onClick={() => handleShareJob(shareMenuJobId, ch.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm text-left"
            >
              <span style={{ color: ch.color }}>{ch.icon}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{ch.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* LinkedIn Modal */}
      {selectedJobForLinkedIn && (
        <PublishToLinkedInModal
          isOpen={linkedInModalOpen}
          onClose={() => {
            setLinkedInModalOpen(false);
            setSelectedJobForLinkedIn(null);
          }}
          jobId={selectedJobForLinkedIn.id}
          jobTitle={selectedJobForLinkedIn.title}
          getToken={getToken}
        />
      )}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        options={confirmOptions}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={deletingJob}
      />
    </DashboardLayout>
  );
}
