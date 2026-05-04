"use client";

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { getApiUrl } from '@/lib/getApiUrl';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useNextAuth';
import DashboardLayout from '@/components/DashboardLayout';
import {
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  TagIcon,
  ClockIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';

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
  const { getToken } = useAuth();
  const t = useTranslations('jobAlerts');
  const tc = useTranslations('common');
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  const [previewJobs, setPreviewJobs] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [deletingAlert, setDeletingAlert] = useState(false);
  const { confirm, isOpen: isConfirmOpen, options: confirmOptions, handleConfirm, handleCancel } = useConfirmModal();
  
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const response = await fetch(`${getApiUrl()}/job-alerts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const token = await getToken();
      if (!token) return;
      const url = editingAlert
        ? `${getApiUrl()}/job-alerts/${editingAlert.id}`
        : `${getApiUrl()}/job-alerts/`;
      
      const method = editingAlert ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingAlert ? { ...payload, is_active: true } : payload),
      });
      
      if (response.ok) {
        toast.success(editingAlert ? t('updateSuccess') : t('createSuccess'));
        fetchAlerts();
        resetForm();
      } else {
        toast.error(t('saveError'));
      }
    } catch (error) {
      toast.error(t('networkError'));
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const token = await getToken();
      if (!token) return;
      const response = await fetch(`${getApiUrl()}/job-alerts/${id}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        toast.success(t('updateSuccess'));
        fetchAlerts();
      }
    } catch (error) {
      toast.error(t('updateError'));
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: t('deleteConfirmTitle'),
      message: t('deleteConfirmMsg'),
      confirmLabel: t('delete'),
    });
    if (!ok) return;

    setDeletingAlert(true);
    try {
      const token = await getToken();
      if (!token) return;
      const response = await fetch(`${getApiUrl()}/job-alerts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        toast.success(t('deleteSuccess'));
        fetchAlerts();
      }
    } catch (error) {
      toast.error(t('deleteError'));
    } finally {
      setDeletingAlert(false);
    }
  };

  const handlePreview = async (alert: JobAlert) => {
    try {
      const token = await getToken();
      if (!token) return;
      const response = await fetch(
        `${getApiUrl()}/job-alerts/${alert.id}/preview?limit=10`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setPreviewJobs(data.matching_jobs);
        setShowPreview(true);
      }
    } catch (error) {
      toast.error(t('previewError'));
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
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#6B9B5F] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">{tc('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6B9B5F] to-[#93C587] flex items-center justify-center shadow-md">
            <BellSolid className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('headerDescription')}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6B9B5F] hover:bg-[#5A8A4E] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          {t('newAlertButton')}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('statActive'), value: alerts.filter(a => a.is_active).length, color: '#6B9B5F' },
          { label: t('statInactive'), value: alerts.filter(a => !a.is_active).length, color: '#9CA3AF' },
          { label: t('statSent'), value: alerts.reduce((s, a) => s + a.jobs_sent_count, 0), color: '#7C3AED' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
            <BellIcon className="w-10 h-10 text-[#6B9B5F]/50" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('emptyTitle')}</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            Créez votre première alerte pour recevoir automatiquement les offres qui correspondent à votre profil.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6B9B5F] hover:bg-[#5A8A4E] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <PlusIcon className="w-4 h-4" />
            {t('createFirstButton')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl border shadow-sm p-6 transition-all duration-200 hover:shadow-md ${
                alert.is_active ? 'border-green-100' : 'border-gray-100 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.is_active ? 'bg-green-50' : 'bg-gray-100'
                  }`}>
                    <BellIcon className={`w-5 h-5 ${alert.is_active ? 'text-[#6B9B5F]' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 truncate">{alert.name}</h3>
                      {alert.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-xs font-semibold text-[#6B9B5F]">
                          <CheckCircleIcon className="w-3 h-3" /> {t('statusActive')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-500">
                          <XCircleIcon className="w-3 h-3" /> {t('statusInactive')}
                        </span>
                      )}
                    </div>

                    {/* Criteria chips */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {alert.criteria.keywords && alert.criteria.keywords.length > 0 && (
                        alert.criteria.keywords.slice(0, 4).map((kw, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#6B9B5F]/8 text-[#6B9B5F] text-xs font-medium">
                            <TagIcon className="w-3 h-3" />{kw}
                          </span>
                        ))
                      )}
                      {alert.criteria.location && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium">
                          <MapPinIcon className="w-3 h-3" />{alert.criteria.location}
                        </span>
                      )}
                      {alert.criteria.job_types && alert.criteria.job_types.map((jt, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 text-xs font-medium">
                          <BriefcaseIcon className="w-3 h-3" />
                          {JOB_TYPES.find(j => j.value === jt)?.label ?? jt}
                        </span>
                      ))}
                      {alert.criteria.salary_min && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium">
                          <CurrencyDollarIcon className="w-3 h-3" />
                          {alert.criteria.salary_min.toLocaleString()} FCFA min
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {FREQUENCIES.find(f => f.value === alert.frequency)?.label ?? alert.frequency}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BuildingOfficeIcon className="w-3.5 h-3.5" />
                        {alert.jobs_sent_count} job{alert.jobs_sent_count !== 1 ? 's' : ''} envoyé{alert.jobs_sent_count !== 1 ? 's' : ''}
                      </span>
                      {alert.last_sent_at && (
                        <span>{t('lastSentLabel')} {new Date(alert.last_sent_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: toggle + actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(alert.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                      alert.is_active ? 'bg-[#6B9B5F]' : 'bg-gray-200'
                    }`}
                    title={alert.is_active ? 'Désactiver' : 'Activer'}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      alert.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                  <button
                    onClick={() => handlePreview(alert)}
                    className="p-2 rounded-xl text-gray-400 hover:text-[#6B9B5F] hover:bg-green-50 transition-colors"
                    title="Prévisualiser"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startEdit(alert)}
                    className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Modifier"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <BellIcon className="w-5 h-5 text-[#6B9B5F]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingAlert ? t('modalEditTitle') : t('modalCreateTitle')}
                </h3>
              </div>
              <button onClick={resetForm} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Nom */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom de l&apos;alerte</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/30 focus:border-[#6B9B5F] transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Développeur Python à Libreville"
                  required
                />
              </div>

              {/* Mots-clés */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('formKeywords')} <span className="text-gray-400 font-normal">{t('formKeywordsHint')}</span></label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/30 focus:border-[#6B9B5F] transition-colors"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="python, backend, développeur"
                />
              </div>

              {/* Localisation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('formLocation')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/30 focus:border-[#6B9B5F] transition-colors"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Libreville, Gabon"
                />
              </div>

              {/* Types de contrat */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('formJobTypes')}</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map((jt) => (
                    <button
                      key={jt.value}
                      type="button"
                      onClick={() => {
                        const cur = formData.job_types;
                        setFormData({
                          ...formData,
                          job_types: cur.includes(jt.value) ? cur.filter(v => v !== jt.value) : [...cur, jt.value],
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                        formData.job_types.includes(jt.value)
                          ? 'bg-[#6B9B5F] border-[#6B9B5F] text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-[#6B9B5F] hover:text-[#6B9B5F]'
                      }`}
                    >
                      {jt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salaire */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('formSalaryMin')}</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/30 focus:border-[#6B9B5F] transition-colors"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    placeholder="300 000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('formSalaryMax')}</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/30 focus:border-[#6B9B5F] transition-colors"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    placeholder="800 000"
                  />
                </div>
              </div>

              {/* Fréquence */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('formFrequency')}</label>
                <div className="flex gap-2">
                  {FREQUENCIES.map((freq) => (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, frequency: freq.value })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                        formData.frequency === freq.value
                          ? 'bg-[#6B9B5F] border-[#6B9B5F] text-white shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-[#6B9B5F] hover:text-[#6B9B5F]'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  {tc('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#6B9B5F] hover:bg-[#5A8A4E] text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                >
                  {editingAlert ? tc('update') : t('createButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                  <EyeIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Offres correspondantes</h3>
                  <p className="text-xs text-gray-500">{previewJobs.length} résultat{previewJobs.length !== 1 ? 's' : ''} trouvé{previewJobs.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {previewJobs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <BriefcaseIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="font-medium">{t('previewEmpty')}</p>
                  <p className="text-sm text-gray-400 mt-1">{t('previewEmptyHint')}</p>
                </div>
              ) : previewJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-green-50/30 transition-colors">
                  <p className="font-semibold text-gray-900">{job.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {job.location && <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{job.location}</span>}
                    {job.job_type && <span className="flex items-center gap-1"><BriefcaseIcon className="w-3.5 h-3.5" />{job.job_type}</span>}
                  </div>
                  {job.salary_min && (
                    <p className="text-xs text-[#6B9B5F] font-semibold mt-1.5">
                      {job.salary_min.toLocaleString()} – {job.salary_max?.toLocaleString()} FCFA/mois
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setShowPreview(false)} className="w-full py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                {tc('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        options={confirmOptions}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={deletingAlert}
      />
    </div>
    </DashboardLayout>
  );
}
