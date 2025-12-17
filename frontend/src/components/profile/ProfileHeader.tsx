import React from 'react';

interface ProfileHeaderProps {
  userName: string;
  completionPercentage: number;
  getProgressColor: (percentage: number) => string;
  getProgressWidth: (percentage: number) => string;
}

export default function ProfileHeader({ 
  userName, 
  completionPercentage, 
  getProgressColor, 
  getProgressWidth 
}: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Profil de {userName}</h2>
          <p className="text-gray-600">Complétez votre profil pour augmenter vos chances</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
            <div className="text-sm text-gray-500">Complété</div>
          </div>
          <div className="w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
                className="text-blue-600 transition-all duration-300 ease-out"
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(completionPercentage)} ${getProgressWidth(completionPercentage)}`}
        />
      </div>
    </div>
  );
}
