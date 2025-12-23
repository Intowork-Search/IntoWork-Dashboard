import React from 'react';
import { CandidateProfile } from '@/lib/api';
import { 
  UserIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

interface NextAuthUser {
  id: string;
  email: string | null | undefined;
  firstName: string;
  lastName: string;
  fullName: string | null | undefined;
  imageUrl: string | null | undefined;
  role: string;
}

interface PersonalInfoSectionProps {
  readonly user: NextAuthUser | null | undefined;
  readonly profile: CandidateProfile;
  readonly isEditing: boolean;
  readonly onUpdateProfile: (updates: Partial<CandidateProfile>) => void;
}

export default function PersonalInfoSection({ 
  user, 
  profile, 
  isEditing, 
  onUpdateProfile 
}: PersonalInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prénom */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            Prénom
          </label>
          {isEditing ? (
            <input
              id="firstName"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              value={user?.firstName || ''}
              disabled
              title="Prénom (non modifiable)"
            />
          ) : (
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900">{user?.firstName || 'Non renseigné'}</span>
            </div>
          )}
        </div>

        {/* Nom */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Nom
          </label>
          {isEditing ? (
            <input
              id="lastName"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              value={user?.lastName || ''}
              disabled
              title="Nom de famille (non modifiable)"
            />
          ) : (
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900">{user?.lastName || 'Non renseigné'}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <div className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </div>
          <div className="flex items-center">
            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-900">{user?.email}</span>
          </div>
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone
          </label>
          {isEditing ? (
            <input
              id="phone"
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              value={profile.phone || ''}
              onChange={(e) => onUpdateProfile({ phone: e.target.value })}
              placeholder="Ex: +33 6 12 34 56 78"
            />
          ) : (
            <div className="flex items-center">
              <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900">{profile.phone || 'Non renseigné'}</span>
            </div>
          )}
        </div>

        {/* Localisation */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Localisation
          </label>
          {isEditing ? (
            <input
              id="location"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              value={profile.location || ''}
              onChange={(e) => onUpdateProfile({ location: e.target.value })}
              placeholder="Paris, France"
            />
          ) : (
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900">{profile.location || 'Non renseigné'}</span>
            </div>
          )}
        </div>

        {/* Titre professionnel */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre professionnel
          </label>
          {isEditing ? (
            <input
              id="title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              value={profile.title || ''}
              onChange={(e) => onUpdateProfile({ title: e.target.value })}
              placeholder="Développeur Full Stack"
            />
          ) : (
            <div className="flex items-center">
              <BriefcaseIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900">{profile.title || 'Non renseigné'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="md:col-span-2">
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
          Bio / À propos
        </label>
        {isEditing ? (
          <textarea
            id="summary"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            value={profile.summary || ''}
            onChange={(e) => onUpdateProfile({ summary: e.target.value })}
            placeholder="Décrivez-vous en quelques lignes..."
          />
        ) : (
          <p className="text-gray-900 whitespace-pre-wrap">
            {profile.summary || 'Aucune description ajoutée'}
          </p>
        )}
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn
          </label>
          {isEditing ? (
            <input
              id="linkedin"
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              value={profile.linkedin_url || ''}
              onChange={(e) => onUpdateProfile({ linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/..."
            />
          ) : (
            <span className="text-gray-900">
              {profile.linkedin_url ? (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Voir le profil
                </a>
              ) : (
                'Non renseigné'
              )}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub
          </label>
          {isEditing ? (
            <input
              id="github"
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              value={profile.github_url || ''}
              onChange={(e) => onUpdateProfile({ github_url: e.target.value })}
              placeholder="https://github.com/..."
            />
          ) : (
            <span className="text-gray-900">
              {profile.github_url ? (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Voir le profil
                </a>
              ) : (
                'Non renseigné'
              )}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio
          </label>
          {isEditing ? (
            <input
              id="portfolio"
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              value={profile.portfolio_url || ''}
              onChange={(e) => onUpdateProfile({ portfolio_url: e.target.value })}
              placeholder="https://monportfolio.com"
            />
          ) : (
            <span className="text-gray-900">
              {profile.portfolio_url ? (
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Voir le site
                </a>
              ) : (
                'Non renseigné'
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
