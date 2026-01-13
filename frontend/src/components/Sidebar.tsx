'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { candidatesAPI, jobsAPI, applicationsAPI } from '@/lib/api';
import { 
  HomeIcon, 
  UserIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  readonly userRole: 'candidate' | 'employer' | 'admin';
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description: string;
}

function getEmployerNavigation(jobsCount: number): NavItem[] {
  return [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon, 
      description: "Vue d'ensemble de votre activité"
    },
    { 
      name: 'Mon Entreprise', 
      href: '/dashboard/company', 
      icon: BuildingOfficeIcon, 
      description: "Gérer votre profil d'entreprise"
    },
    { 
      name: "Offres d'emploi", 
      href: '/dashboard/job-posts', 
      icon: DocumentTextIcon, 
      badge: jobsCount,
      description: "Gérer vos offres d'emploi"
    },
    { 
      name: 'Candidats', 
      href: '/dashboard/candidates', 
      icon: UserIcon, 
      badge: undefined, // À rendre dynamique si besoin
      description: 'Voir toutes les candidatures reçues'
    },
    { 
      name: 'Paramètres', 
      href: '/dashboard/settings', 
      icon: Cog6ToothIcon, 
      description: 'Configuration de votre compte'
    },
  ];
}

function getAdminNavigation(): NavItem[] {
  return [
    { 
      name: 'Back-office Admin', 
      href: '/dashboard/admin', 
      icon: ChartBarIcon, 
      description: "Gestion de la plateforme"
    },
    { 
      name: 'Paramètres', 
      href: '/dashboard/settings', 
      icon: Cog6ToothIcon, 
      description: 'Configuration de votre compte'
    },
  ];
}

export default function Sidebar({ userRole }: SidebarProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [cvCount, setCvCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);

  // Récupérer le nombre de CV pour les candidats, le nombre d'emplois et de candidatures
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (userRole === 'candidate' && user && token) {
          // Récupérer le nombre de CV
          const cvs = await candidatesAPI.listCVs(token);
          setCvCount(cvs.length);
          // Récupérer le nombre d'emplois récents (pour candidats)
          const recentJobs = await jobsAPI.getRecentJobsCount(7);
          setJobsCount(recentJobs.count);
          // Récupérer le nombre de candidatures
          const applicationsCount = await applicationsAPI.getApplicationsCount(token);
          setApplicationsCount(applicationsCount);
        } else if (userRole === 'employer' && user && token) {
          // Récupérer le nombre d'offres actives de l'employeur
          const response = await jobsAPI.getMyJobs(token);
          setJobsCount(response.jobs ? response.jobs.length : 0);
        }
        // Pour les admins, on ne charge aucune donnée ici
      } finally {
        // rien à faire ici, mais le finally est requis pour la syntaxe
      }
    };
    
    // Ne charger les données que si ce n'est pas un admin
    if (userRole !== 'admin') {
      fetchData();
    }
  }, [userRole, user, getToken]);

  // Créer la navigation candidate avec le badge CV dynamique
  const candidateNavigation: NavItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon, 
      description: 'Vue d\'ensemble de votre activité'
    },
    { 
      name: 'Mon Profil', 
      href: '/dashboard/profile', 
      icon: UserIcon, 
      description: 'Gérer vos informations personnelles'
    },
    { 
      name: 'Mes CV', 
      href: '/dashboard/cv', 
      icon: DocumentTextIcon, 
      badge: cvCount,
      description: 'Gérer et optimiser vos CV'
    },
    { 
      name: 'Recherche d\'emplois', 
      href: '/dashboard/jobs', 
      icon: MagnifyingGlassIcon, 
      badge: jobsCount,
      description: 'Découvrir de nouvelles opportunités'
    },
    { 
      name: 'Mes Candidatures', 
      href: '/dashboard/applications', 
      icon: ChartBarIcon, 
      badge: applicationsCount,
      description: 'Suivre vos candidatures en cours'
    },
    { 
      name: 'Paramètres', 
      href: '/dashboard/settings', 
      icon: Cog6ToothIcon, 
      description: 'Configuration de votre compte'
    },
  ];

  // Helper pour obtenir la lettre du badge
  const getRoleBadgeLetter = (): string => {
    if (userRole === 'admin') return 'A';
    if (userRole === 'candidate') return 'C';
    return 'E';
  };

  const navigation = 
    userRole === 'admin' ? getAdminNavigation() :
    userRole === 'candidate' ? candidateNavigation : 
    getEmployerNavigation(jobsCount);
  
  const roleLabel = 
    userRole === 'admin' ? 'Admin' :
    userRole === 'candidate' ? 'Candidat' : 
    'Employeur';
  
  const roleColor = 
    userRole === 'admin' ? 'bg-red-500' :
    userRole === 'candidate' ? 'bg-blue-500' : 
    'bg-green-500';

  return (
    <>
      {/* Overlay pour mobile */}
      <div className="lg:hidden">
        {/* Cette partie sera gérée par le layout parent */}
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white border-r border-gray-200 shadow-lg`}>
        
        {/* Header avec logo et toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IW</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">INTOWORK</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title={isCollapsed ? "Étendre" : "Réduire"}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Profil utilisateur */}
        <div className="p-4 border-b border-gray-200">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="relative">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${roleColor} rounded-full border-2 border-white flex items-center justify-center`}>
                <span className="text-xs text-white font-bold">
                  {getRoleBadgeLetter()}
                </span>
              </div>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {roleLabel}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : ''}
              >
                <item.icon className={`shrink-0 ${
                  isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                } ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`} />
                
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Tooltip pour mode collapsed */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded-lg text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.name}
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer avec bouton déconnexion */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 ${
              isCollapsed ? 'justify-center' : 'gap-3'
            }`}
            title={isCollapsed ? 'Se déconnecter' : ''}
          >
            <ArrowRightOnRectangleIcon className={`shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
            {!isCollapsed && <span>Se déconnecter</span>}
            
            {/* Tooltip pour mode collapsed */}
            {isCollapsed && (
              <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded-lg text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Se déconnecter
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
