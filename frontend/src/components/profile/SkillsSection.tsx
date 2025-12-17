import React from 'react';
import { CheckCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { CandidateProfile } from '@/lib/api';

interface SkillsSectionProps {
  readonly profile: CandidateProfile;
  readonly skillLevelToNumber: (level: string) => number;
  readonly getSkillColor: (category: string) => string;
}

export default function SkillsSection({ 
  profile, 
  skillLevelToNumber, 
  getSkillColor 
}: SkillsSectionProps) {
  const renderStars = (level: string | number) => {
    const numLevel = typeof level === 'string' ? skillLevelToNumber(level) : level;
    return Array.from({ length: 4 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < numLevel ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {profile.skills && profile.skills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.skills.map((skill, index) => (
            <div key={skill.id || index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">{skill.name}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSkillColor(skill.category || '')}`}>
                  {skill.category}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {renderStars(skill.level)}
                <span className="text-sm text-gray-600 ml-2 capitalize">{skill.level}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune compétence ajoutée</p>
        </div>
      )}
    </div>
  );
}
