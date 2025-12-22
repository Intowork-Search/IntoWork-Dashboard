'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { jobsAPI, applicationsAPI } from '@/lib/api';
import {
  MapPinIcon,
  CurrencyEuroIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface JobDetail {
  id: number;
  title: string;
  description: string;
  company_name: string;
  company_logo_url?: string;
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
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

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
      console.error('Erreur lors du chargement du job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!job) return;

    try {
      setApplying(true);
      const token = await getToken();
      if (!token) {
        alert('Vous devez être connecté pour postuler');
        return;
      }

      await applicationsAPI.applyToJob(token, {
        job_id: job.id,
        cover_letter: coverLetter || undefined
      });

      alert('✅ Candidature envoyée avec succès !');
      setShowApplicationModal(false);
      setCoverLetter('');
      
      // Recharger le job pour mettre à jour has_applied
      loadJobDetail();
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
              ← Retour aux offres
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
          <span>Retour</span>
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
                  Postuler maintenant
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
              Postuler à cette offre
            </button>
          </div>
        )}
      </div>

      {/* Modal de candidature */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Postuler à cette offre</h2>
              <p className="text-gray-600 mt-1">{job.title} - {job.company_name}</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Lettre de motivation <span className="text-gray-500">(optionnel)</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Expliquez pourquoi vous êtes intéressé par ce poste et ce que vous pouvez apporter à l'entreprise..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Note :</strong> Votre CV sera automatiquement joint à votre candidature.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setCoverLetter('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={applying}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitApplication}
                  disabled={applying}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400"
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
