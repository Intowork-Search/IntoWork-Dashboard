/**
 * React Query Keys - Clés de cache centralisées
 *
 * Organisation des clés pour le cache React Query
 * Pattern: ['resource', 'operation', params]
 *
 * Exemple: ['jobs', 'list', { page: 1, limit: 10 }]
 */

// Types pour les filtres
export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  location?: string;
  job_type?: string;
  location_type?: string;
}

export interface ApplicationFilters {
  page?: number;
  limit?: number;
  status?: string;
  job_id?: number;
}

export interface CandidateFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}

/**
 * Clés de cache organisées par ressource
 *
 * Utilisation:
 * - queryKeys.jobs.all - Invalider toutes les queries jobs
 * - queryKeys.jobs.list(filters) - Query spécifique avec filtres
 * - queryKeys.jobs.detail(id) - Détail d'un job spécifique
 */
export const queryKeys = {
  // Jobs (Offres d'emploi)
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters: JobFilters = {}) => [...queryKeys.jobs.lists(), filters] as const,
    detail: (id: number) => [...queryKeys.jobs.all, 'detail', id] as const,
    myJobs: (filters: JobFilters = {}) => ['my-jobs', filters] as const,
  },

  // Applications (Candidatures)
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (filters: ApplicationFilters = {}) => [...queryKeys.applications.lists(), filters] as const,
    detail: (id: number) => [...queryKeys.applications.all, 'detail', id] as const,
    myApplications: (filters: ApplicationFilters = {}) => ['my-applications', filters] as const,
    employerApplications: (filters: ApplicationFilters = {}) => ['employer-applications', filters] as const,
  },

  // Candidates (Profils candidats)
  candidates: {
    all: ['candidates'] as const,
    profile: () => [...queryKeys.candidates.all, 'profile'] as const,
    cvs: () => [...queryKeys.candidates.all, 'cvs'] as const,
    experiences: () => [...queryKeys.candidates.all, 'experiences'] as const,
    educations: () => [...queryKeys.candidates.all, 'educations'] as const,
    skills: () => [...queryKeys.candidates.all, 'skills'] as const,
  },

  // Companies (Entreprises)
  companies: {
    all: ['companies'] as const,
    myCompany: () => [...queryKeys.companies.all, 'my-company'] as const,
    stats: () => [...queryKeys.companies.all, 'stats'] as const,
  },

  // Employers (Profils employeurs)
  employers: {
    all: ['employers'] as const,
    profile: () => [...queryKeys.employers.all, 'profile'] as const,
  },

  // Dashboard (Statistiques et activités)
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    activities: () => [...queryKeys.dashboard.all, 'activities'] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (page: number = 1, limit: number = 10) =>
      [...queryKeys.notifications.all, 'list', { page, limit }] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },

  // Admin (Gestion admin)
  admin: {
    all: ['admin'] as const,
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
    users: (filters: AdminUserFilters = {}) => [...queryKeys.admin.all, 'users', filters] as const,
    employers: (page: number = 1, limit: number = 20) =>
      [...queryKeys.admin.all, 'employers', { page, limit }] as const,
    jobs: (page: number = 1, limit: number = 20) =>
      [...queryKeys.admin.all, 'jobs', { page, limit }] as const,
  },

  // Auth (Utilisateur connecté)
  auth: {
    currentUser: () => ['auth', 'current-user'] as const,
  },
};

/**
 * Helper pour invalider des queries par préfixe
 *
 * Exemple:
 * invalidateQueriesByPrefix(queryClient, queryKeys.jobs.all)
 * → Invalide toutes les queries commençant par ['jobs']
 */
export const getQueriesByPrefix = (prefix: readonly string[]) => {
  return { queryKey: prefix };
};
