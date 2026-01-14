'use client';

/**
 * Profile Page - Executive Elegance Design
 *
 * Refonte visuelle avec:
 * - Palette Executive Elegance (Navy, Gold, Sage)
 * - Architecture simplifiée avec composants inline
 * - Animations élégantes
 * - Design cohérent avec le reste du dashboard
 */

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/hooks/useNextAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { candidatesAPI, CandidateProfile, Experience, Education, Skill } from '@/lib/api';
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
} from '@heroicons/react/24/outline';

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
    case 'technical': return { bg: '#F1F5F9', text: '#334155' };
    case 'soft': return { bg: '#DCFCE7', text: '#15803D' };
    case 'language': return { bg: '#EDE9FE', text: '#6B21A8' };
    default: return { bg: '#F8FAFC', text: '#475569' };
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return '#22C55E';
  if (percentage >= 70) return '#F59E0B';
  if (percentage >= 50) return '#F59E0B';
  return '#EF4444';
};

export default function ProfilePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les modaux (simplifiés - inline dans cette version)
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);

  // État pour le profil complet
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

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
        // Créer un profil vide
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
  }, [user?.id]); // ✅ Retiré getToken et profile pour éviter la boucle

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

  // Mettre à jour le profil
  const updateProfile = (updates: Partial<CandidateProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  // États de chargement
  if (isLoading) {
    return (
      <DashboardLayout title="Mon Profil" subtitle="Chargement...">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{
            borderColor: '#D97706',
            borderTopColor: 'transparent',
          }}></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !profile) {
    return (
      <DashboardLayout title="Mon Profil" subtitle="Erreur">
        <div className="rounded-xl p-6" style={{
          background: '#FEE2E2',
          border: '1px solid #FCA5A5',
        }}>
          <p style={{ color: '#991B1B' }}>{error}</p>
          <button
            onClick={() => globalThis.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: '#DC2626',
              color: 'white',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#B91C1C'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#DC2626'}
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
        <div className="rounded-xl p-4 mb-6" style={{
          background: '#FEE2E2',
          border: '1px solid #FCA5A5',
        }}>
          <p style={{ color: '#991B1B' }}>{error}</p>
        </div>
      )}

      {/* En-tête avec progression */}
      <div className="rounded-2xl p-6 mb-8 animate-elegant-fade-in" style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{
              background: '#FEF3C7',
            }}>
              <UserIcon className="w-8 h-8" style={{ color: '#B45309' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{
                color: '#0F172A',
                fontFamily: 'var(--font-display)',
              }}>
                {user?.firstName} {user?.lastName}
              </h2>
              <p style={{ color: '#475569' }}>
                {profile.title || 'Aucun titre défini'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold mb-1" style={{
              color: '#0F172A',
              fontFamily: 'var(--font-display)',
            }}>
              {completionPercentage}%
            </p>
            <p className="text-sm" style={{ color: '#475569' }}>
              Profil complété
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full h-3 rounded-full overflow-hidden" style={{
          background: '#F1F5F9',
        }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${completionPercentage}%`,
              background: getProgressColor(completionPercentage),
            }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation latérale */}
        <div className="lg:col-span-1 animate-elegant-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="rounded-2xl p-4 space-y-2" style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}>
            {[
              { id: 'personal', label: 'Informations', icon: UserIcon },
              { id: 'experience', label: 'Expériences', icon: BriefcaseIcon },
              { id: 'education', label: 'Formation', icon: AcademicCapIcon },
              { id: 'skills', label: 'Compétences', icon: SparklesIcon },
            ].map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                  style={{
                    background: isActive ? '#0F172A' : 'transparent',
                    color: isActive ? 'white' : '#334155',
                  }}
                  onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon className="w-5 h-5" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3 animate-elegant-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="rounded-2xl" style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}>
            {/* En-tête de section */}
            <div className="p-6 flex justify-between items-center" style={{
              borderBottom: '1px solid #E2E8F0',
            }}>
              <div>
                <h3 className="text-xl font-bold" style={{
                  color: '#0F172A',
                  fontFamily: 'var(--font-display)',
                }}>
                  {activeSection === 'personal' && 'Informations personnelles'}
                  {activeSection === 'experience' && 'Expériences professionnelles'}
                  {activeSection === 'education' && 'Formation'}
                  {activeSection === 'skills' && 'Compétences'}
                </h3>
              </div>
              <div className="flex gap-2">
                {!isEditing && activeSection === 'personal' && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                    style={{
                      background: '#FEF3C7',
                      color: '#B45309',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FDE68A'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FEF3C7'}
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                      style={{
                        background: '#22C55E',
                        color: 'white',
                      }}
                      onMouseEnter={(e) => !isSaving && (e.currentTarget.style.background = '#16A34A')}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#22C55E'}
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                      style={{
                        background: '#F1F5F9',
                        color: '#334155',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Annuler</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Contenu de la section */}
            <div className="p-6">
              {/* Section Informations personnelles */}
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  {/* En-tête élégant */}
                  <div className="bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="text-gray-600 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                          Profil actif
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Téléphone */}
                    <div className="group">
                      <label className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <PhoneIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        Téléphone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => updateProfile({ phone: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl transition-all duration-300 focus:outline-none font-medium"
                          style={{
                            background: '#F8FAFC',
                            border: '2px solid #E2E8F0',
                            color: '#0F172A',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#3B82F6';
                            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
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
                      <label className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <MapPinIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        Localisation
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.location || ''}
                          onChange={(e) => updateProfile({ location: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl transition-all duration-300 focus:outline-none font-medium"
                          style={{
                            background: '#F8FAFC',
                            border: '2px solid #E2E8F0',
                            color: '#0F172A',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#8B5CF6';
                            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
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

                  {/* Titre */}
                  <div className="group">
                    <label className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                        <BriefcaseIcon className="w-5 h-5 text-pink-600" />
                      </div>
                      Titre professionnel
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.title || ''}
                        onChange={(e) => updateProfile({ title: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl transition-all duration-300 focus:outline-none font-medium"
                        style={{
                          background: '#F8FAFC',
                          border: '2px solid #E2E8F0',
                          color: '#0F172A',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#EC4899';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(236, 72, 153, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
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
                    <label className="block mb-2 font-semibold text-gray-900">
                      Résumé professionnel
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profile.summary || ''}
                        onChange={(e) => updateProfile({ summary: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none resize-none"
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          color: '#0F172A',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#D97706';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        placeholder="Décrivez votre parcours et vos objectifs..."
                      />
                    ) : (
                      <p className="whitespace-pre-wrap" style={{ color: '#334155' }}>
                        {profile.summary || 'Non renseigné'}
                      </p>
                    )}
                  </div>

                  {/* Liens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium" style={{ color: '#0F172A' }}>
                        <LinkIcon className="w-4 h-4 inline mr-2" />
                        LinkedIn
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={profile.linkedin_url || ''}
                          onChange={(e) => updateProfile({ linkedin_url: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none"
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#0F172A',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#D97706';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          placeholder="https://linkedin.com/in/..."
                        />
                      ) : (
                        <p style={{ color: '#334155' }}>
                          {profile.linkedin_url ? (
                            <a
                              href={profile.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              style={{ color: '#B45309' }}
                            >
                              Voir le profil
                            </a>
                          ) : (
                            'Non renseigné'
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium" style={{ color: '#0F172A' }}>
                        <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                        Site web / Portfolio
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={profile.website || ''}
                          onChange={(e) => updateProfile({ website: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none"
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#0F172A',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#D97706';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          placeholder="https://..."
                        />
                      ) : (
                        <p style={{ color: '#334155' }}>
                          {profile.website ? (
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              style={{ color: '#B45309' }}
                            >
                              Visiter le site
                            </a>
                          ) : (
                            'Non renseigné'
                          )}
                        </p>
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
                        className="p-4 rounded-xl"
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <h4 className="font-bold mb-1" style={{ color: '#0F172A' }}>
                          {exp.title}
                        </h4>
                        <p className="text-sm mb-2" style={{ color: '#475569' }}>
                          {exp.company} • {exp.location}
                        </p>
                        <p className="text-sm mb-2" style={{ color: '#64748B' }}>
                          {new Date(exp.start_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} -
                          {exp.end_date ? new Date(exp.end_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Présent'}
                        </p>
                        {exp.description && (
                          <p className="text-sm whitespace-pre-wrap" style={{ color: '#334155' }}>
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <BriefcaseIcon className="w-12 h-12 mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                      <p style={{ color: '#475569' }}>Aucune expérience ajoutée</p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowExperienceModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                    style={{
                      background: '#FEF3C7',
                      color: '#B45309',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FDE68A'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FEF3C7'}
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Ajouter une expérience</span>
                  </button>
                </div>
              )}

              {/* Section Formation */}
              {activeSection === 'education' && (
                <div className="space-y-4">
                  {profile.education && profile.education.length > 0 ? (
                    profile.education.map((edu, index) => (
                      <div
                        key={edu.id || index}
                        className="p-4 rounded-xl"
                        style={{
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                        }}
                      >
                        <h4 className="font-bold mb-1" style={{ color: '#14532D' }}>
                          {edu.degree}
                        </h4>
                        <p className="text-sm mb-2" style={{ color: '#15803D' }}>
                          {edu.institution} • {edu.location}
                        </p>
                        <p className="text-sm" style={{ color: '#16A34A' }}>
                          {new Date(edu.start_date).getFullYear()} -
                          {edu.end_date ? new Date(edu.end_date).getFullYear() : 'Présent'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <AcademicCapIcon className="w-12 h-12 mx-auto mb-3" style={{ color: '#86EFAC' }} />
                      <p style={{ color: '#16A34A' }}>Aucune formation ajoutée</p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowEducationModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                    style={{
                      background: '#DCFCE7',
                      color: '#15803D',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#BBF7D0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#DCFCE7'}
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Ajouter une formation</span>
                  </button>
                </div>
              )}

              {/* Section Compétences */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => {
                        const colors = getSkillColor(skill.category || '');
                        return (
                          <div
                            key={skill.id || index}
                            className="px-4 py-2 rounded-lg font-medium"
                            style={{
                              background: colors.bg,
                              color: colors.text,
                            }}
                          >
                            {skill.name}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <SparklesIcon className="w-12 h-12 mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                      <p style={{ color: '#475569' }}>Aucune compétence ajoutée</p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowSkillModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                    style={{
                      background: '#F5F3FF',
                      color: '#6B21A8',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#EDE9FE'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F5F3FF'}
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Ajouter une compétence</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals TODO: Implémenter les modaux Executive Elegance */}
      {showExperienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          background: 'rgba(15, 23, 42, 0.5)',
        }}>
          <div className="rounded-2xl p-6 max-w-2xl w-full" style={{
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <p style={{ color: '#334155' }}>Modal Expérience à implémenter</p>
            <button
              onClick={() => setShowExperienceModal(false)}
              className="mt-4 px-4 py-2 rounded-lg"
              style={{
                background: '#0F172A',
                color: 'white',
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {showEducationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          background: 'rgba(15, 23, 42, 0.5)',
        }}>
          <div className="rounded-2xl p-6 max-w-2xl w-full" style={{
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <p style={{ color: '#334155' }}>Modal Formation à implémenter</p>
            <button
              onClick={() => setShowEducationModal(false)}
              className="mt-4 px-4 py-2 rounded-lg"
              style={{
                background: '#0F172A',
                color: 'white',
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          background: 'rgba(15, 23, 42, 0.5)',
        }}>
          <div className="rounded-2xl p-6 max-w-2xl w-full" style={{
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <p style={{ color: '#334155' }}>Modal Compétence à implémenter</p>
            <button
              onClick={() => setShowSkillModal(false)}
              className="mt-4 px-4 py-2 rounded-lg"
              style={{
                background: '#0F172A',
                color: 'white',
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
