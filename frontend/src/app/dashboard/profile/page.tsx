'use client';

/**
 * Profile Page - INTOWORK Brand Design
 *
 * Refonte visuelle avec la charte graphique INTOWORK:
 * - Vert: #6B9B5F (couleur principale)
 * - Or: #F7C700 (accent)
 * - Violet: #6B46C1 (secondaire)
 * - Bleu: #3B82F6 (complémentaire)
 */

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/hooks/useNextAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { candidatesAPI, CandidateProfile } from '@/lib/api';
import {
  UserIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  SparklesIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  LinkIcon,
  TrashIcon,
  CalendarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

// Helper pour les couleurs des compétences
const getSkillColor = (category: string) => {
  switch (category) {
    case 'technical': return { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/20' };
    case 'soft': return { bg: 'bg-[#6B9B5F]/10', text: 'text-[#6B9B5F]', border: 'border-[#6B9B5F]/20' };
    case 'language': return { bg: 'bg-[#6B46C1]/10', text: 'text-[#6B46C1]', border: 'border-[#6B46C1]/20' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
};

export default function ProfilePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les modaux
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);

  // État pour le profil complet
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  // Formulaires pour les modaux
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false
  });

  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false
  });

  const [newSkill, setNewSkill] = useState<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: string;
  }>({
    name: '',
    level: 'intermediate',
    category: 'technical'
  });

  // Charger le profil au montage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) {
          setError('Token d\'authentification manquant');
          return;
        }

        const profileData = await candidatesAPI.getMyProfile(token);
        setProfile(profileData);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setError('Erreur lors du chargement du profil');
        setProfile({
          user_id: 0,
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

    if (user && !profile) {
      loadProfile();
    }
  }, [user?.id]);

  // Calculer le pourcentage de complétion
  const completionPercentage = React.useMemo(() => {
    if (!profile || !user) return 0;

    const fields = [
      user.firstName,
      user.lastName,
      user.email,
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

  // Sauvegarder le profil
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

  // Ajouter une expérience
  const handleAddExperience = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const createdExp = await candidatesAPI.addExperience(token, newExperience);
      setProfile(prev => prev ? {
        ...prev,
        experiences: [...(prev.experiences || []), createdExp]
      } : null);
      setShowExperienceModal(false);
      setNewExperience({
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        description: '',
        is_current: false
      });
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de l\'ajout de l\'expérience');
    }
  };

  // Ajouter une formation
  const handleAddEducation = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const createdEdu = await candidatesAPI.addEducation(token, newEducation);
      setProfile(prev => prev ? {
        ...prev,
        education: [...(prev.education || []), createdEdu]
      } : null);
      setShowEducationModal(false);
      setNewEducation({
        degree: '',
        institution: '',
        location: '',
        start_date: '',
        end_date: '',
        description: '',
        is_current: false
      });
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de l\'ajout de la formation');
    }
  };

  // Ajouter une compétence
  const handleAddSkill = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const createdSkill = await candidatesAPI.addSkill(token, newSkill);
      setProfile(prev => prev ? {
        ...prev,
        skills: [...(prev.skills || []), createdSkill]
      } : null);
      setShowSkillModal(false);
      setNewSkill({
        name: '',
        level: 'intermediate',
        category: 'technical'
      });
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de l\'ajout de la compétence');
    }
  };

  // Supprimer une expérience
  const handleDeleteExperience = async (expId: number) => {
    try {
      const token = await getToken();
      if (!token) return;

      await candidatesAPI.deleteExperience(token, expId);
      setProfile(prev => prev ? {
        ...prev,
        experiences: prev.experiences?.filter(e => e.id !== expId) || []
      } : null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Supprimer une formation
  const handleDeleteEducation = async (eduId: number) => {
    try {
      const token = await getToken();
      if (!token) return;

      await candidatesAPI.deleteEducation(token, eduId);
      setProfile(prev => prev ? {
        ...prev,
        education: prev.education?.filter(e => e.id !== eduId) || []
      } : null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Supprimer une compétence
  const handleDeleteSkill = async (skillId: number) => {
    try {
      const token = await getToken();
      if (!token) return;

      await candidatesAPI.deleteSkill(token, skillId);
      setProfile(prev => prev ? {
        ...prev,
        skills: prev.skills?.filter(s => s.id !== skillId) || []
      } : null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Mettre à jour le profil
  const updateProfile = (updates: Partial<CandidateProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  // Navigation sections avec couleurs
  const sections = [
    { id: 'personal', label: 'Informations', icon: UserIcon, color: '#6B9B5F' },
    { id: 'experience', label: 'Expériences', icon: BriefcaseIcon, color: '#F7C700' },
    { id: 'education', label: 'Formation', icon: AcademicCapIcon, color: '#6B46C1' },
    { id: 'skills', label: 'Compétences', icon: SparklesIcon, color: '#3B82F6' },
  ];

  // États de chargement
  if (isLoading) {
    return (
      <DashboardLayout title="Mon Profil" subtitle="Chargement...">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-16 h-16 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !profile) {
    return (
      <DashboardLayout title="Mon Profil" subtitle="Erreur">
        <div className="rounded-3xl p-8 bg-red-50 border border-red-200">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => globalThis.location.reload()}
            className="mt-4 px-6 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
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
      {/* Erreurs */}
      {error && (
        <div
          className="rounded-2xl p-4 mb-6 bg-red-50 border border-red-200"
          style={{ animation: 'fadeIn 0.4s ease-out' }}
        >
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Hero Section avec progression */}
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6B9B5F] via-[#5a8a4f] to-[#4a7a3f] p-8 mb-8 shadow-xl shadow-[#6B9B5F]/20"
        style={{ animation: 'fadeIn 0.6s ease-out' }}
      >
        {/* Motifs décoratifs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F7C700]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-3">
                <CheckCircleSolid className="w-4 h-4 text-[#F7C700]" />
                <span className="text-white/90 text-sm font-medium">Profil actif</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-white/80 text-lg">
                {profile.title || 'Titre professionnel non défini'}
              </p>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#F7C700"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${completionPercentage * 3.14} 314`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{completionPercentage}%</span>
                <span className="text-white/70 text-sm">Complété</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation latérale */}
        <div
          className="lg:col-span-1"
          style={{ animation: 'fadeIn 0.6s ease-out 0.1s both' }}
        >
          <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 space-y-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${section.color}, ${section.color}dd)` : undefined,
                    boxShadow: isActive ? `0 4px 14px -2px ${section.color}40` : undefined,
                  }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <span>{section.label}</span>
                  {section.id === 'experience' && profile.experiences?.length ? (
                    <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {profile.experiences.length}
                    </span>
                  ) : null}
                  {section.id === 'education' && profile.education?.length ? (
                    <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {profile.education.length}
                    </span>
                  ) : null}
                  {section.id === 'skills' && profile.skills?.length ? (
                    <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {profile.skills.length}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu principal */}
        <div
          className="lg:col-span-3"
          style={{ animation: 'fadeIn 0.6s ease-out 0.2s both' }}
        >
          <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* En-tête de section */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${sections.find(s => s.id === activeSection)?.color}, ${sections.find(s => s.id === activeSection)?.color}dd)`,
                      boxShadow: `0 4px 14px -2px ${sections.find(s => s.id === activeSection)?.color}40`,
                    }}
                  >
                    {activeSection === 'personal' && <UserIcon className="w-6 h-6 text-white" />}
                    {activeSection === 'experience' && <BriefcaseIcon className="w-6 h-6 text-white" />}
                    {activeSection === 'education' && <AcademicCapIcon className="w-6 h-6 text-white" />}
                    {activeSection === 'skills' && <SparklesIcon className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {activeSection === 'personal' && 'Informations personnelles'}
                      {activeSection === 'experience' && 'Expériences professionnelles'}
                      {activeSection === 'education' && 'Formation'}
                      {activeSection === 'skills' && 'Compétences'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {activeSection === 'personal' && 'Vos coordonnées et présentation'}
                      {activeSection === 'experience' && `${profile.experiences?.length || 0} expérience(s)`}
                      {activeSection === 'education' && `${profile.education?.length || 0} formation(s)`}
                      {activeSection === 'skills' && `${profile.skills?.length || 0} compétence(s)`}
                    </p>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  {activeSection === 'personal' && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F]/10 to-[#6B9B5F]/5 text-[#6B9B5F] border border-[#6B9B5F]/20 hover:from-[#6B9B5F]/20 hover:to-[#6B9B5F]/10 transition-all"
                    >
                      <PencilIcon className="w-5 h-5" />
                      <span>Modifier</span>
                    </button>
                  )}
                  {activeSection === 'personal' && isEditing && (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/30 hover:shadow-xl hover:shadow-[#6B9B5F]/40 transition-all disabled:opacity-50"
                      >
                        <CheckIcon className="w-5 h-5" />
                        <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                      >
                        <XMarkIcon className="w-5 h-5" />
                        <span>Annuler</span>
                      </button>
                    </>
                  )}
                  {activeSection === 'experience' && (
                    <button
                      onClick={() => setShowExperienceModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#F7C700] to-[#e5b800] text-white shadow-lg shadow-[#F7C700]/30 hover:shadow-xl hover:shadow-[#F7C700]/40 transition-all"
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Ajouter</span>
                    </button>
                  )}
                  {activeSection === 'education' && (
                    <button
                      onClick={() => setShowEducationModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#6B46C1] to-[#5a3ba3] text-white shadow-lg shadow-[#6B46C1]/30 hover:shadow-xl hover:shadow-[#6B46C1]/40 transition-all"
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Ajouter</span>
                    </button>
                  )}
                  {activeSection === 'skills' && (
                    <button
                      onClick={() => setShowSkillModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#3B82F6] to-[#2563eb] text-white shadow-lg shadow-[#3B82F6]/30 hover:shadow-xl hover:shadow-[#3B82F6]/40 transition-all"
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Ajouter</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Contenu de la section */}
            <div className="p-6">
              {/* Section Informations personnelles */}
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Téléphone */}
                    <div className="group">
                      <label className="flex items-center gap-2 mb-3 font-semibold text-gray-900">
                        <div className="w-8 h-8 bg-[#6B9B5F]/10 rounded-lg flex items-center justify-center">
                          <PhoneIcon className="w-4 h-4 text-[#6B9B5F]" />
                        </div>
                        Téléphone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => updateProfile({ phone: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 font-medium focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                          placeholder="+33 6 12 34 56 78"
                        />
                      ) : (
                        <div className="px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200">
                          <p className="font-medium text-gray-900">
                            {profile.phone || <span className="text-gray-400 italic">Non renseigné</span>}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Localisation */}
                    <div className="group">
                      <label className="flex items-center gap-2 mb-3 font-semibold text-gray-900">
                        <div className="w-8 h-8 bg-[#6B46C1]/10 rounded-lg flex items-center justify-center">
                          <MapPinIcon className="w-4 h-4 text-[#6B46C1]" />
                        </div>
                        Localisation
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.location || ''}
                          onChange={(e) => updateProfile({ location: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 font-medium focus:outline-none focus:border-[#6B46C1] focus:ring-4 focus:ring-[#6B46C1]/10 transition-all"
                          placeholder="Paris, France"
                        />
                      ) : (
                        <div className="px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200">
                          <p className="font-medium text-gray-900">
                            {profile.location || <span className="text-gray-400 italic">Non renseigné</span>}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Titre professionnel */}
                  <div className="group">
                    <label className="flex items-center gap-2 mb-3 font-semibold text-gray-900">
                      <div className="w-8 h-8 bg-[#F7C700]/10 rounded-lg flex items-center justify-center">
                        <BriefcaseIcon className="w-4 h-4 text-[#F7C700]" />
                      </div>
                      Titre professionnel
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.title || ''}
                        onChange={(e) => updateProfile({ title: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 font-medium focus:outline-none focus:border-[#F7C700] focus:ring-4 focus:ring-[#F7C700]/10 transition-all"
                        placeholder="ex: Développeur Full Stack"
                      />
                    ) : (
                      <div className="px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="font-medium text-gray-900">
                          {profile.title || <span className="text-gray-400 italic">Non renseigné</span>}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Résumé */}
                  <div className="group">
                    <label className="flex items-center gap-2 mb-3 font-semibold text-gray-900">
                      <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                        <EnvelopeIcon className="w-4 h-4 text-[#3B82F6]" />
                      </div>
                      Résumé professionnel
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profile.summary || ''}
                        onChange={(e) => updateProfile({ summary: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all resize-none"
                        placeholder="Décrivez votre parcours et vos objectifs..."
                      />
                    ) : (
                      <div className="px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 min-h-[120px]">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {profile.summary || <span className="text-gray-400 italic">Non renseigné</span>}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Liens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="flex items-center gap-2 mb-3 font-semibold text-gray-900">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <LinkIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        LinkedIn
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={profile.linkedin_url || ''}
                          onChange={(e) => updateProfile({ linkedin_url: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          placeholder="https://linkedin.com/in/..."
                        />
                      ) : (
                        <div className="px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200">
                          {profile.linkedin_url ? (
                            <a
                              href={profile.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6B9B5F] hover:underline font-medium"
                            >
                              Voir le profil →
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">Non renseigné</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="group">
                      <label className="flex items-center gap-2 mb-3 font-semibold text-gray-900">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <GlobeAltIcon className="w-4 h-4 text-purple-600" />
                        </div>
                        Site web / Portfolio
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={profile.website || ''}
                          onChange={(e) => updateProfile({ website: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                          placeholder="https://..."
                        />
                      ) : (
                        <div className="px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200">
                          {profile.website ? (
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6B9B5F] hover:underline font-medium"
                            >
                              Visiter le site →
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">Non renseigné</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Section Expériences */}
              {activeSection === 'experience' && (
                <div className="space-y-4">
                  {profile.experiences && profile.experiences.length > 0 ? (
                    profile.experiences.map((exp, index) => (
                      <div
                        key={exp.id || index}
                        className="group relative p-5 rounded-2xl bg-gradient-to-r from-[#F7C700]/5 to-[#F7C700]/0 border border-[#F7C700]/20 hover:border-[#F7C700]/40 hover:shadow-lg hover:shadow-[#F7C700]/10 transition-all"
                        style={{ animation: `fadeIn 0.4s ease-out ${0.1 * index}s both` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#F7C700]/10 flex items-center justify-center flex-shrink-0">
                              <BuildingOfficeIcon className="w-6 h-6 text-[#F7C700]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{exp.title}</h4>
                              <p className="text-[#F7C700] font-semibold">{exp.company}</p>
                              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPinIcon className="w-4 h-4" />
                                  {exp.location || 'Non précisé'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  {new Date(exp.start_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} -
                                  {exp.end_date ? new Date(exp.end_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Présent'}
                                </span>
                              </div>
                              {exp.description && (
                                <p className="mt-3 text-gray-600 whitespace-pre-wrap">{exp.description}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteExperience(exp.id!)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#F7C700]/10 flex items-center justify-center">
                        <BriefcaseIcon className="w-10 h-10 text-[#F7C700]" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucune expérience</h4>
                      <p className="text-gray-500 mb-6">Ajoutez vos expériences professionnelles pour enrichir votre profil</p>
                      <button
                        onClick={() => setShowExperienceModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#F7C700] to-[#e5b800] text-white shadow-lg shadow-[#F7C700]/30 hover:shadow-xl hover:shadow-[#F7C700]/40 transition-all"
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span>Ajouter une expérience</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Section Formation */}
              {activeSection === 'education' && (
                <div className="space-y-4">
                  {profile.education && profile.education.length > 0 ? (
                    profile.education.map((edu, index) => (
                      <div
                        key={edu.id || index}
                        className="group relative p-5 rounded-2xl bg-gradient-to-r from-[#6B46C1]/5 to-[#6B46C1]/0 border border-[#6B46C1]/20 hover:border-[#6B46C1]/40 hover:shadow-lg hover:shadow-[#6B46C1]/10 transition-all"
                        style={{ animation: `fadeIn 0.4s ease-out ${0.1 * index}s both` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#6B46C1]/10 flex items-center justify-center flex-shrink-0">
                              <AcademicCapIcon className="w-6 h-6 text-[#6B46C1]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{edu.degree}</h4>
                              <p className="text-[#6B46C1] font-semibold">{edu.institution}</p>
                              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPinIcon className="w-4 h-4" />
                                  {edu.location || 'Non précisé'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  {new Date(edu.start_date).getFullYear()} -
                                  {edu.end_date ? new Date(edu.end_date).getFullYear() : 'Présent'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteEducation(edu.id!)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#6B46C1]/10 flex items-center justify-center">
                        <AcademicCapIcon className="w-10 h-10 text-[#6B46C1]" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucune formation</h4>
                      <p className="text-gray-500 mb-6">Ajoutez vos formations pour mettre en avant votre parcours</p>
                      <button
                        onClick={() => setShowEducationModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#6B46C1] to-[#5a3ba3] text-white shadow-lg shadow-[#6B46C1]/30 hover:shadow-xl hover:shadow-[#6B46C1]/40 transition-all"
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span>Ajouter une formation</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Section Compétences */}
              {activeSection === 'skills' && (
                <div className="space-y-6">
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {profile.skills.map((skill, index) => {
                        const colors = getSkillColor(skill.category || '');
                        return (
                          <div
                            key={skill.id || index}
                            className={`group relative px-4 py-2.5 rounded-xl font-medium ${colors.bg} ${colors.text} border ${colors.border} hover:shadow-md transition-all`}
                            style={{ animation: `fadeIn 0.3s ease-out ${0.05 * index}s both` }}
                          >
                            <span>{skill.name}</span>
                            <button
                              onClick={() => handleDeleteSkill(skill.id!)}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-lg"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center">
                        <SparklesIcon className="w-10 h-10 text-[#3B82F6]" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucune compétence</h4>
                      <p className="text-gray-500 mb-6">Ajoutez vos compétences pour montrer votre expertise</p>
                      <button
                        onClick={() => setShowSkillModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#3B82F6] to-[#2563eb] text-white shadow-lg shadow-[#3B82F6]/30 hover:shadow-xl hover:shadow-[#3B82F6]/40 transition-all"
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span>Ajouter une compétence</span>
                      </button>
                    </div>
                  )}

                  {/* Légende des catégories */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                        <span className="text-sm text-gray-500">Technique</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#6B9B5F]"></div>
                        <span className="text-sm text-gray-500">Soft skill</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#6B46C1]"></div>
                        <span className="text-sm text-gray-500">Langue</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Expérience */}
      {showExperienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F7C700] to-[#e5b800] flex items-center justify-center shadow-lg shadow-[#F7C700]/30">
                <BriefcaseIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Nouvelle expérience</h3>
                <p className="text-gray-500">Ajoutez une expérience professionnelle</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Titre du poste *</label>
                <input
                  type="text"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#F7C700] focus:ring-4 focus:ring-[#F7C700]/10 outline-none transition-all"
                  placeholder="ex: Développeur Full Stack"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Entreprise *</label>
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#F7C700] focus:ring-4 focus:ring-[#F7C700]/10 outline-none transition-all"
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Lieu</label>
                  <input
                    type="text"
                    value={newExperience.location}
                    onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#F7C700] focus:ring-4 focus:ring-[#F7C700]/10 outline-none transition-all"
                    placeholder="Paris, France"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Date de début *</label>
                  <input
                    type="date"
                    value={newExperience.start_date}
                    onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#F7C700] focus:ring-4 focus:ring-[#F7C700]/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Date de fin</label>
                  <input
                    type="date"
                    value={newExperience.end_date}
                    onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                    disabled={newExperience.is_current}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#F7C700] focus:ring-4 focus:ring-[#F7C700]/10 outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newExperience.is_current}
                  onChange={(e) => setNewExperience({ ...newExperience, is_current: e.target.checked, end_date: '' })}
                  className="w-5 h-5 rounded border-gray-300 text-[#F7C700] focus:ring-[#F7C700]"
                />
                <span className="font-medium text-gray-700">Poste actuel</span>
              </label>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">Description</label>
                <textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#F7C700] focus:ring-4 focus:ring-[#F7C700]/10 outline-none transition-all resize-none"
                  placeholder="Décrivez vos missions et réalisations..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowExperienceModal(false)}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleAddExperience}
                disabled={!newExperience.title || !newExperience.company || !newExperience.start_date}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#F7C700] to-[#e5b800] text-white shadow-lg shadow-[#F7C700]/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formation */}
      {showEducationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#5a3ba3] flex items-center justify-center shadow-lg shadow-[#6B46C1]/30">
                <AcademicCapIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Nouvelle formation</h3>
                <p className="text-gray-500">Ajoutez une formation ou un diplôme</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Diplôme / Formation *</label>
                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#6B46C1] focus:ring-4 focus:ring-[#6B46C1]/10 outline-none transition-all"
                  placeholder="ex: Master Informatique"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Établissement *</label>
                  <input
                    type="text"
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#6B46C1] focus:ring-4 focus:ring-[#6B46C1]/10 outline-none transition-all"
                    placeholder="Nom de l'école"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Lieu</label>
                  <input
                    type="text"
                    value={newEducation.location}
                    onChange={(e) => setNewEducation({ ...newEducation, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#6B46C1] focus:ring-4 focus:ring-[#6B46C1]/10 outline-none transition-all"
                    placeholder="Paris, France"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Année de début *</label>
                  <input
                    type="date"
                    value={newEducation.start_date}
                    onChange={(e) => setNewEducation({ ...newEducation, start_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#6B46C1] focus:ring-4 focus:ring-[#6B46C1]/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Année de fin</label>
                  <input
                    type="date"
                    value={newEducation.end_date}
                    onChange={(e) => setNewEducation({ ...newEducation, end_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#6B46C1] focus:ring-4 focus:ring-[#6B46C1]/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">Description</label>
                <textarea
                  value={newEducation.description}
                  onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#6B46C1] focus:ring-4 focus:ring-[#6B46C1]/10 outline-none transition-all resize-none"
                  placeholder="Spécialisations, mentions..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowEducationModal(false)}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleAddEducation}
                disabled={!newEducation.degree || !newEducation.institution || !newEducation.start_date}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#6B46C1] to-[#5a3ba3] text-white shadow-lg shadow-[#6B46C1]/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Compétence */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563eb] flex items-center justify-center shadow-lg shadow-[#3B82F6]/30">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Nouvelle compétence</h3>
                <p className="text-gray-500">Ajoutez une compétence</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Nom de la compétence *</label>
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 outline-none transition-all"
                  placeholder="ex: React, Communication..."
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">Catégorie</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'technical', label: 'Technique', color: '#3B82F6' },
                    { value: 'soft', label: 'Soft skill', color: '#6B9B5F' },
                    { value: 'language', label: 'Langue', color: '#6B46C1' },
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setNewSkill({ ...newSkill, category: cat.value })}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        newSkill.category === cat.value
                          ? 'text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={{
                        background: newSkill.category === cat.value ? cat.color : undefined,
                        boxShadow: newSkill.category === cat.value ? `0 4px 14px -2px ${cat.color}40` : undefined,
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">Niveau</label>
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert' })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 outline-none transition-all"
                >
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowSkillModal(false)}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleAddSkill}
                disabled={!newSkill.name}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#3B82F6] to-[#2563eb] text-white shadow-lg shadow-[#3B82F6]/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
