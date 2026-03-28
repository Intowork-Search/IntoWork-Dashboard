'use client';
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Education } from '@/lib/api';
import { logger } from '@/lib/logger';

interface EducationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (data: Omit<Education, 'id'>) => Promise<void>;
}

export default function EducationModal({ isOpen, onClose, onSave }: EducationModalProps) {
  const [formData, setFormData] = useState<Omit<Education, 'id'>>({
    degree: '',
    school: '',
    start_date: '',
    end_date: '',
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
        degree: '',
        school: '',
        start_date: '',
        end_date: '',
        description: ''
      });
      onClose();
    } catch (error) {
      logger.error("Erreur lors de l'ajout education:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Ajouter une formation</h3>
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
            <label htmlFor="edu-degree" className="block text-sm font-medium text-gray-700 mb-2">
              Diplôme <span className="text-red-500">*</span>
            </label>
            <input
              id="edu-degree"
              type="text"
              required
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Ex: Master en Informatique"
            />
          </div>

          <div>
            <label htmlFor="edu-school" className="block text-sm font-medium text-gray-700 mb-2">
              Établissement <span className="text-red-500">*</span>
            </label>
            <input
              id="edu-school"
              type="text"
              required
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Ex: Université Cheikh Anta Diop"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edu-start" className="block text-sm font-medium text-gray-700 mb-2">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                id="edu-start"
                type="text"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="YYYY-MM"
                pattern="\d{4}-\d{2}"
                title="Format: YYYY-MM (ex: 2020-09)"
              />
            </div>

            <div>
              <label htmlFor="edu-end" className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <input
                id="edu-end"
                type="text"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="YYYY-MM"
                pattern="\d{4}-\d{2}"
                title="Format: YYYY-MM (ex: 2024-06)"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edu-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="edu-description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Décrivez votre parcours, mention obtenue, etc..."
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
