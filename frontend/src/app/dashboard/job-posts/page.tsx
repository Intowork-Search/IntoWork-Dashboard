'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { jobsAPI, Job } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function JobPostsPage(): React.JSX.Element {
  const { getToken } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Job>>({});
  const [saving, setSaving] = useState(false);

  // Helper functions pour les traductions
  const getJobTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      'full_time': 'Temps plein',
      'part_time': 'Temps partiel',
      'contract': 'Contrat',
      'temporary': 'Temporaire',
      'internship': 'Stage'
    };
    return labels[type] || type;
  };

  const getLocationTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      'on_site': 'Sur site',
      'remote': 'Télétravail',
      'hybrid': 'Hybride'
    };
    return labels[type] || type;
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Polling automatique toutes les 30 secondes pour synchroniser les stats en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Recharger silencieusement les jobs sans afficher le loader
      jobsAPI.getJobs().then(response => {
        setJobs(response.jobs || []);
      }).catch(err => {
        console.error('Erreur lors du rafraîchissement automatique:', err);
      });
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsAPI.getJobs();
      setJobs(response.jobs || []);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des offres:', err);
      setError('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;

    try {
      const token = await getToken();
      if (!token) return;

      await jobsAPI.deleteJob(jobId, token);
      setJobs(jobs.filter(job => job.id !== jobId));
      alert('Offre supprimée avec succès !');
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression');
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
    });
  };

  const handleCloseModal = () => {
    setEditingJob(null);
    setIsCreating(false);
    setFormData({});
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setFormData({
      currency: 'XOF',
    });
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
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const token = await getToken();
      if (!token) {
        alert('Authentification requise');
        return;
      }

      if (isCreating) {
        // Création d'une nouvelle offre
        const newJob = await jobsAPI.createJob(formData, token);
        setJobs([newJob, ...jobs]); // Ajouter en premier
        alert('Offre créée avec succès !');
      } else if (editingJob) {
        // Modification d'une offre existante
        const updatedJob = await jobsAPI.updateJob(editingJob.id, formData, token);
        setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
        alert('Offre mise à jour avec succès !');
      }
      
      handleCloseModal();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Mes Offres d'emploi"
        subtitle="Gérer vos offres d'emploi"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Mes Offres d'emploi"
      subtitle="Gérer vos offres d'emploi"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {jobs.length} offre{jobs.length > 1 ? 's' : ''} d'emploi
          </h2>
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nouvelle offre</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Aucune offre d'emploi publiée</p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Créer votre première offre
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {job.job_type}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {job.location_type}
                      </span>
                      {job.location && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {job.location}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>{job.applications_count || 0} candidature{(job.applications_count || 0) > 1 ? 's' : ''}</span>
                      <span>{job.views_count || 0} vue{(job.views_count || 0) > 1 ? 's' : ''}</span>
                      {job.salary_min && job.salary_max && (
                        <span>{job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} {job.currency}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleView(job)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Voir les détails"
                      aria-label="Voir les détails de l'offre"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(job)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Modifier"
                      aria-label="Modifier l'offre"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer"
                      aria-label="Supprimer l'offre"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de modification/création */}
      {(editingJob || isCreating) && (
        <div className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {isCreating ? 'Créer une nouvelle offre' : 'Modifier l\'offre'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fermer le modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Titre */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du poste *
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Ex: Développeur Full Stack"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Décrivez le poste en détail..."
                />
              </div>

              {/* Type de contrat */}
              <div>
                <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de contrat *
                </label>
                <select
                  id="job_type"
                  name="job_type"
                  value={formData.job_type || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Sélectionner...</option>
                  <option value="full_time">Temps plein</option>
                  <option value="part_time">Temps partiel</option>
                  <option value="contract">Contrat</option>
                  <option value="temporary">Temporaire</option>
                  <option value="internship">Stage</option>
                </select>
              </div>

              {/* Type de localisation */}
              <div>
                <label htmlFor="location_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de travail *
                </label>
                <select
                  id="location_type"
                  name="location_type"
                  value={formData.location_type || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Sélectionner...</option>
                  <option value="on_site">Sur site</option>
                  <option value="remote">Télétravail</option>
                  <option value="hybrid">Hybride</option>
                </select>
              </div>

              {/* Localisation */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Ex: Dakar, Sénégal"
                />
              </div>

              {/* Salaire */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 mb-2">
                    Salaire minimum
                  </label>
                  <input
                    id="salary_min"
                    type="number"
                    name="salary_min"
                    value={formData.salary_min || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Ex: 500000"
                  />
                </div>
                <div>
                  <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 mb-2">
                    Salaire maximum
                  </label>
                  <input
                    id="salary_max"
                    type="number"
                    name="salary_max"
                    value={formData.salary_max || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Ex: 800000"
                  />
                </div>
              </div>

              {/* Devise */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency || 'XOF'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="XOF">XOF (Franc CFA)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>

              {/* Boutons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Enregistrer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {viewingJob && (
        <div className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold text-gray-900">{viewingJob.title}</h3>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-400 hover:text-gray-600"
                title="Fermer"
                aria-label="Fermer le modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {getJobTypeLabel(viewingJob.job_type)}
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {getLocationTypeLabel(viewingJob.location_type)}
                </span>
                {viewingJob.location && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center">
                    📍 {viewingJob.location}
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Description du poste</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {viewingJob.description}
                </p>
              </div>

              {/* Salaire */}
              {viewingJob.salary_min && viewingJob.salary_max && (
                <div className="bg-linear-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">💰 Rémunération</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {viewingJob.salary_min.toLocaleString()} - {viewingJob.salary_max.toLocaleString()} {viewingJob.currency}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">par mois</p>
                </div>
              )}

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">{viewingJob.applications_count || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Candidature{(viewingJob.applications_count || 0) > 1 ? 's' : ''}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">{viewingJob.views_count || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Vue{(viewingJob.views_count || 0) > 1 ? 's' : ''}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {viewingJob.is_featured ? '⭐' : '📄'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {viewingJob.is_featured ? 'En vedette' : 'Standard'}
                  </p>
                </div>
              </div>

              {/* Informations entreprise */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">🏢 Informations entreprise</h4>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Entreprise:</span> {viewingJob.company_name}
                  </p>
                  {viewingJob.posted_at && (
                    <p className="text-gray-700">
                      <span className="font-medium">Publiée le:</span>{' '}
                      {new Date(viewingJob.posted_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={handleCloseViewModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    handleCloseViewModal();
                    handleEdit(viewingJob);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
