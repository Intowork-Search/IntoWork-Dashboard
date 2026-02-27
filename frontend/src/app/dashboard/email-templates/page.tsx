"use client";

/**
 * Page de gestion des Templates d'Emails (Employeur) - INTOWORK Brand Design
 * 
 * Permet de créer et gérer des templates d'emails réutilisables pour:
 * - Bienvenue candidat
 * - Candidature reçue/refusée
 * - Invitation/Confirmation/Rappel entretien
 * - Lettre d'offre
 * - Onboarding
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  EnvelopeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { getApiUrl } from '@/lib/getApiUrl';

interface EmailTemplate {
  id: number;
  name: string;
  type: string;
  subject: string;
  body: string;
  is_active: boolean;
  is_default: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

const TEMPLATE_TYPES = [
  { value: 'welcome_candidate', label: 'Bienvenue candidat' },
  { value: 'application_received', label: 'Candidature reçue' },
  { value: 'application_rejected', label: 'Candidature refusée' },
  { value: 'interview_invitation', label: 'Invitation entretien' },
  { value: 'interview_confirmation', label: 'Confirmation entretien' },
  { value: 'interview_reminder', label: 'Rappel entretien' },
  { value: 'offer_letter', label: 'Lettre d\'offre' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'custom', label: 'Personnalisé' },
];

export default function EmailTemplatesPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [variables, setVariables] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'WELCOME_CANDIDATE',
    subject: '',
    body: '',
    is_default: false,
  });

  useEffect(() => {
    fetchTemplates();
    fetchVariables();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const apiUrl = getApiUrl();
      console.log('🔍 Fetching templates from:', `${apiUrl}/email-templates`);
      
      const response = await fetch(`${apiUrl}/email-templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Templates loaded:', data.length, 'templates');
        setTemplates(data);
        if (data.length === 0) {
          console.log('⚠️ Liste vide - Vérifiez que votre entreprise est créée');
        }
      } else if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token invalide');
        router.push('/auth/signin');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('❌ Erreur backend:', response.status, errorData);
        toast.error(`Erreur ${response.status}: ${errorData.detail || 'Erreur lors du chargement des templates'}`);
      }
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Erreur réseau - Vérifiez votre connexion');
      } else {
        toast.error('Erreur lors du chargement des templates');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchVariables = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const apiUrl = getApiUrl();
      console.log('🔍 Fetching variables from:', `${apiUrl}/email-templates/variables`);
      
      const response = await fetch(`${apiUrl}/email-templates/variables`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('📡 Variables response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Variables loaded:', data.variables?.length || 0, 'variables');
        setVariables(data.variables || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur variables:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching variables:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = await getToken();
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const apiUrl = getApiUrl();
      const url = editingTemplate
        ? `${apiUrl}/email-templates/${editingTemplate.id}`
        : `${apiUrl}/email-templates`;
      
      const method = editingTemplate ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast.success(editingTemplate ? 'Template mis à jour' : 'Template créé');
        fetchTemplates();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erreur réseau');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment désactiver ce template ?')) return;
    
    try {
      const token = await getToken();
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/email-templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast.success('Template désactivé');
        fetchTemplates();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const token = await getToken();
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/email-templates/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast.success('Template dupliqué');
        fetchTemplates();
      } else {
        toast.error('Erreur lors de la duplication');
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Erreur lors de la duplication');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'WELCOME_CANDIDATE',
      subject: '',
      body: '',
      is_default: false,
    });
    setEditingTemplate(null);
    setShowCreateModal(false);
  };

  const startEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
      is_default: template.is_default,
    });
    setShowCreateModal(true);
  };

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      body: prev.body + ' ' + variable
    }));
  };

  if (loading) {
    return (
      <DashboardLayout title="Templates d'Emails" subtitle="Chargement...">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#F7C700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des templates...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Templates d'Emails" subtitle="Gérez vos templates de communication automatique">
      <div className="space-y-8">
        {/* Hero Section */}
        <div
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#3B82F6] via-[#2563eb] to-[#1d4ed8] p-8 shadow-xl shadow-[#3B82F6]/20"
          style={{ animation: 'fadeIn 0.6s ease-out' }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                  <EnvelopeIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-2">
                    <SparklesIcon className="w-4 h-4 text-white" />
                    <span className="text-white/90 text-sm font-medium">Communication Automatisée</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">
                    Templates d'Emails
                  </h2>
                  <p className="text-white/80 mt-1">
                    Créez des templates réutilisables pour vos communications RH
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="btn bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm shadow-lg"
              >
                <PlusIcon className="h-5 w-5" />
                Nouveau template
              </button>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <EnvelopeIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Total Templates</p>
                    <p className="text-white font-semibold text-xl">{templates.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Actifs</p>
                    <p className="text-white font-semibold text-xl">
                      {templates.filter(t => t.is_active).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <DocumentDuplicateIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Utilisations</p>
                    <p className="text-white font-semibold text-xl">
                      {templates.reduce((sum, t) => sum + t.usage_count, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md border border-gray-100">
            <EnvelopeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun template</h3>
            <p className="text-gray-600 mb-6">Créez votre premier template d'email pour automatiser vos communications</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn bg-linear-to-r from-[#6B9B5F] to-[#5a8450] hover:from-[#5a8450] hover:to-[#4a6e42] text-white shadow-md"
            >
              <PlusIcon className="h-5 w-5" />
              Créer un template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                style={{ animation: 'fadeIn 0.6s ease-out' }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {template.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="badge bg-[#3B82F6]/10 text-[#3B82F6] border-0">
                          {TEMPLATE_TYPES.find(t => t.value === template.type)?.label}
                        </span>
                        {template.is_default && (
                          <span className="badge bg-[#F7C700]/10 text-[#F7C700] border-0">
                            Par défaut
                          </span>
                        )}
                        {!template.is_active && (
                          <span className="badge bg-gray-100 text-gray-600 border-0">
                            Inactif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Sujet:</p>
                    <p className="text-sm text-gray-800">{template.subject}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Utilisé <span className="font-semibold text-[#6B9B5F]">{template.usage_count}</span> fois
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(template)}
                        className="p-2 rounded-xl text-[#3B82F6] bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 transition-all"
                        title="Modifier"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(template.id)}
                        className="p-2 rounded-xl text-[#6B9B5F] bg-[#6B9B5F]/10 hover:bg-[#6B9B5F]/20 transition-all"
                        title="Dupliquer"
                      >
                        <DocumentDuplicateIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                        title="Désactiver"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Nom du template */}
              <div className="space-y-3">
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Nom du template *
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 text-base text-gray-900 font-medium rounded-xl border-2 border-gray-300 bg-white shadow-sm focus:ring-4 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] hover:border-gray-400 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Bienvenue nouveau candidat"
                  required
                />
                <p className="text-sm text-gray-500 italic">
                  Donnez un nom descriptif pour identifier facilement ce template
                </p>
              </div>

              {/* Type de template */}
              <div className="space-y-3">
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Type de template *
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none px-5 py-4 text-base text-gray-900 font-medium rounded-xl border-2 border-gray-300 bg-white shadow-sm focus:ring-4 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] hover:border-gray-400 transition-all cursor-pointer"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    {TEMPLATE_TYPES.map((type) => (
                      <option key={type.value} value={type.value} className="text-gray-900 font-medium py-2">
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Choisissez le type d'email correspondant à votre besoin
                </p>
              </div>

              {/* Sujet de l'email */}
              <div className="space-y-3">
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Sujet de l'email *
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 text-base text-gray-900 font-medium rounded-xl border-2 border-gray-300 bg-white shadow-sm focus:ring-4 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] hover:border-gray-400 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: Bienvenue chez {company_name} !"
                  required
                />
                <p className="text-sm text-gray-500 italic">
                  Le sujet qui apparaîtra dans la boîte mail du destinataire
                </p>
              </div>

              {/* Corps du message */}
              <div className="space-y-3">
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Corps du message *
                </label>
                <textarea
                  className="w-full px-5 py-4 text-base text-gray-900 font-medium rounded-xl border-2 border-gray-300 bg-white shadow-sm focus:ring-4 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] hover:border-gray-400 transition-all resize-y min-h-[240px] placeholder:text-gray-400 placeholder:font-normal leading-relaxed"
                  rows={12}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Écrivez votre message ici...&#10;&#10;Bonjour {candidate_name},&#10;&#10;Merci pour votre candidature au poste de {job_title}.&#10;&#10;Utilisez les variables ci-dessous pour personnaliser automatiquement vos emails."
                  required
                />
                
                {/* Variables disponibles */}
                {variables.length > 0 && (
                  <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <SparklesIcon className="w-5 h-5 text-[#3B82F6]" />
                      <p className="text-base font-bold text-gray-800">
                        Variables disponibles (cliquez pour insérer)
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variables.map((variable) => (
                        <button
                          key={variable}
                          type="button"
                          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#3B82F6] bg-white border-2 border-[#3B82F6]/20 hover:bg-[#3B82F6] hover:text-white hover:border-[#3B82F6] shadow-sm hover:shadow-md transition-all transform hover:scale-105"
                          onClick={() => insertVariable(variable)}
                        >
                          {variable}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-3 italic">
                      💡 Ces variables seront automatiquement remplacées par les vraies valeurs lors de l'envoi
                    </p>
                  </div>
                )}
              </div>

              {/* Template par défaut */}
              <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200 space-y-3">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="is_default"
                    className="mt-1 w-6 h-6 rounded-lg border-2 border-gray-300 text-[#F7C700] focus:ring-4 focus:ring-[#F7C700]/20 cursor-pointer"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  />
                  <div>
                    <label htmlFor="is_default" className="text-base font-bold text-gray-800 cursor-pointer block mb-1">
                      Définir comme template par défaut
                    </label>
                    <p className="text-sm text-gray-600">
                      Ce template sera automatiquement sélectionné lors de l'envoi d'un email de ce type
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4 pt-8 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-8 py-4 rounded-xl text-base font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#6B9B5F] to-[#5a8450] hover:from-[#5a8450] hover:to-[#4a6e42] shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  {editingTemplate ? '✓ Mettre à jour le template' : '+ Créer le template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
