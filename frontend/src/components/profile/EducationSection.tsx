import React from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { CandidateProfile } from '@/lib/api';

interface EducationSectionProps {
  readonly profile: CandidateProfile;
}

export default function EducationSection({ profile }: EducationSectionProps) {
  return (
    <div className="space-y-6">
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
