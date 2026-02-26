"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getApiUrl } from '@/lib/getApiUrl';

interface JobAlert {
  id: number;
  name: string;
  criteria: {
    keywords?: string[];
    location?: string;
    job_types?: string[];
    location_types?: string[];
    salary_min?: number;
    salary_max?: number;
  };
  frequency: string;
  is_active: boolean;
  jobs_sent_count: number;
  last_sent_at: string | null;
  created_at: string;
}

const FREQUENCIES = [
  { value: 'INSTANT', label: 'Immédiat' },
  { value: 'DAILY', label: 'Quotidien' },
  { value: 'WEEKLY', label: 'Hebdomadaire' },
];

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Temps plein' },
  { value: 'PART_TIME', label: 'Temps partiel' },
  { value: 'CONTRACT', label: 'Contrat' },
  { value: 'TEMPORARY', label: 'Temporaire' },
  { value: 'INTERNSHIP', label: 'Stage' },
];

const LOCATION_TYPES = [
  { value: 'ON_SITE', label: 'Sur site' },
  { value: 'REMOTE', label: 'À distance' },
  { value: 'HYBRID', label: 'Hybride' },
];

export default function JobAlertsPage() {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  const [previewJobs, setPreviewJobs] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    location: '',
    job_types: [] as string[],
    location_types: [] as string[],
    salary_min: '',
    salary_max: '',
    frequency: 'DAILY',
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/job-alerts`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Préparer les critères
    const criteria = {
      keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : undefined,
      location: formData.location || undefined,
      job_types: formData.job_types.length > 0 ? formData.job_types : undefined,
      location_types: formData.location_types.length > 0 ? formData.location_types : undefined,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
    };
    
    const payload = {
      name: formData.name,
      criteria,
      frequency: formData.frequency,
    };
    
    try {
      const url = editingAlert
        ? `${getApiUrl()}/job-alerts/${editingAlert.id}`
        : `${getApiUrl()}/job-alerts/`;
      
      const method = editingAlert ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingAlert ? { ...payload, is_active: true } : payload),
      });
      
      if (response.ok) {
        toast.success(editingAlert ? 'Alerte mise à jour' : 'Alerte créée');
        fetchAlerts();
        resetForm();
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const response = await fetch(`${getApiUrl()}/job-alerts/${id}/toggle`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast.success('Alerte mise à jour');
        fetchAlerts();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette alerte ?')) return;
    
    try {
      const response = await fetch(`${getApiUrl()}/job-alerts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast.success('Alerte supprimée');
        fetchAlerts();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handlePreview = async (alert: JobAlert) => {
    try {
      const response = await fetch(
        `${getApiUrl()}/job-alerts/${alert.id}/preview?limit=10`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setPreviewJobs(data.matching_jobs);
        setShowPreview(true);
      }
    } catch (error) {
      toast.error('Erreur lors de la prévisualisation');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      keywords: '',
      location: '',
      job_types: [],
      location_types: [],
      salary_min: '',
      salary_max: '',
      frequency: 'DAILY',
    });
    setEditingAlert(null);
    setShowCreateModal(false);
  };

  const startEdit = (alert: JobAlert) => {
    setEditingAlert(alert);
    setFormData({
      name: alert.name,
      keywords: alert.criteria.keywords?.join(', ') || '',
      location: alert.criteria.location || '',
      job_types: alert.criteria.job_types || [],
      location_types: alert.criteria.location_types || [],
      salary_min: alert.criteria.salary_min?.toString() || '',
      salary_max: alert.criteria.salary_max?.toString() || '',
      frequency: alert.frequency,
    });
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Alertes emploi</h1>
          <p className="text-base-content/60 mt-1">
            Recevez des notifications quand de nouveaux jobs correspondent à vos critères
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Nouvelle alerte
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="card-title">{alert.name}</h3>
                    <input
                      type="checkbox"
                      className="toggle toggle-success"
                      checked={alert.is_active}
                      onChange={() => handleToggle(alert.id)}
                    />
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {alert.criteria.keywords && (
                      <div>
                        <p className="text-sm font-semibold">Mots-clés:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {alert.criteria.keywords.map((keyword, i) => (
                            <span key={i} className="badge badge-sm">{keyword}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {alert.criteria.location && (
                      <div>
                        <p className="text-sm font-semibold">Localisation:</p>
                        <p className="text-sm">{alert.criteria.location}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-semibold">Fréquence:</p>
                      <p className="text-sm">
                        {FREQUENCIES.find(f => f.value === alert.frequency)?.label}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold">Jobs envoyés:</p>
                      <p className="text-sm">{alert.jobs_sent_count}</p>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown dropdown-end">
                  <button tabIndex={0} className="btn btn-ghost btn-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a onClick={() => handlePreview(alert)}>Prévisualiser</a></li>
                    <li><a onClick={() => startEdit(alert)}>Modifier</a></li>
                    <li><a onClick={() => handleDelete(alert.id)} className="text-error">Supprimer</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {alerts.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-base-content/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-base-content/60 mt-4">Aucune alerte configurée</p>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary mt-4">
              Créer votre première alerte
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingAlert ? 'Modifier l\'alerte' : 'Nouvelle alerte'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom de l&apos;alerte</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Jobs Python à Paris"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Mots-clés (séparés par des virgules)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="python, backend, django"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Localisation</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Paris, France"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Salaire min (€/an)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Salaire max (€/an)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Fréquence d&apos;envoi</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  {FREQUENCIES.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-action">
                <button type="button" className="btn" onClick={resetForm}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAlert ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">
              Jobs correspondants ({previewJobs.length})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {previewJobs.map((job) => (
                <div key={job.id} className="card bg-base-200">
                  <div className="card-body p-4">
                    <h4 className="font-semibold">{job.title}</h4>
                    <p className="text-sm text-base-content/60">
                      {job.location} • {job.location_type} • {job.job_type}
                    </p>
                    {job.salary_min && (
                      <p className="text-sm">
                        {job.salary_min}€ - {job.salary_max}€/an
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="modal-action">
              <button className="btn" onClick={() => setShowPreview(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
