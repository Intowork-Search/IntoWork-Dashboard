'use client';
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Skill } from '@/lib/api';

interface SkillModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (data: Omit<Skill, 'id'>) => Promise<void>;
}

export default function SkillModal({ isOpen, onClose, onSave }: SkillModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    category: 'technique'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(formData);
      // Reset form
      setFormData({
        name: '',
        level: 'intermediate',
        category: 'technique'
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
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Ajouter une compétence</h3>
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
            <label htmlFor="skill-name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la compétence <span className="text-red-500">*</span>
            </label>
            <input
              id="skill-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Ex: React, Python, Communication..."
            />
          </div>

          <div>
            <label htmlFor="skill-category" className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              id="skill-category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              title="Sélectionnez une catégorie"
            >
              <option value="technique">Technique</option>
              <option value="soft-skill">Soft Skills</option>
              <option value="langue">Langue</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label htmlFor="skill-level" className="block text-sm font-medium text-gray-700 mb-2">
              Niveau <span className="text-red-500">*</span>
            </label>
            <select
              id="skill-level"
              required
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              title="Sélectionnez votre niveau"
            >
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
              <option value="expert">Expert</option>
            </select>
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
