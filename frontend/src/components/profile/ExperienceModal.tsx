'use client';
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Experience } from '@/lib/api';

interface ExperienceModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (data: Omit<Experience, 'id'>) => Promise<void>;
}

export default function ExperienceModal({ isOpen, onClose, onSave }: ExperienceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(formData);
      // Reset form
      setFormData({
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: ''
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Ajouter une expérience</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fermer"
            title="Fermer"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="exp-title" className="block text-sm font-medium text-gray-700 mb-2">
              Poste <span className="text-red-500">*</span>
            </label>
            <input
              id="exp-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Ex: Développeur Full-Stack"
            />
          </div>

          <div>
            <label htmlFor="exp-company" className="block text-sm font-medium text-gray-700 mb-2">
              Entreprise <span className="text-red-500">*</span>
            </label>
            <input
              id="exp-company"
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Ex: TechCorp"
            />
          </div>

          <div>
            <label htmlFor="exp-location" className="block text-sm font-medium text-gray-700 mb-2">
              Lieu
            </label>
            <input
              id="exp-location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Ex: Dakar, Sénégal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="exp-start" className="block text-sm font-medium text-gray-700 mb-2">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                id="exp-start"
                type="text"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="YYYY-MM"
                pattern="\d{4}-\d{2}"
                title="Format: YYYY-MM (ex: 2023-01)"
              />
            </div>

            <div>
              <label htmlFor="exp-end" className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                id="exp-end"
                type="text"
                disabled={formData.is_current}
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                placeholder="YYYY-MM"
                pattern="\d{4}-\d{2}"
                title="Format: YYYY-MM (ex: 2024-12)"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="is_current"
              type="checkbox"
              checked={formData.is_current}
              onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_current" className="ml-2 text-sm text-gray-700">
              Je travaille actuellement à ce poste
            </label>
          </div>

          <div>
            <label htmlFor="exp-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="exp-description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Décrivez vos responsabilités et réalisations..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
