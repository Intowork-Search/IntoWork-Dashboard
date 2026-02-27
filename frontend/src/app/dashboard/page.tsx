'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { candidatesAPI, jobsAPI } from '@/lib/api';
import { getApiUrl } from '@/lib/getApiUrl';
import { dashboardAPI, DashboardData } from '@/lib/api/dashboard';
import {
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  BriefcaseIcon,
  SparklesIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid, StarIcon } from '@heroicons/react/24/solid';

export default function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const userRole = user?.role as 'candidate' | 'employer' | 'admin';

  // États pour les données du dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [realActivities, setRealActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [recentJobsCount, setRecentJobsCount] = useState<number>(0);
  const [experiencesCount, setExperiencesCount] = useState<number>(0);
  const [educationCount, setEducationCount] = useState<number>(0);
  const [skillsCount, setSkillsCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction pour charger les données du dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setError('Token d\'authentification manquant');
        return;
      }

      // Charger le profil uniquement pour les candidats
      if (userRole === 'candidate') {
        try {
          const profileData = await candidatesAPI.getMyProfile(token);

          // Calculer le pourcentage de complétion réel
          if (profileData && user) {
            const fields = [
              user.firstName,
              user.lastName,
              user.email,
              profileData.phone,
              profileData.location,
              profileData.title,
              profileData.summary
            ];
            const filledFields = fields.filter(field => field && field.toString().trim().length > 0);
            const profileCompletion = (filledFields.length / fields.length) * 100;

            // Compter les éléments
            const experiencesCount = profileData.experiences?.length || 0;
            const educationCount = profileData.education?.length || 0;
            const skillsCount = profileData.skills?.length || 0;

            setExperiencesCount(experiencesCount);
            setEducationCount(educationCount);
            setSkillsCount(skillsCount);

            const hasExperience = experiencesCount > 0;
            const hasEducation = educationCount > 0;
            const hasSkills = skillsCount > 0;

            let totalCompletion = profileCompletion * 0.6;
            if (hasExperience) totalCompletion += 15;
            if (hasEducation) totalCompletion += 15;
            if (hasSkills) totalCompletion += 10;

            const completion = Math.round(totalCompletion);
            setProfileCompletion(completion);
          }
        } catch (profileError) {
          console.warn('Erreur lors du chargement du profil:', profileError);
        }
      }

      // Charger les données du dashboard
      try {
        const [dashboardData, activities, recentJobs] = await Promise.all([
          dashboardAPI.getDashboardData(token).catch(() => null),
          dashboardAPI.getRecentActivities(token).catch(() => []),
          jobsAPI.getRecentJobsCount(7).catch(() => ({ count: 0, days: 7 }))
        ]);

        if (dashboardData) {
          setDashboardData(dashboardData);
        }

        if (activities && activities.length > 0) {
          setRealActivities(activities);
        }

        setRecentJobsCount(recentJobs.count);
      } catch (dashboardError) {
        console.warn('Erreur lors du chargement du dashboard:', dashboardError);
      }

      setLastUpdated(new Date());

    } catch (error) {
      console.error('Erreur générale:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [getToken, userRole, user?.id]);

  // Fonction pour gérer le téléchargement de CV
  const handleCVUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Veuillez sélectionner un fichier PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier ne peut pas dépasser 5MB.');
      return;
    }

    try {
      setIsUploadingCV(true);
      const token = await getToken();
      if (!token) {
        alert('Erreur d\'authentification');
        return;
      }

      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch(`${getApiUrl()}/candidates/cv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('CV téléchargé avec succès !');
        loadDashboardData();
        router.push('/dashboard/cv');
      } else {
        const errorData = await response.json();
        alert(`Erreur lors du téléchargement: ${errorData.detail || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
      alert('Erreur lors du téléchargement du CV');
    } finally {
      setIsUploadingCV(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [getToken, loadDashboardData, router]);

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Rediriger les admins vers leur dashboard
  useEffect(() => {
    if (user && userRole === 'admin') {
      router.push('/dashboard/admin');
    }
  }, [user, userRole, router]);

  // Charger les données au montage
  useEffect(() => {
    if (user && userRole !== 'admin') {
      loadDashboardData();
    }
  }, [user?.id, userRole, loadDashboardData]);

  // Activités récentes
  const recentActivities = realActivities.length > 0 ? realActivities : [];

  // Fonction pour obtenir l'heure de la journée
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Configuration des stats cards
  const getStatConfig = (index: number) => {
    const configs = [
      {
        gradient: 'from-[#6B9B5F] to-[#5a8a4f]',
        iconBg: 'bg-white/20',
        icon: UserIcon,
        shadowColor: 'shadow-[#6B9B5F]/30'
      },
      {
        gradient: 'from-[#F7C700] to-[#e5b800]',
        iconBg: 'bg-white/20',
        icon: BriefcaseIcon,
        shadowColor: 'shadow-[#F7C700]/30'
      },
      {
        gradient: 'from-[#6B46C1] to-[#5a3ba3]',
        iconBg: 'bg-white/20',
        icon: AcademicCapIcon,
        shadowColor: 'shadow-[#6B46C1]/30'
      },
      {
        gradient: 'from-[#3B82F6] to-[#2563eb]',
        iconBg: 'bg-white/20',
        icon: WrenchScrewdriverIcon,
        shadowColor: 'shadow-[#3B82F6]/30'
      }
    ];
    return configs[index % configs.length];
  };

  // Stats pour candidats
  const candidateStats = [
    {
      title: 'Profil complété',
      value: `${profileCompletion}%`,
      subtitle: profileCompletion === 100 ? 'Excellent !' : 'Continuez !',
      icon: UserIcon
    },
    {
      title: 'Expériences',
      value: experiencesCount.toString(),
      subtitle: experiencesCount > 0 ? `${experiencesCount} ajoutée${experiencesCount > 1 ? 's' : ''}` : 'À compléter',
      icon: BriefcaseIcon
    },
    {
      title: 'Formations',
      value: educationCount.toString(),
      subtitle: educationCount > 0 ? `${educationCount} ajoutée${educationCount > 1 ? 's' : ''}` : 'À compléter',
      icon: AcademicCapIcon
    },
    {
      title: 'Compétences',
      value: skillsCount.toString(),
      subtitle: skillsCount > 0 ? `${skillsCount} ajoutée${skillsCount > 1 ? 's' : ''}` : 'À compléter',
      icon: WrenchScrewdriverIcon
    }
  ];

  // Stats du dashboard API ou stats par défaut
  const stats = dashboardData?.stats || candidateStats;

  return (
    <DashboardLayout
      title={`${getGreeting()}, ${user?.firstName || 'Utilisateur'} !`}
      subtitle={userRole === 'candidate' ? 'Votre espace candidat' : 'Votre espace employeur'}
    >
      {/* Hero Section avec message de bienvenue */}
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6B9B5F] via-[#5a8a4f] to-[#4a7a3f] p-8 mb-8 shadow-xl shadow-[#6B9B5F]/20"
        style={{ animation: 'fadeIn 0.6s ease-out' }}
      >
        {/* Motifs décoratifs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F7C700]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-[#F7C700]" />
              <span className="text-white/90 text-sm font-medium">
                {userRole === 'candidate' ? 'Espace Candidat' : 'Espace Employeur'}
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Bienvenue sur votre Dashboard
            </h2>
            <p className="text-white/80 text-lg max-w-xl">
              {userRole === 'candidate'
                ? 'Gérez votre profil, explorez les opportunités et décrochez le poste de vos rêves.'
                : 'Gérez vos offres d\'emploi et trouvez les meilleurs talents pour votre entreprise.'
              }
            </p>
          </div>

          {/* Progress Ring pour candidats */}
          {userRole === 'candidate' && (
            <div className="flex-shrink-0">
              <div className="relative w-36 h-36">
                {/* Cercle de fond */}
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
                    strokeDasharray={`${profileCompletion * 3.14} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{profileCompletion}%</span>
                  <span className="text-white/70 text-sm">Profil</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(userRole === 'candidate' ? candidateStats : stats).map((stat, index) => {
          const config = getStatConfig(index);
          const IconComponent = 'icon' in stat ? stat.icon : config.icon;

          return (
            <div
              key={stat.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradient} p-6 shadow-lg ${config.shadowColor} transform hover:scale-[1.02] transition-all duration-300`}
              style={{ animation: `fadeIn 0.6s ease-out ${0.1 * (index + 1)}s both` }}
            >
              {/* Motif décoratif */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-12 h-12 ${config.iconBg} rounded-xl mb-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <p className="text-white/80 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-white mb-1">{'value' in stat ? stat.value : '0'}</p>
                <p className="text-white/70 text-sm">
                  {'subtitle' in stat ? stat.subtitle : ('change' in stat ? stat.change : '')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activité récente */}
        <div
          className="lg:col-span-2 bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden"
          style={{ animation: 'fadeIn 0.6s ease-out 0.5s both' }}
        >
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B46C1] to-[#5a3ba3] flex items-center justify-center shadow-lg shadow-[#6B46C1]/20">
                  <ClockIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Activité récente</h2>
                  {lastUpdated && (
                    <p className="text-xs text-gray-500">
                      Mis à jour à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    style={{ animation: `fadeIn 0.4s ease-out ${0.1 * index}s both` }}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.type === 'application' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'view' ? 'bg-green-100 text-green-600' :
                      activity.type === 'interview' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.type === 'application' && <DocumentTextIcon className="w-5 h-5" />}
                      {activity.type === 'view' && <EyeIcon className="w-5 h-5" />}
                      {activity.type === 'interview' && <UserIcon className="w-5 h-5" />}
                      {(activity.type === 'update' || activity.type === 'job_post') && <BellIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{activity.action}</span>
                        <span className="text-gray-600 ml-1">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <ClockIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Aucune activité récente</p>
                <p className="text-gray-400 text-sm mt-1">Vos actions apparaîtront ici</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div
          className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden"
          style={{ animation: 'fadeIn 0.6s ease-out 0.6s both' }}
        >
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F7C700] to-[#e5b800] flex items-center justify-center shadow-lg shadow-[#F7C700]/20">
                <RocketLaunchIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Actions rapides</h2>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {userRole === 'candidate' ? (
              <>
                {/* Compléter mon profil */}
                <button
                  onClick={() => router.push('/dashboard/profile')}
                  className="group w-full flex items-center justify-between p-4 text-left bg-gradient-to-r from-[#6B9B5F]/10 to-[#6B9B5F]/5 hover:from-[#6B9B5F]/20 hover:to-[#6B9B5F]/10 rounded-2xl transition-all duration-300 border border-[#6B9B5F]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6B9B5F] flex items-center justify-center shadow-md shadow-[#6B9B5F]/30">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Compléter mon profil</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#6B9B5F] rounded-full transition-all duration-500"
                            style={{ width: `${profileCompletion}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#6B9B5F] font-medium">{profileCompletion}%</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-[#6B9B5F] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Télécharger un CV */}
                <button
                  onClick={openFileSelector}
                  disabled={isUploadingCV}
                  className="group w-full flex items-center justify-between p-4 text-left bg-gradient-to-r from-[#F7C700]/10 to-[#F7C700]/5 hover:from-[#F7C700]/20 hover:to-[#F7C700]/10 rounded-2xl transition-all duration-300 border border-[#F7C700]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F7C700] flex items-center justify-center shadow-md shadow-[#F7C700]/30">
                      <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {isUploadingCV ? 'Téléchargement...' : 'Télécharger un CV'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isUploadingCV ? 'Traitement en cours' : 'PDF uniquement (max 5MB)'}
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-[#F7C700] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Rechercher des emplois */}
                <button
                  onClick={() => router.push('/dashboard/jobs')}
                  className="group w-full flex items-center justify-between p-4 text-left bg-gradient-to-r from-[#6B46C1]/10 to-[#6B46C1]/5 hover:from-[#6B46C1]/20 hover:to-[#6B46C1]/10 rounded-2xl transition-all duration-300 border border-[#6B46C1]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6B46C1] flex items-center justify-center shadow-md shadow-[#6B46C1]/30">
                      <BriefcaseIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Rechercher des emplois</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {recentJobsCount > 0
                          ? <span className="text-[#6B46C1] font-medium">{recentJobsCount} nouvelle{recentJobsCount > 1 ? 's' : ''} offre{recentJobsCount > 1 ? 's' : ''}</span>
                          : 'Parcourir les opportunités'
                        }
                      </p>
                    </div>
                  </div>
                  {recentJobsCount > 0 && (
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6B46C1] text-white text-xs font-bold flex items-center justify-center">
                      {recentJobsCount}
                    </span>
                  )}
                  {recentJobsCount === 0 && (
                    <ArrowRightIcon className="w-5 h-5 text-[#6B46C1] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                  )}
                </button>

                {/* Voir tous mes CV */}
                <button
                  onClick={() => router.push('/dashboard/cv')}
                  className="group w-full flex items-center justify-between p-4 text-left bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-2xl transition-all duration-300 border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-600 flex items-center justify-center shadow-md shadow-gray-400/30">
                      <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Voir tous mes CV</p>
                      <p className="text-xs text-gray-500 mt-0.5">Gérer mes documents</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Créer un CV */}
                <button
                  onClick={() => router.push('/cv-builder')}
                  className="group w-full flex items-center justify-between p-4 text-left bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] hover:from-[#5a8a4f] hover:to-[#4a7a3f] rounded-2xl transition-all duration-300 shadow-lg shadow-[#6B9B5F]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <PlusCircleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Créer un CV</p>
                      <p className="text-xs text-white/70 mt-0.5">CV Builder professionnel</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                </button>
              </>
            ) : (
              <>
                {/* Publier une offre */}
                <button
                  onClick={() => router.push('/dashboard/job-posts')}
                  className="group w-full flex items-center justify-between p-4 text-left bg-gradient-to-r from-[#6B9B5F]/10 to-[#6B9B5F]/5 hover:from-[#6B9B5F]/20 hover:to-[#6B9B5F]/10 rounded-2xl transition-all duration-300 border border-[#6B9B5F]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6B9B5F] flex items-center justify-center shadow-md shadow-[#6B9B5F]/30">
                      <PlusCircleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Publier une offre</p>
                      <p className="text-xs text-gray-500 mt-0.5">Créer un nouveau poste</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-[#6B9B5F] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Voir les candidats */}
                <button
                  onClick={() => router.push('/dashboard/candidates')}
                  className="group w-full flex items-center justify-between p-4 text-left bg-gradient-to-r from-[#F7C700]/10 to-[#F7C700]/5 hover:from-[#F7C700]/20 hover:to-[#F7C700]/10 rounded-2xl transition-all duration-300 border border-[#F7C700]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F7C700] flex items-center justify-center shadow-md shadow-[#F7C700]/30">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Voir les candidatures</p>
                      <p className="text-xs text-gray-500 mt-0.5">Candidatures reçues</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-[#F7C700] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Gérer les entretiens */}
                <button
                  onClick={() => router.push('/dashboard/candidates?status=interview')}
                  className="group w-full flex items-center justify-between p-4 text-left bg-gradient-to-r from-[#6B46C1]/10 to-[#6B46C1]/5 hover:from-[#6B46C1]/20 hover:to-[#6B46C1]/10 rounded-2xl transition-all duration-300 border border-[#6B46C1]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6B46C1] flex items-center justify-center shadow-md shadow-[#6B46C1]/30">
                      <ChartBarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Gérer les entretiens</p>
                      <p className="text-xs text-gray-500 mt-0.5">Entretiens planifiés</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-[#6B46C1] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Input file caché pour le téléchargement de CV */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCVUpload}
        accept=".pdf"
        className="hidden"
        aria-label="Sélectionner un fichier CV"
      />

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
