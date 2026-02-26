"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

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
  { value: 'WELCOME_CANDIDATE', label: 'Bienvenue candidat' },
  { value: 'APPLICATION_RECEIVED', label: 'Candidature reçue' },
  { value: 'APPLICATION_REJECTED', label: 'Candidature refusée' },
  { value: 'INTERVIEW_INVITATION', label: 'Invitation entretien' },
  { value: 'INTERVIEW_CONFIRMATION', label: 'Confirmation entretien' },
  { value: 'INTERVIEW_REMINDER', label: 'Rappel entretien' },
  { value: 'OFFER_LETTER', label: 'Lettre d\'offre' },
  { value: 'ONBOARDING', label: 'Onboarding' },
  { value: 'CUSTOM', label: 'Personnalisé' },
];

export default function EmailTemplatesPage() {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email-templates`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchVariables = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email-templates/variables`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setVariables(data.variables);
      }
    } catch (error) {
      console.error('Error fetching variables:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTemplate
        ? `${process.env.NEXT_PUBLIC_API_URL}/email-templates/${editingTemplate.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/email-templates/`;
      
      const method = editingTemplate ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast.success(editingTemplate ? 'Template mis à jour' : 'Template créé');
        fetchTemplates();
        resetForm();
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment désactiver ce template ?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email-templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast.success('Template désactivé');
        fetchTemplates();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email-templates/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast.success('Template dupliqué');
        fetchTemplates();
      }
    } catch (error) {
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
          <h1 className="text-3xl font-bold">Templates d&apos;emails</h1>
          <p className="text-base-content/60 mt-1">
            Créez et gérez vos templates d&apos;emails réutilisables
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="card-title text-lg">
                    {template.name}
                    {template.is_default && (
                      <span className="badge badge-primary badge-sm">Par défaut</span>
                    )}
                    {!template.is_active && (
                      <span className="badge badge-ghost badge-sm">Inactif</span>
                    )}
                  </h3>
                  <p className="text-sm text-base-content/60 mt-1">
                    {TEMPLATE_TYPES.find(t => t.value === template.type)?.label}
                  </p>
                </div>
                <div className="dropdown dropdown-end">
                  <button tabIndex={0} className="btn btn-ghost btn-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a onClick={() => startEdit(template)}>Modifier</a></li>
                    <li><a onClick={() => handleDuplicate(template.id)}>Dupliquer</a></li>
                    <li><a onClick={() => handleDelete(template.id)} className="text-error">Désactiver</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-semibold">Sujet:</p>
                <p className="text-sm text-base-content/80">{template.subject}</p>
              </div>
              
              <div className="mt-2">
                <p className="text-sm text-base-content/60">
                  Utilisé {template.usage_count} fois
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">
              {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom du template</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {TEMPLATE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Sujet</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Corps du message</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-40"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                />
                <label className="label">
                  <span className="label-text-alt">Variables disponibles (cliquez pour insérer):</span>
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {variables.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      className="badge badge-outline badge-sm cursor-pointer hover:badge-primary"
                      onClick={() => insertVariable(variable)}
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  />
                  <span className="label-text">Template par défaut pour ce type</span>
                </label>
              </div>

              <div className="modal-action">
                <button type="button" className="btn" onClick={resetForm}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTemplate ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
