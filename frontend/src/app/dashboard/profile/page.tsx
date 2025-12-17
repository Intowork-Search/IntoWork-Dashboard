'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileHeader from '@/components/profile/ProfileHeader';
import SectionNavigation from '@/components/profile/SectionNavigation';
import SectionHeader from '@/components/profile/SectionHeader';
import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
import ExperienceSection from '@/components/profile/ExperienceSection';
import EducationSection from '@/components/profile/EducationSection';
import SkillsSection from '@/components/profile/SkillsSection';
import '../../../styles/profile.css';
import { candidatesAPI, CandidateProfile } from '@/lib/api';

// Helpers pour les compétences et la progression
const skillLevelToNumber = (level: string): number => {
  switch (level) {
    case 'beginner': return 1;
    case 'intermediate': return 2;
    case 'advanced': return 3;
    case 'expert': return 4;
    default: return 1;
  }
};

const getSkillColor = (category: string) => {
  switch (category) {
    case 'technical': return 'bg-blue-100 text-blue-800';
    case 'soft': return 'bg-green-100 text-green-800';
    case 'language': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-green-500';
  if (percentage >= 70) return 'bg-blue-500';
  if (percentage >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getProgressWidth = (percentage: number) => {
  if (percentage >= 90) return 'w-full';
  if (percentage >= 80) return 'w-5/6';
  if (percentage >= 70) return 'w-4/5';
  if (percentage >= 60) return 'w-3/5';
  if (percentage >= 50) return 'w-1/2';
  if (percentage >= 40) return 'w-2/5';
  if (percentage >= 30) return 'w-1/3';
  if (percentage >= 20) return 'w-1/5';
  if (percentage >= 10) return 'w-1/6';
  return 'w-0';
};

export default function ProfilePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État pour le profil complet
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  // Charger le profil au montage du composant
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = await getToken();
        console.log('DEBUG: Token récupéré:', token ? `${token.substring(0, 50)}...` : 'null');
        if (!token) {
          setError('Token d\'authentification manquant');
          return;
        }
        
        console.log('DEBUG: Appel API avec token');
        const profileData = await candidatesAPI.getMyProfile(token);
        setProfile(profileData);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setError('Erreur lors du chargement du profil');
        // Créer un profil vide si aucun profil n'existe
        setProfile({
          user_id: 0, // Sera rempli par l'API
          phone: '',
          location: '',
          title: '',
          summary: '',
          website: '',
          linkedin_url: '',
          github_url: '',
          portfolio_url: '',
          availability: 'immediately',
          is_remote_ok: false,
          is_relocation_ok: false,
          experiences: [],
          education: [],
          skills: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user, getToken]);

  // Calculer le pourcentage de complétion basé sur le profil
  const completionPercentage = React.useMemo(() => {
    if (!profile || !user) return 0;
    
    const fields = [
      user.firstName,
      user.lastName,
      user.emailAddresses[0]?.emailAddress,
      profile.phone,
      profile.location,
      profile.title,
      profile.summary
    ];
    const filledFields = fields.filter(field => field && field.trim().length > 0);
    const profileCompletion = (filledFields.length / fields.length) * 100;
    
    const hasExperience = (profile.experiences?.length || 0) > 0;
    const hasEducation = (profile.education?.length || 0) > 0;
    const hasSkills = (profile.skills?.length || 0) > 0;
    
    let totalCompletion = profileCompletion * 0.6;
    if (hasExperience) totalCompletion += 15;
    if (hasEducation) totalCompletion += 15;
    if (hasSkills) totalCompletion += 10;
    
    return Math.round(totalCompletion);
  }, [profile, user]);

  // Fonction pour sauvegarder le profil
  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        setError('Token d\'authentification manquant');
        return;
      }
      
      const updatedProfile = await candidatesAPI.updateMyProfile(token, profile);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde du profil');
    } finally {
      setIsSaving(false);
    }
  };

  // Fonctions pour mettre à jour le profil localement
  const updateProfile = (updates: Partial<CandidateProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  // États de chargement et d'erreur
  if (isLoading) {
    return (
      <DashboardLayout title="Mon Profil" subtitle="Chargement...">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !profile) {
    return (
      <DashboardLayout title="Mon Profil" subtitle="Erreur">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => globalThis.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) return null;

  return (
    <DashboardLayout
      title="Mon Profil"
      subtitle="Gérez vos informations personnelles et professionnelles"
    >
      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* En-tête avec progression */}
      <ProfileHeader 
        userName={user?.firstName || ''}
        completionPercentage={completionPercentage}
        getProgressColor={getProgressColor}
        getProgressWidth={getProgressWidth}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation latérale */}
        <div className="lg:col-span-1">
          <SectionNavigation 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* En-tête de section */}
            <SectionHeader 
              activeSection={activeSection}
              isEditing={isEditing}
              isSaving={isSaving}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />

            {/* Contenu de la section */}
            <div className="p-6">
              {activeSection === 'personal' && (
                <PersonalInfoSection 
                  user={user}
                  profile={profile}
                  isEditing={isEditing}
                  onUpdateProfile={updateProfile}
                />
              )}

              {activeSection === 'experience' && (
                <ExperienceSection profile={profile} />
              )}

              {activeSection === 'education' && (
                <EducationSection profile={profile} />
              )}

              {activeSection === 'skills' && (
                <SkillsSection 
                  profile={profile}
                  skillLevelToNumber={skillLevelToNumber}
                  getSkillColor={getSkillColor}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
