'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useNextAuth';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { logger } from '@/lib/logger';
import { isAPIError } from '@/types/api';
import { jobsAPI, applicationsAPI, candidatesAPI } from '@/lib/api';
import {
  MapPinIcon,
  CurrencyEuroIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

interface JobDetail {
  id: number;
  title: string;
  description: string;
  company_name: string;
  company_logo_url?: string;
  company_is_verified?: boolean;
  location?: string;
  location_type: 'on_site' | 'remote' | 'hybrid';
  job_type: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship';
  salary_min?: number;
  salary_max?: number;
  currency: string;
  posted_at?: string;
  image_url?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  has_applied: boolean;
}

export default function JobDetailPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const t = useTranslations('jobs');
  const tc = useTranslations('common');
  const jobId = params.id as string;
  const sourceRef = searchParams.get('ref') ?? undefined;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedCVId, setSelectedCVId] = useState<number | null>(null);
  const [cvs, setCvs] = useState<{ id: number; filename: string; is_active: boolean; created_at: string }[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await jobsAPI.getJobById(token, parseInt(jobId));
      setJob(response);
    } catch (error) {
      logger.error("Erreur lors du chargement du job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setShowApplicationModal(true);
    setCoverLetter('');
    setSelectedCVId(null);
    // Charger les CVs
    try {
      setLoadingCVs(true);
      const token = await getToken();
      if (!token) return;
      const cvsData = await candidatesAPI.listCVs(token);
      setCvs(cvsData);
      const activeCV = cvsData.find((cv: { is_active: boolean }) => cv.is_active);
      if (activeCV) setSelectedCVId(activeCV.id);
      else if (cvsData.length > 0) setSelectedCVId(cvsData[0].id);
    } catch (err) {
      logger.error('Erreur chargement CVs:', err);
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!job) return;
    if (!selectedCVId && cvs.length > 0) {
      toast.error('Veuillez sélectionner un CV');
      return;
    }
    try {
      setApplying(true);
      const token = await getToken();
      if (!token) { toast.error(t('loginRequired')); return; }
      await applicationsAPI.applyToJob(token, {
        job_id: job.id,
        cover_letter: coverLetter || undefined,
        cv_id: selectedCVId || undefined,
        source_ref: sourceRef,
      });
      toast.success(`✅ ${t('applySuccess')}`);
      setShowApplicationModal(false);
      setCoverLetter('');
      loadJobDetail();
    } catch (error: unknown) {
      logger.error('Erreur lors de la candidature:', error);
      if (isAPIError(error) && error.response?.status === 400 && error.response?.data?.detail?.includes('déjà postulé')) {
        toast.error('❌ Vous avez déjà postulé à cette offre');
      } else {
        toast.error(`❌ ${t('applyError')}`);
      }
    } finally {
      setApplying(false);
    }
  };

  const getLocationTypeLabel = (locationType?: string) => {
    if (!locationType) return '';
    switch (locationType) {
      case 'remote': return t('remote');
      case 'hybrid': return t('hybrid');
      case 'on_site': return t('on_site');
      default: return locationType;
    }
  };

  const getJobTypeLabel = (jobType?: string) => {
    if (!jobType) return '';
    switch (jobType) {
      case 'full_time': return t('full_time');
      case 'part_time': return t('part_time');
      case 'contract': return t('contract');
      case 'temporary': return t('temporary');
      case 'internship': return t('internship');
      default: return jobType;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BriefcaseIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('notFound')}</h3>
          <p className="text-gray-500 mb-6">{t('notFoundDesc')}</p>
          <button
            onClick={() => router.push('/dashboard/jobs')}
            className="px-6 py-3 bg-[#6B9B5F] hover:bg-[#5a8a4e] text-white font-semibold rounded-xl transition-colors"
          >
            {t('backToJobs')}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#6B9B5F] mb-6 transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>{tc('back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero card — titre + entreprise */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Visuel de l'offre (ou bande verte décorative) */}
              {job.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.image_url}
                  alt={job.title}
                  className="w-full h-48 sm:h-64 object-cover"
                />
              ) : (
                <div className="h-2 bg-gradient-to-r from-[#6B9B5F] to-[#93C587]" />
              )}
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  {job.company_logo_url ? (
                    <img
                      src={job.company_logo_url}
                      alt={job.company_name}
                      className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6B9B5F]/20 to-[#6B9B5F]/5 flex items-center justify-center shrink-0">
                      <BuildingOfficeIcon className="w-8 h-8 text-[#6B9B5F]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-1">
                      {job.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-[#6B9B5F]">{job.company_name}</span>
                      {job.company_is_verified && (
                        <CheckBadgeIcon className="w-4 h-4 text-[#6B9B5F]" title="Entreprise vérifiée" />
                      )}
                    </div>
                    {job.location && (
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="w-4 h-4 shrink-0" />
                        <span>{job.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#6B9B5F]/10 text-[#6B9B5F]">
                    <BriefcaseIcon className="w-3.5 h-3.5" />
                    {getJobTypeLabel(job.job_type)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    {getLocationTypeLabel(job.location_type)}
                  </span>
                  {(job.salary_min || job.salary_max) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                      <CurrencyEuroIcon className="w-3.5 h-3.5" />
                      {job.salary_min && job.salary_max
                        ? `${job.salary_min.toLocaleString('fr-FR')} – ${job.salary_max.toLocaleString('fr-FR')} ${job.currency}`
                        : job.salary_min
                          ? `À partir de ${job.salary_min.toLocaleString('fr-FR')} ${job.currency}`
                          : `Jusqu'à ${job.salary_max?.toLocaleString('fr-FR')} ${job.currency}`}
                    </span>
                  )}
                  {job.posted_at && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <CalendarDaysIcon className="w-3.5 h-3.5" />
                      {formatDate(job.posted_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-[#6B9B5F] inline-block" />
                {t('sectionDescription')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-sm">
                {job.description}
              </div>
            </div>

            {/* Responsabilités */}
            {job.responsibilities && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-purple-500 inline-block" />
                  {t('sectionResponsibilities')}
                </h2>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-sm">
                  {job.responsibilities}
                </div>
              </div>
            )}

            {/* Exigences */}
            {job.requirements && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-amber-500 inline-block" />
                  {t('sectionRequirements')}
                </h2>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-sm">
                  {job.requirements}
                </div>
              </div>
            )}

            {/* Avantages */}
            {job.benefits && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
                  {t('sectionBenefits')}
                </h2>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-sm">
                  {job.benefits}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale sticky */}
          <div className="space-y-4">
            <div className="sticky top-6 space-y-4">
              {/* CTA postuler */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                  {t('interestedTitle')}
                </h3>
                {job.has_applied ? (
                  <div className="w-full py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-[#6B9B5F]" />
                    <span className="text-[#6B9B5F]">{t('applied')}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4e] text-white shadow-lg shadow-[#6B9B5F]/30 hover:shadow-xl hover:shadow-[#6B9B5F]/40 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    {t('applyButton')}
                  </button>
                )}

                {/* Préparer l'entretien */}
                <Link
                  href={`/dashboard/interview-prep/${job.id}`}
                  className="mt-3 w-full py-2.5 rounded-xl font-medium border border-[#6B9B5F]/30 bg-[#6B9B5F]/5 hover:bg-[#6B9B5F]/10 text-[#6B9B5F] flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <SparklesIcon className="w-4 h-4" />
                  {t('prepareInterview')}
                </Link>
              </div>

              {/* Infos clés */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('infoTitle')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#6B9B5F]/10 flex items-center justify-center shrink-0">
                      <BriefcaseIcon className="w-4.5 h-4.5 text-[#6B9B5F]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t('type')}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{getJobTypeLabel(job.job_type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                      <MapPinIcon className="w-4.5 h-4.5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t('modeLabel')}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{getLocationTypeLabel(job.location_type)}</p>
                    </div>
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                        <CurrencyEuroIcon className="w-4.5 h-4.5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{t('salary')}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {job.salary_min && job.salary_max
                            ? `${job.salary_min.toLocaleString('fr-FR')} – ${job.salary_max.toLocaleString('fr-FR')} ${job.currency}`
                            : job.salary_min
                              ? `Dès ${job.salary_min.toLocaleString('fr-FR')} ${job.currency}`
                              : `≤ ${job.salary_max?.toLocaleString('fr-FR')} ${job.currency}`}
                        </p>
                      </div>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                        <BuildingOfficeIcon className="w-4.5 h-4.5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{t('locationLabel')}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{job.location}</p>
                      </div>
                    </div>
                  )}
                  {job.posted_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                        <CalendarDaysIcon className="w-4.5 h-4.5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{t('publishedLabel')}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(job.posted_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de candidature */}
      {showApplicationModal && job && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#6B9B5F]/5 to-transparent">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6B9B5F] to-[#5a8a4f] flex items-center justify-center shadow-lg shadow-[#6B9B5F]/30 shrink-0">
                  <PaperAirplaneIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {t('applyForPosition')}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">{job.title}</p>
                  <p className="text-[#6B9B5F] font-medium flex items-center gap-1">
                    {job.company_name}
                    {job.company_is_verified && (
                      <CheckBadgeIcon className="w-4 h-4 text-[#6B9B5F]" title="Entreprise vérifiée" />
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Info box */}
              <div className="bg-[#F7C700]/10 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-[#F7C700] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Votre profil sera automatiquement partagé</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Les recruteurs verront votre CV et vos informations de profil.</p>
                </div>
              </div>

              {/* Sélection du CV */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  📄 Sélectionnez un CV
                </label>
                {loadingCVs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : cvs.length === 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
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
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
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
                          <p className="font-medium text-gray-900 dark:text-white">{cv.filename}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Uploadé le {new Date(cv.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        {cv.is_active && (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                            ✓ Principal
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Lettre de motivation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Lettre de motivation (optionnel)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  placeholder={t('whyIdeal')}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-4">
              <button
                onClick={() => { setShowApplicationModal(false); setCoverLetter(''); }}
                disabled={applying}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={applying}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/30 hover:shadow-xl hover:shadow-[#6B9B5F]/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {applying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('sending')}</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    <span>{t('sendApplication')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
