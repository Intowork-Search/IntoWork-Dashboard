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
  BriefcaseIcon 
} from '@heroicons/react/24/outline';

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
          
          // Calculer le pourcentage de complétion réel (même logique que la page profil)
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
            
            // Ajouter les bonus pour expérience, éducation et compétences et compter les éléments
            const experiencesCount = profileData.experiences?.length || 0;
            const educationCount = profileData.education?.length || 0;
            const skillsCount = profileData.skills?.length || 0;
            
            // Mettre à jour les compteurs
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
      
      // Essayer de charger les données du dashboard (optionnel)
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
        
        // Mettre à jour le nombre d'offres récentes
        setRecentJobsCount(recentJobs.count);
      } catch (dashboardError) {
        console.warn('Erreur lors du chargement du dashboard:', dashboardError);
        // Les données mockées seront utilisées automatiquement
      }
      
      // Mettre à jour l'horodatage
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Erreur générale:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [getToken, userRole, user?.id]); // ✅ user?.id au lieu de user pour éviter la boucle

  // Fonction pour gérer le téléchargement de CV
  const handleCVUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (file.type !== 'application/pdf') {
      alert('Veuillez sélectionner un fichier PDF.');
      return;
    }

    // Vérifier la taille (max 5MB)
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
        // Recharger les données du dashboard
        loadDashboardData();
        // Rediriger vers la page Mes CV
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
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [getToken, loadDashboardData, router]); // ⚠️ Dépendances de useCallback

  // Ouvrir le sélecteur de fichiers
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Rediriger les admins vers leur dashboard
  useEffect(() => {
    if (user && userRole === 'admin') {
      router.push('/dashboard/admin');
    }
  }, [user, userRole, router]);

  // Charger les données du dashboard au montage
  useEffect(() => {
    if (user && userRole !== 'admin') {
      loadDashboardData();
    }
  }, [user?.id, userRole, loadDashboardData]); // ✅ user?.id au lieu de user + loadDashboardData pour stabilité

  // ⚠️ CORRECTIF PERFORMANCE: Event listeners manuels supprimés
  // Les listeners window.focus et visibilitychange causaient un polling excessif
  // en combinaison avec React Query qui gère déjà le refetch intelligent.
  //
  // Si vous souhaitez réactualiser manuellement les données, utilisez le bouton
  // "Actualiser" dans l'interface (ligne 373).
  //
  // React Query gère automatiquement:
  // - Le caching intelligent (staleTime: 5 minutes)
  // - Le refetch contrôlé sur window focus (si configuré)
  // - La déduplication des requêtes
  //
  // Pour restaurer le rafraîchissement automatique de manière optimisée,
  // migrez vers des hooks React Query personnalisés (voir useDashboard.ts)

  // Fonctions utilitaires pour les classes CSS
  const getStatBgColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100';
      case 'green': return 'bg-green-100';
      case 'purple': return 'bg-purple-100';
      default: return 'bg-orange-100';
    }
  };

  const getStatTextColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      default: return 'text-orange-600';
    }
  };

  const getStatIcon = (title: string) => {
    // Mapper les titres aux icônes appropriées
    if (title.includes('Profil') || title.includes('Candidatures reçues')) return UserIcon;
    if (title.includes('CV') || title.includes('Offres')) return DocumentTextIcon;
    if (title.includes('Candidatures') || title.includes('Entretiens')) return ChartBarIcon;
    if (title.includes('Vues') || title.includes('Taux')) return EyeIcon;
    return ArrowTrendingUpIcon; // Icône par défaut
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'application': return 'bg-blue-100';
      case 'view': return 'bg-green-100';
      case 'interview': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  // Utiliser les vraies données du backend pour stats
  let stats = dashboardData?.stats || [];
  if (!stats.length && userRole === 'candidate') {
    stats = [
      {
        title: 'Profil complété',
        value: `${profileCompletion}%`,
        change: '+5%',
        changeType: 'increase',
        color: 'blue'
      },
      {
        title: 'Expériences ajoutées',
        value: experiencesCount.toString(),
        change: experiencesCount > 0 ? '+' + experiencesCount : '0',
        changeType: 'increase',
        color: 'green'
      },
      {
        title: 'Formations ajoutées',
        value: educationCount.toString(),
        change: educationCount > 0 ? '+' + educationCount : '0',
        changeType: 'increase',
        color: 'purple'
      },
      {
        title: 'Compétences ajoutées',
        value: skillsCount.toString(),
        change: skillsCount > 0 ? '+' + skillsCount : '0',
        changeType: 'increase',
        color: 'orange'
      }
    ];
  }

  // Utiliser les vraies activités du backend
  const recentActivities = realActivities.length > 0 ? realActivities : [];

  return (
    <DashboardLayout 
      title={`Bonjour ${user?.firstName} !`}
      subtitle={`Bienvenue sur votre dashboard ${userRole === 'candidate' ? 'candidat' : 'employeur'}`}
    >
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs mois dernier</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${getStatBgColor(stat.color)}`}>
                {React.createElement(getStatIcon(stat.title), { 
                  className: `w-6 h-6 ${getStatTextColor(stat.color)}` 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activité récente */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
              {lastUpdated && (
                <p className="text-xs text-gray-500 mt-1">
                  Dernière actualisation: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getActivityBgColor(activity.type)}`}>
                    {activity.type === 'application' && <DocumentTextIcon className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'view' && <EyeIcon className="w-4 h-4 text-green-600" />}
                    {activity.type === 'interview' && <UserIcon className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'update' && <DocumentTextIcon className="w-4 h-4 text-gray-600" />}
                    {activity.type === 'job_post' && <BellIcon className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span>
                      <span className="text-gray-600 ml-1">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
          </div>
          <div className="p-6 space-y-3">
            {userRole === 'candidate' ? (
              <>
                <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-blue-900">Compléter mon profil</p>
                    <p className="text-xs text-blue-700">{profileCompletion}% complété</p>
                  </div>
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </button>
                <button 
                  onClick={openFileSelector}
                  disabled={isUploadingCV}
                  className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div>
                    <p className="font-medium text-green-900">
                      {isUploadingCV ? 'Téléchargement...' : 'Télécharger un CV'}
                    </p>
                    <p className="text-xs text-green-700">
                      {isUploadingCV ? 'Traitement en cours' : 'Formats PDF acceptés (max 5MB)'}
                    </p>
                  </div>
                  <DocumentTextIcon className="w-5 h-5 text-green-600" />
                </button>
                <button 
                  onClick={() => router.push('/dashboard/jobs')}
                  className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-purple-900">Rechercher des emplois</p>
                    <p className="text-xs text-purple-700">
                      {recentJobsCount > 0 
                        ? `${recentJobsCount} nouvelle${recentJobsCount > 1 ? 's' : ''} offre${recentJobsCount > 1 ? 's' : ''}` 
                        : 'Aucune nouvelle offre'
                      }
                    </p>
                  </div>
                  <ChartBarIcon className="w-5 h-5 text-purple-600" />
                </button>
                <button 
                  onClick={() => router.push('/dashboard/cv')}
                  className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">Voir tous mes CV</p>
                    <p className="text-xs text-gray-700">Gérer mes documents</p>
                  </div>
                  <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                </button>
              </>
            ) : (
              <>
                <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" onClick={() => router.push('/dashboard/job-posts')}>
                  <div>
                    <p className="font-medium text-blue-900">Publier une offre</p>
                    <p className="text-xs text-blue-700">Créer un nouveau poste</p>
                  </div>
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors" onClick={() => router.push('/dashboard/applications')}>
                  <div>
                    <p className="font-medium text-green-900">Voir les candidats</p>
                    <p className="text-xs text-green-700">Voir toutes les candidatures reçues</p>
                  </div>
                  <UserIcon className="w-5 h-5 text-green-600" />
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors" onClick={() => router.push('/dashboard/interviews')}>
                  <div>
                    <p className="font-medium text-purple-900">Gérer les entretiens</p>
                    <p className="text-xs text-purple-700">Voir les entretiens planifiés</p>
                  </div>
                  <ChartBarIcon className="w-5 h-5 text-purple-600" />
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
    </DashboardLayout>
  );
}
