import React from 'react';
import { PencilIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SectionHeaderProps {
  readonly activeSection: string;
  readonly isEditing: boolean;
  readonly isSaving: boolean;
  readonly onEdit: () => void;
  readonly onSave: () => void;
  readonly onCancel: () => void;
}

export default function SectionHeader({ 
  activeSection, 
  isEditing, 
  isSaving, 
  onEdit, 
  onSave, 
  onCancel 
}: SectionHeaderProps) {
  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'personal': return 'Informations personnelles';
      case 'experience': return 'Expériences professionnelles';
      case 'education': return 'Formations et diplômes';
      case 'skills': return 'Compétences';
      default: return '';
    }
  };

  const getSectionSubtitle = (section: string) => {
    switch (section) {
      case 'personal': return 'Vos informations de base et coordonnées';
      case 'experience': return 'Votre parcours professionnel';
      case 'education': return 'Vos formations et certifications';
      case 'skills': return 'Vos compétences techniques et soft skills';
      default: return '';
    }
  };

  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {getSectionTitle(activeSection)}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {getSectionSubtitle(activeSection)}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {isSaving && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        )}
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button
              onClick={onCancel}
              className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Modifier
          </button>
        )}
      </div>
    </div>
  );
}
