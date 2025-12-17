'use client';

import { useState, useEffect } from 'react';
import { useUser, UserButton, useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
  BellIcon,
  BuildingOfficeIcon
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

const employerNavigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon, 
    description: 'Vue d\'ensemble de votre activité'
  },
  { 
    name: 'Mon Entreprise', 
    href: '/dashboard/company', 
    icon: BuildingOfficeIcon, 
    description: 'Gérer votre profil d\'entreprise'
  },
  { 
    name: 'Offres d\'emploi', 
    href: '/dashboard/job-posts', 
    icon: DocumentTextIcon, 
    badge: 5,
    description: 'Gérer vos offres d\'emploi'
  },
  { 
    name: 'Candidats', 
    href: '/dashboard/candidates', 
    icon: UserIcon, 
    badge: 25,
    description: 'Parcourir les profils de candidats'
  },
  { 
    name: 'Candidatures', 
    href: '/dashboard/applications', 
    icon: ChartBarIcon, 
    badge: 8,
    description: 'Gérer les candidatures reçues'
  },
  { 
    name: 'Paramètres', 
    href: '/dashboard/settings', 
    icon: Cog6ToothIcon, 
    description: 'Configuration de votre compte'
  },
];

export default function Sidebar({ userRole }: SidebarProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [cvCount, setCvCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);

  // Récupérer le nombre de CV pour les candidats, le nombre d'emplois et de candidatures
  useEffect(() => {
    const fetchData = async () => {
      if (userRole === 'candidate' && user) {
        try {
          const token = await getToken();
          if (token) {
            // Récupérer le nombre de CV
            const cvs = await candidatesAPI.listCVs(token);
            setCvCount(cvs.length);
            
            // Récupérer le nombre d'emplois récents
            const recentJobs = await jobsAPI.getRecentJobsCount(7);
            setJobsCount(recentJobs.count);
            
            // Récupérer le nombre de candidatures
            try {
              const applicationsCount = await applicationsAPI.getApplicationsCount(token);
              setApplicationsCount(applicationsCount);
            } catch (applicationsError) {
              console.warn('Erreur lors de la récupération des candidatures:', applicationsError);
              setApplicationsCount(0);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données:', error);
          setCvCount(0);
          setJobsCount(0);
          setApplicationsCount(0);
        }
      }
    };

    fetchData();
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

  const navigation = userRole === 'candidate' ? candidateNavigation : employerNavigation;
  const roleLabel = userRole === 'candidate' ? 'Candidat' : 'Employeur';
  const roleColor = userRole === 'candidate' ? 'bg-blue-500' : 'bg-green-500';

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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IW</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">INTOWORK</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Profil utilisateur */}
        <div className="p-4 border-b border-gray-200">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="relative">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${roleColor} rounded-full border-2 border-white flex items-center justify-center`}>
                <span className="text-xs text-white font-bold">
                  {userRole === 'candidate' ? 'C' : 'E'}
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

        {/* Notifications */}
        {!isCollapsed && (
          <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-900">Notifications</span>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1 rounded-lg hover:bg-blue-100 transition-colors"
                aria-label="Notifications"
              >
                <BellIcon className="w-4 h-4 text-blue-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        )}

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

        {/* Footer avec statut */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>En ligne</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
