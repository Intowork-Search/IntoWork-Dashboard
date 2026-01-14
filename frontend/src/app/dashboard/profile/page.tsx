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
    case 'technical': return { bg: 'var(--navy-100)', text: 'var(--navy-700)' };
    case 'soft': return { bg: 'var(--sage-100)', text: 'var(--sage-700)' };
    case 'language': return { bg: '#EDE9FE', text: '#6B21A8' };
    default: return { bg: 'var(--navy-50)', text: 'var(--navy-600)' };
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return 'var(--sage-500)';
  if (percentage >= 70) return 'var(--gold-500)';
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
  }, [user?.id, getToken, profile]);

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
            borderColor: 'var(--gold-600)',
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
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{
              background: 'var(--gold-100)',
            }}>
              <UserIcon className="w-8 h-8" style={{ color: 'var(--gold-700)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{
                color: 'var(--navy-900)',
                fontFamily: 'var(--font-display)',
              }}>
                {user?.firstName} {user?.lastName}
              </h2>
              <p style={{ color: 'var(--navy-600)' }}>
                {profile.title || 'Aucun titre défini'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold mb-1" style={{
              color: 'var(--navy-900)',
              fontFamily: 'var(--font-display)',
            }}>
              {completionPercentage}%
            </p>
            <p className="text-sm" style={{ color: 'var(--navy-600)' }}>
              Profil complété
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full h-3 rounded-full overflow-hidden" style={{
          background: 'var(--navy-100)',
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
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)',
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
                    background: isActive ? 'var(--navy-900)' : 'transparent',
                    color: isActive ? 'white' : 'var(--navy-700)',
                  }}
                  onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'var(--navy-50)')}
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
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)',
          }}>
            {/* En-tête de section */}
            <div className="p-6 flex justify-between items-center" style={{
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <h3 className="text-xl font-bold" style={{
                  color: 'var(--navy-900)',
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
                      background: 'var(--gold-100)',
                      color: 'var(--gold-700)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gold-200)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gold-100)'}
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
                        background: 'var(--sage-500)',
                        color: 'white',
                      }}
                      onMouseEnter={(e) => !isSaving && (e.currentTarget.style.background = 'var(--sage-600)')}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--sage-500)'}
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                      style={{
                        background: 'var(--navy-100)',
                        color: 'var(--navy-700)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--navy-200)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--navy-100)'}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Téléphone */}
                    <div>
                      <label className="block mb-2 font-medium" style={{ color: 'var(--navy-900)' }}>
                        <PhoneIcon className="w-4 h-4 inline mr-2" />
                        Téléphone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => updateProfile({ phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none"
                          style={{
                            background: 'var(--navy-50)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--navy-900)',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--gold-600)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          placeholder="+33 6 12 34 56 78"
                        />
                      ) : (
                        <p style={{ color: 'var(--navy-700)' }}>
                          {profile.phone || 'Non renseigné'}
                        </p>
                      )}
                    </div>

                    {/* Localisation */}
                    <div>
                      <label className="block mb-2 font-medium" style={{ color: 'var(--navy-900)' }}>
                        <MapPinIcon className="w-4 h-4 inline mr-2" />
                        Localisation
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.location || ''}
                          onChange={(e) => updateProfile({ location: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none"
                          style={{
                            background: 'var(--navy-50)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--navy-900)',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--gold-600)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          placeholder="Paris, France"
                        />
                      ) : (
                        <p style={{ color: 'var(--navy-700)' }}>
                          {profile.location || 'Non renseigné'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Titre */}
                  <div>
                    <label className="block mb-2 font-medium" style={{ color: 'var(--navy-900)' }}>
                      <BriefcaseIcon className="w-4 h-4 inline mr-2" />
                      Titre professionnel
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.title || ''}
                        onChange={(e) => updateProfile({ title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none"
                        style={{
                          background: 'var(--navy-50)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--navy-900)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--gold-600)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        placeholder="ex: Développeur Full Stack"
                      />
                    ) : (
                      <p style={{ color: 'var(--navy-700)' }}>
                        {profile.title || 'Non renseigné'}
                      </p>
                    )}
                  </div>

                  {/* Résumé */}
                  <div>
                    <label className="block mb-2 font-medium" style={{ color: 'var(--navy-900)' }}>
                      Résumé professionnel
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profile.summary || ''}
                        onChange={(e) => updateProfile({ summary: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none resize-none"
                        style={{
                          background: 'var(--navy-50)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--navy-900)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--gold-600)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        placeholder="Décrivez votre parcours et vos objectifs..."
                      />
                    ) : (
                      <p className="whitespace-pre-wrap" style={{ color: 'var(--navy-700)' }}>
                        {profile.summary || 'Non renseigné'}
                      </p>
                    )}
                  </div>

                  {/* Liens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium" style={{ color: 'var(--navy-900)' }}>
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
                            background: 'var(--navy-50)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--navy-900)',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--gold-600)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          placeholder="https://linkedin.com/in/..."
                        />
                      ) : (
                        <p style={{ color: 'var(--navy-700)' }}>
                          {profile.linkedin_url ? (
                            <a
                              href={profile.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              style={{ color: 'var(--gold-700)' }}
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
                      <label className="block mb-2 font-medium" style={{ color: 'var(--navy-900)' }}>
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
                            background: 'var(--navy-50)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--navy-900)',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--gold-600)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          placeholder="https://..."
                        />
                      ) : (
                        <p style={{ color: 'var(--navy-700)' }}>
                          {profile.website ? (
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              style={{ color: 'var(--gold-700)' }}
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
                          background: 'var(--navy-50)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <h4 className="font-bold mb-1" style={{ color: 'var(--navy-900)' }}>
                          {exp.title}
                        </h4>
                        <p className="text-sm mb-2" style={{ color: 'var(--navy-600)' }}>
                          {exp.company} • {exp.location}
                        </p>
                        <p className="text-sm mb-2" style={{ color: 'var(--navy-500)' }}>
                          {new Date(exp.start_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} -
                          {exp.end_date ? new Date(exp.end_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Présent'}
                        </p>
                        {exp.description && (
                          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--navy-700)' }}>
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <BriefcaseIcon className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--navy-300)' }} />
                      <p style={{ color: 'var(--navy-600)' }}>Aucune expérience ajoutée</p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowExperienceModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                    style={{
                      background: 'var(--gold-100)',
                      color: 'var(--gold-700)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gold-200)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gold-100)'}
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
                          background: 'var(--sage-50)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <h4 className="font-bold mb-1" style={{ color: 'var(--sage-900)' }}>
                          {edu.degree}
                        </h4>
                        <p className="text-sm mb-2" style={{ color: 'var(--sage-700)' }}>
                          {edu.institution} • {edu.location}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--sage-600)' }}>
                          {new Date(edu.start_date).getFullYear()} -
                          {edu.end_date ? new Date(edu.end_date).getFullYear() : 'Présent'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <AcademicCapIcon className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--sage-300)' }} />
                      <p style={{ color: 'var(--sage-600)' }}>Aucune formation ajoutée</p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowEducationModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                    style={{
                      background: 'var(--sage-100)',
                      color: 'var(--sage-700)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--sage-200)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--sage-100)'}
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
                      <SparklesIcon className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--navy-300)' }} />
                      <p style={{ color: 'var(--navy-600)' }}>Aucune compétence ajoutée</p>
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
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <p style={{ color: 'var(--navy-700)' }}>Modal Expérience à implémenter</p>
            <button
              onClick={() => setShowExperienceModal(false)}
              className="mt-4 px-4 py-2 rounded-lg"
              style={{
                background: 'var(--navy-900)',
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
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <p style={{ color: 'var(--navy-700)' }}>Modal Formation à implémenter</p>
            <button
              onClick={() => setShowEducationModal(false)}
              className="mt-4 px-4 py-2 rounded-lg"
              style={{
                background: 'var(--navy-900)',
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
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <p style={{ color: 'var(--navy-700)' }}>Modal Compétence à implémenter</p>
            <button
              onClick={() => setShowSkillModal(false)}
              className="mt-4 px-4 py-2 rounded-lg"
              style={{
                background: 'var(--navy-900)',
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
