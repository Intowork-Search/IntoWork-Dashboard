import React from 'react';
import { BriefcaseIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CandidateProfile } from '@/lib/api';

interface ExperienceSectionProps {
  readonly profile: CandidateProfile;
  readonly onAdd: () => void;
}

export default function ExperienceSection({ profile, onAdd }: ExperienceSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter une expérience
        </button>
      </div>
      {profile.experiences && profile.experiences.length > 0 ? (
        profile.experiences.map((exp, index) => (
          <div key={exp.id || index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">{exp.title}</h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{exp.company}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {exp.start_date} - {exp.is_current ? 'Présent' : exp.end_date}
            </div>
            {exp.location && (
              <div className="text-sm text-gray-600 mb-2">{exp.location}</div>
            )}
            {exp.description && (
              <p className="text-gray-700">{exp.description}</p>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune expérience ajoutée</p>
        </div>
      )}
    </div>
  );
}
