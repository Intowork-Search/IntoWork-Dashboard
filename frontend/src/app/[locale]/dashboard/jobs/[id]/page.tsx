'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useNextAuth';
import { useRouter, useParams } from 'next/navigation';
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
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  has_applied: boolean;
}

export default function JobDetailPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('jobs');
  const tc = useTranslations('common');
  const jobId = params.id as string;

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

  const getLocationTypeLabel = (locationType: string) => {
    switch (locationType) {
      case 'remote': return 'Télétravail';
      case 'hybrid': return 'Hybride';
      case 'on_site': return 'Présentiel';
      default: return locationType;
    }
  };

  const getJobTypeLabel = (jobType: string) => {
    switch (jobType) {
      case 'full_time': return 'Temps plein';
      case 'part_time': return 'Temps partiel';
      case 'contract': return 'Contrat';
      case 'temporary': return 'Temporaire';
      case 'internship': return 'Stage';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Offre non trouvée</h3>
            <button
              onClick={() => router.push('/dashboard/jobs')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('backToJobs')}
            </button>
          </div>
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
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>{tc('back')}</span>
        </button>

        {/* En-tête de l'offre */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4 flex-1">
              {job.company_logo_url && (
                <img 
                  src={job.company_logo_url} 
                  alt={job.company_name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <BuildingOfficeIcon className="w-5 h-5" />
                    <span className="font-medium">{job.company_name}</span>
                    {job.company_is_verified && (
                      <CheckBadgeIcon className="w-5 h-5 text-[#6B9B5F]" title="Entreprise vérifiée" />
                    )}
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-5 h-5" />
                      <span>{job.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bouton Postuler */}
            <div className="ml-4">
              {job.has_applied ? (
                <button 
                  disabled
                  className="px-6 py-3 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Déjà postulé
                </button>
              ) : (
                <button 
                  onClick={handleApply}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {t('apply')}
                </button>
              )}
            </div>
          </div>

          {/* Informations clés */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <BriefcaseIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900 font-medium">{getJobTypeLabel(job.job_type)}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <MapPinIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900 font-medium">{getLocationTypeLabel(job.location_type)}</span>
            </div>
            {(job.salary_min || job.salary_max) && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <CurrencyEuroIcon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900 font-medium">
                  {job.salary_min && job.salary_max 
                    ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.currency}`
                    : job.salary_min 
                      ? `À partir de ${job.salary_min.toLocaleString()} ${job.currency}`
                      : `Jusqu'à ${job.salary_max?.toLocaleString()} ${job.currency}`
                  }
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900 font-medium">{formatDate(job.posted_at)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description du poste</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {/* Responsabilités */}
        {job.responsibilities && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Responsabilités</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {job.responsibilities}
            </div>
          </div>
        )}

        {/* Exigences */}
        {job.requirements && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Exigences</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {job.requirements}
            </div>
          </div>
        )}

        {/* Avantages */}
        {job.benefits && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Avantages</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {job.benefits}
            </div>
          </div>
        )}

        {/* Bouton fixe en bas */}
        {!job.has_applied && (
          <div className="sticky bottom-8 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <button 
              onClick={handleApply}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {t('applyButton')}
            </button>
          </div>
        )}
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
