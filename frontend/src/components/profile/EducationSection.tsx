import React from 'react';
import { AcademicCapIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CandidateProfile } from '@/lib/api';

interface EducationSectionProps {
  readonly profile: CandidateProfile;
  readonly onAdd: () => void;
}

export default function EducationSection({ profile, onAdd }: EducationSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter une formation
        </button>
      </div>
      {profile.education && profile.education.length > 0 ? (
        profile.education.map((edu, index) => (
          <div key={edu.id || index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">{edu.degree}</h4>
            </div>
            <div className="text-sm text-gray-600 mb-2">{edu.institution}</div>
            <div className="text-sm text-gray-600 mb-2">
              {edu.start_date} - {edu.is_current ? 'En cours' : edu.end_date}
            </div>
            {edu.field_of_study && (
              <div className="text-sm text-gray-600 mb-2">Spécialité: {edu.field_of_study}</div>
            )}
            {edu.description && (
              <p className="text-gray-700">{edu.description}</p>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune formation ajoutée</p>
        </div>
      )}
    </div>
  );
}
