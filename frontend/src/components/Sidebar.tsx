'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import { usePathname, Link } from '@/i18n/navigation';
import { signOut } from 'next-auth/react';
import { candidatesAPI, jobsAPI, applicationsAPI, companiesAPI, getUploadUrl } from '@/lib/api';
import { logger } from '@/lib/logger';
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
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  BellAlertIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  readonly userRole: 'candidate' | 'employer' | 'admin';
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const t = useTranslations('nav');
  const { user } = useUser();
  const { getToken } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [cvCount, setCvCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);

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
          // Récupérer le logo de l'entreprise
          try {
            const companyData = await companiesAPI.getMyCompany(token);
            setCompanyLogoUrl(getUploadUrl(companyData.logo_url));
          } catch (error) {
            logger.debug("Logo entreprise non disponible");
          }
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

  // Écouter les mises à jour du logo depuis la page Settings
  useEffect(() => {
    const handleLogoUpdate = (event: CustomEvent) => {
      const newLogoUrl = event.detail;
      setCompanyLogoUrl(getUploadUrl(newLogoUrl));
    };

    window.addEventListener('company-logo-updated', handleLogoUpdate as EventListener);
    
    return () => {
      window.removeEventListener('company-logo-updated', handleLogoUpdate as EventListener);
    };
  }, []);

  // Créer la navigation candidate avec le badge CV dynamique
  const candidateNavigation: NavItem[] = [
    { name: t('dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('profile'), href: '/dashboard/profile', icon: UserIcon },
    { name: t('cv'), href: '/dashboard/cv', icon: DocumentTextIcon, badge: cvCount },
    { name: t('jobs'), href: '/dashboard/jobs', icon: MagnifyingGlassIcon, badge: jobsCount },
    { name: t('applications'), href: '/dashboard/applications', icon: ChartBarIcon, badge: applicationsCount },
    { name: t('jobAlerts'), href: '/dashboard/job-alerts', icon: BellAlertIcon },
    { name: t('settings'), href: '/dashboard/settings', icon: Cog6ToothIcon },
  ];

  const employerNavigation: NavItem[] = [
    { name: t('dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('company'), href: '/dashboard/company', icon: BuildingOfficeIcon },
    { name: t('jobPosts'), href: '/dashboard/job-posts', icon: DocumentTextIcon, badge: jobsCount },
    { name: t('candidates'), href: '/dashboard/candidates', icon: UserIcon },
    { name: t('emailTemplates'), href: '/dashboard/email-templates', icon: EnvelopeIcon },
    { name: t('integrations'), href: '/dashboard/integrations', icon: Square3Stack3DIcon },
    { name: t('settings'), href: '/dashboard/settings', icon: Cog6ToothIcon },
  ];

  const adminNavigation: NavItem[] = [
    { name: t('admin'), href: '/dashboard/admin', icon: ChartBarIcon },
    { name: t('users'), href: '/dashboard/admin/users', icon: UserIcon },
    { name: t('companies'), href: '/dashboard/admin/employers', icon: BuildingOfficeIcon },
    { name: t('offers'), href: '/dashboard/admin/jobs', icon: BriefcaseIcon },
    { name: t('settings'), href: '/dashboard/settings', icon: Cog6ToothIcon },
  ];

  // Helper pour obtenir la lettre du badge
  const getRoleBadgeLetter = (): string => {
    if (userRole === 'admin') return 'A';
    if (userRole === 'candidate') return 'C';
    return 'E';
  };

  const navigation = 
    userRole === 'admin' ? adminNavigation :
    userRole === 'candidate' ? candidateNavigation : 
    employerNavigation;
  
  const roleLabel = 
    userRole === 'admin' ? t('roleAdmin') :
    userRole === 'candidate' ? t('roleCandidate') : 
    t('roleEmployer');
  
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
      <nav
        role="navigation"
        aria-label="Menu principal"
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col`}>
        
        {/* Header avec logo et toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IW</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">INTOWORK</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isCollapsed ? t('expand') : t('collapse')}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <ul role="list" aria-label="Navigation" className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
              <Link
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#6B9B5F]/10 dark:bg-[#6B9B5F]/20 text-[#6B9B5F] dark:text-[#8ab87f] border-r-4 border-[#6B9B5F]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                } ${isCollapsed ? 'justify-center' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={isCollapsed ? item.name : undefined}
              >
                <item.icon className={`shrink-0 ${
                  isActive ? 'text-[#6B9B5F] dark:text-[#8ab87f]' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                } ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`} />
                
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge ? (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-[#6B9B5F]/10 dark:bg-[#6B9B5F]/20 text-[#6B9B5F] dark:text-[#8ab87f] rounded-full">
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                )}

                {/* Tooltip pour mode collapsed */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded-lg text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.name}
                    {item.badge ? (
                      <span className="ml-1 px-1.5 py-0.5 bg-[#6B9B5F] rounded-full">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                )}
              </Link>
              </li>
            );
          })}
        </ul>

        {/* Badge utilisateur */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="relative">
                {/* Avatar ou Logo entreprise */}
                {userRole === 'employer' && companyLogoUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 flex items-center justify-center">
                    <img
                      src={companyLogoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${roleColor} rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center`}>
                  <span className="text-xs text-white font-bold">
                    {getRoleBadgeLetter()}
                  </span>
                </div>
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {roleLabel}
                  </p>
                </div>
              )}
            </div>
          </div>

        {/* Bouton déconnexion */}
        <div className="p-4">
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ${
              isCollapsed ? 'justify-center' : 'gap-3'
            }`}
            aria-label={t('logout')}
          >
            <ArrowRightOnRectangleIcon className={`shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
            {!isCollapsed && <span>{t('logout')}</span>}
            
            {/* Tooltip pour mode collapsed */}
            {isCollapsed && (
              <span className="absolute left-16 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded-lg text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {t('logout')}
              </span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
