import axios from 'axios';
import { getApiUrl } from './getApiUrl';
import { logger } from './logger';

// Configuration de l'API client
// NOTE: Ne PAS appeler getApiUrl() ici car c'est évalué UNE FOIS au chargement du module
// Utiliser un intercepteur pour évaluer l'URL à chaque requête
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter baseURL dynamiquement à CHAQUE requête
apiClient.interceptors.request.use((config) => {
  // Évaluer getApiUrl() à CHAQUE requête, pas au chargement du module
  config.baseURL = getApiUrl();
  return config;
});

// Function to create authenticated axios instance
export const createAuthenticatedClient = (token: string) => {
  const client = axios.create({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  // Intercepteur pour baseURL dynamique
  client.interceptors.request.use((config) => {
    config.baseURL = getApiUrl();
    return config;
  });
  
  return client;
};

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Importer signOut dynamiquement pour éviter les imports circulaires
        const { signOut } = await import('next-auth/react');
        await signOut({ redirect: false });
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Types pour l'API
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'candidate' | 'employer' | 'admin';
  is_active: boolean;
  has_completed_profile: boolean;
}

export interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  role: 'candidate' | 'employer' | 'admin';
}

export interface CompleteRegistration {
  role: 'candidate' | 'employer' | 'admin';
  phone?: string;
  location?: string;
  title?: string;
  company_name?: string;
  company_industry?: string;
  position?: string;
}

// Types pour les profils candidats
export interface Experience {
  id?: number;
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  location?: string;
}

export interface Education {
  id?: number;
  school: string;
  degree: string;
  location?: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface Skill {
  id?: number;
  name: string;
  level: number; // 1-5 (1=débutant, 2=intermédiaire, 3=avancé, 4=expert, 5=maître)
  category: 'technical' | 'soft' | 'language';
}

export interface CV {
  id: number;
  filename: string;
  file_size?: number;
  is_active: boolean;
  created_at: string;
}

export interface Integration {
  provider: 'linkedin' | 'google_calendar' | 'outlook_calendar';
  is_connected: boolean;
  connected_at?: string;
  last_used_at?: string;
}

export interface IntegrationStatus {
  linkedin: Integration;
  google_calendar: Integration;
  outlook_calendar: Integration;
}

export interface CandidateProfile {
  id?: number;
  user_id: number;
  phone?: string;
  location?: string;
  title?: string;
  summary?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  availability?: 'immediately' | 'within_2_weeks' | 'within_month' | 'not_available';
  salary_expectation?: number;
  salary_currency?: string;
  cv_url?: string;
  cv_filename?: string;
  cv_uploaded_at?: string;
  is_remote_ok?: boolean;
  is_relocation_ok?: boolean;
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
  created_at?: string;
  updated_at?: string;
}

// Services API
export const authAPI = {
  syncUser: async (userProfile: UserProfile, token?: string): Promise<User> => {
    const client = token ? createAuthenticatedClient(token) : apiClient;
    const response = await client.post('/auth/sync', userProfile);
    return response.data;
  },
  
  // Compléter l'inscription
  completeRegistration: async (data: CompleteRegistration, token: string) => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/auth/complete-registration', data);
    return response.data;
  },
  
  // Récupérer le profil utilisateur
  getCurrentUser: async (token: string): Promise<User> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/auth/me');
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (token: string, currentPassword: string, newPassword: string) => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  },

  // Changer l'email
  changeEmail: async (token: string, newEmail: string, password: string) => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/auth/change-email', {
      new_email: newEmail,
      password: password
    });
    return response.data;
  },

  // Supprimer le compte
  deleteAccount: async (token: string) => {
    const client = createAuthenticatedClient(token);
    const response = await client.delete('/auth/delete-account');
    return response.data;
  }
};

export const usersAPI = {
  // Récupérer tous les utilisateurs (admin)
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  // Récupérer un utilisateur par ID
  getUser: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  }
};

// Types pour le Dashboard
export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  changeType: string;
  color: string;
}

export interface RecentActivity {
  id: number;
  action: string;
  target: string;
  time: string;
  type: string;
}

export interface DashboardData {
  stats: DashboardStat[];
  recentActivities: RecentActivity[];
  profileCompletion: number;
}

// API Dashboard
export const dashboardAPI = {
  getDashboardData: async (token: string): Promise<DashboardData> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/dashboard');
    return response.data;
  }
};


export const candidatesAPI = {
  // Récupérer le profil du candidat connecté
  getMyProfile: async (token: string): Promise<CandidateProfile> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/candidates/profile');
    return response.data;
  },
  
  // Mettre à jour le profil du candidat connecté
  updateMyProfile: async (token: string, profileData: Partial<CandidateProfile>): Promise<CandidateProfile> => {
    const client = createAuthenticatedClient(token);
    const response = await client.put('/candidates/profile', profileData);
    return response.data;
  },
  
  // Ajouter une expérience
  addExperience: async (token: string, experienceData: Omit<Experience, 'id'>): Promise<Experience> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/candidates/profile/experiences', experienceData);
    return response.data;
  },
  
  // Mettre à jour une expérience
  updateExperience: async (token: string, experienceId: number, experienceData: Partial<Experience>): Promise<Experience> => {
    const client = createAuthenticatedClient(token);
    const response = await client.put(`/candidates/profile/experiences/${experienceId}`, experienceData);
    return response.data;
  },
  
  // Supprimer une expérience
  deleteExperience: async (token: string, experienceId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/candidates/profile/experiences/${experienceId}`);
  },
  
  // Ajouter une formation
  addEducation: async (token: string, educationData: Omit<Education, 'id'>): Promise<Education> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/candidates/profile/education', educationData);
    return response.data;
  },
  
  // Mettre à jour une formation
  updateEducation: async (token: string, educationId: number, educationData: Partial<Education>): Promise<Education> => {
    const client = createAuthenticatedClient(token);
    const response = await client.put(`/candidates/profile/education/${educationId}`, educationData);
    return response.data;
  },
  
  // Supprimer une formation
  deleteEducation: async (token: string, educationId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/candidates/profile/education/${educationId}`);
  },
  
  // Ajouter une compétence
  addSkill: async (token: string, skillData: Omit<Skill, 'id'>): Promise<Skill> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/candidates/profile/skills', skillData);
    return response.data;
  },
  
  // Mettre à jour une compétence
  updateSkill: async (token: string, skillId: number, skillData: Partial<Skill>): Promise<Skill> => {
    const client = createAuthenticatedClient(token);
    const response = await client.put(`/candidates/profile/skills/${skillId}`, skillData);
    return response.data;
  },
  
  // Supprimer une compétence
  deleteSkill: async (token: string, skillId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/candidates/profile/skills/${skillId}`);
  },
  
  // Télécharger le CV
  downloadCV: async (token: string): Promise<Blob> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/candidates/cv/download', {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // Obtenir l'URL du CV pour prévisualisation (blob URL via authenticated request)
  getCVUrl: async (token: string): Promise<string> => {
    const response = await createAuthenticatedClient(token).get('/candidates/cv/download', { responseType: 'blob' });
    return URL.createObjectURL(response.data);
  },
  
  // Lister tous les CV
  listCVs: async (token: string): Promise<CV[]> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/candidates/cvs');
    return response.data;
  },
  
  // Télécharger un CV spécifique
  downloadSpecificCV: async (token: string, cvId: number): Promise<Blob> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/candidates/cvs/${cvId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // Supprimer un CV spécifique
  deleteCV: async (token: string, cvId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/candidates/cvs/${cvId}`);
  }
};

export const systemAPI = {
  // Vérifier le statut de la base de données
  checkDbStatus: async () => {
    const response = await apiClient.get('/db-status');
    return response.data;
  },
  
  // Test de connectivité
  ping: async () => {
    const response = await apiClient.get('/ping');
    return response.data;
  }
};

// Interfaces pour les offres d'emploi
export interface Job {
  id: number;
  title: string;
  description: string;
  company_name: string;
  company_logo_url?: string;
  location?: string;
  location_type: 'on_site' | 'remote' | 'hybrid';
  job_type: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship';
  salary_min?: number;
  salary_max?: number;
  currency: string;
  country?: string;
  zone?: string;
  status: string;
  posted_at?: string;
  is_featured: boolean;
  views_count: number;
  applications_count: number;
  has_applied: boolean;
}

export interface JobDetail extends Job {
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  company_description?: string;
  company_industry?: string;
  company_size?: string;
  status: string;
  created_at?: string;
  employment_type?: string;
  salary_range?: string;
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  job_type?: string;
  location_type?: string;
  salary_min?: number;
  country?: string;
  currency?: string;
}

// Interface pour les candidatures
export interface JobApplication {
  id: number;
  job_id: number;
  candidate_id: number;
  status: 'applied' | 'pending' | 'viewed' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  applied_at: string;
  notes?: string;
  // Données relationnelles
  job: Job;
}

export interface CreateApplicationData {
  job_id: number;
  cv_id?: number;
  cover_letter?: string;
}

export interface ApplicationsResponse {
  applications: JobApplication[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// API pour les offres d'emploi
export const jobsAPI = {
  // Supprimer une offre d'emploi (employeur)
  deleteJob: async (jobId: number, token: string): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/jobs/${jobId}`);
  },
  // Récupérer la liste des offres d'emploi avec filtres
  getJobs: async (filters?: JobFilters, token?: string): Promise<JobListResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    // Add trailing slash to avoid 307 redirect from backend
    const queryString = params.toString();
    const url = queryString ? `/jobs/?${queryString}` : '/jobs/';
    // Si token fourni, utilise le client authentifié pour has_applied
    const client = token ? createAuthenticatedClient(token) : apiClient;
    const response = await client.get(url);
    return response.data;
  },

  // Récupérer uniquement les offres d'emploi créées par l'employeur connecté
  getMyJobs: async (token: string, filters?: JobFilters): Promise<JobListResponse> => {
    const client = createAuthenticatedClient(token);
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await client.get(`/jobs/my-jobs?${params.toString()}`);
    return response.data;
  },

  // Récupérer les détails d'une offre d'emploi
  getJob: async (jobId: number): Promise<JobDetail> => {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  },

  // Récupérer les détails d'une offre d'emploi (avec authentification pour has_applied)
  getJobById: async (token: string, jobId: number): Promise<JobDetail> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/jobs/${jobId}`);
    return response.data;
  },

  // Récupérer les statistiques (nombre d'offres récentes)
  getRecentJobsCount: async (days: number = 7): Promise<{ count: number; days: number }> => {
    const response = await apiClient.get(`/jobs/stats/recent?days=${days}`);
    return response.data;
  },

  // Créer une nouvelle offre d'emploi (employeur)
  createJob: async (jobData: Partial<Job>, token: string): Promise<Job> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/jobs/create', jobData);
    return response.data;
  },

  // Mettre à jour une offre d'emploi (employeur)
  updateJob: async (jobId: number, jobData: Partial<Job>, token: string): Promise<Job> => {
    const client = createAuthenticatedClient(token);
    const response = await client.put(`/jobs/${jobId}`, jobData);
    return response.data;
  }
};

// API pour les candidatures
export const applicationsAPI = {
  // Récupérer mes candidatures
  getMyApplications: async (token: string, page: number = 1, limit: number = 10): Promise<ApplicationsResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/applications/my/applications?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Postuler à une offre
  applyToJob: async (token: string, applicationData: CreateApplicationData): Promise<JobApplication> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/applications/my/applications', applicationData);
    return response.data;
  },

  // Récupérer une candidature spécifique
  getApplication: async (token: string, applicationId: number): Promise<JobApplication> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/applications/my/applications/${applicationId}`);
    return response.data;
  },

  // Retirer une candidature
  withdrawApplication: async (token: string, applicationId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/applications/my/applications/${applicationId}`);
  },

  // Récupérer le nombre total de candidatures
  getApplicationsCount: async (token: string): Promise<number> => {
    try {
      const client = createAuthenticatedClient(token);
      const response = await client.get('/applications/my/applications?limit=1');
      return response.data.total || 0;
    } catch (error) {
      logger.warn("Erreur lors de la recuperation du nombre de candidatures:", error);
      return 0; // Retourner 0 en cas d'erreur
    }
  },

  // === EMPLOYEUR: Mettre à jour le statut d'une candidature ===
  updateApplicationStatus: async (token: string, applicationId: number, status: string): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.put(`/applications/employer/applications/${applicationId}/status`, { status });
  },

  // === EMPLOYEUR: Mettre à jour les notes d'une candidature ===
  updateApplicationNotes: async (token: string, applicationId: number, notes: string): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.put(`/applications/employer/applications/${applicationId}/notes`, { notes });
  }
};

// Types pour les entreprises
export interface Company {
  id: number;
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  website_url?: string;
  linkedin_url?: string;
  address?: string;
  city?: string;
  country?: string;
  logo_url?: string;
}

export interface CompanyStats {
  active_jobs: number;
  total_jobs: number;
  total_employers: number;
  total_applications: number;
}

// API pour les entreprises
export const companiesAPI = {
  // Récupérer les informations de mon entreprise
  getMyCompany: async (token: string): Promise<Company> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/companies/my-company');
    return response.data;
  },

  // Mettre à jour mon entreprise
  updateMyCompany: async (token: string, companyData: Partial<Company>): Promise<Company> => {
    const client = createAuthenticatedClient(token);
    const response = await client.put('/companies/my-company', companyData);
    return response.data;
  },

  // Récupérer les statistiques de mon entreprise
  getCompanyStats: async (token: string): Promise<CompanyStats> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/companies/my-company/stats');
    return response.data;
  }
};

// API pour les notifications
export interface Notification {
  id: number;
  type: 'new_application' | 'status_change' | 'new_job' | 'message' | 'system';
  title: string;
  message: string;
  related_job_id?: number;
  related_application_id?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export const notificationsAPI = {
  // Récupérer les notifications
  getNotifications: async (token: string, limit: number = 20, offset: number = 0, unreadOnly: boolean = false): Promise<NotificationListResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/notifications?limit=${limit}&offset=${offset}&unread_only=${unreadOnly}`);
    return response.data;
  },

  // Récupérer le nombre de notifications non lues
  getUnreadCount: async (token: string): Promise<number> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/notifications/unread-count');
    return response.data.unread_count;
  },

  // Marquer une notification comme lue
  markAsRead: async (token: string, notificationId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.put(`/notifications/${notificationId}/read`);
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async (token: string): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.put('/notifications/mark-all-read');
  },

  // Supprimer une notification
  deleteNotification: async (token: string, notificationId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/notifications/${notificationId}`);
  }
};

// ==================== ADMIN API ====================

export interface AdminStats {
  total_users: number;
  total_candidates: number;
  total_employers: number;
  total_companies: number;
  total_jobs: number;
  total_applications: number;
  total_notifications: number;
  active_users: number;
  inactive_users: number;
  jobs_by_status: Record<string, number>;
  recent_signups: number;
}

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminEmployer {
  id: number;
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  position: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminJob {
  id: number;
  title: string;
  company_name: string;
  employer_email: string;
  status: string;
  location: string | null;
  applications_count: number;
  created_at: string;
}

export const adminAPI = {
  // Récupérer les statistiques
  getStats: async (token: string): Promise<AdminStats> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/admin/stats');
    return response.data;
  },

  // Récupérer tous les utilisateurs
  getUsers: async (
    token: string,
    params?: { skip?: number; limit?: number; role?: string; is_active?: boolean; search?: string }
  ): Promise<AdminUser[]> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/admin/users', { params });
    return response.data;
  },

  // Récupérer tous les employeurs
  getEmployers: async (token: string, params?: { skip?: number; limit?: number }): Promise<AdminEmployer[]> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/admin/employers', { params });
    return response.data;
  },

  // Récupérer toutes les offres d'emploi
  getJobs: async (token: string, params?: { skip?: number; limit?: number; status?: string }): Promise<AdminJob[]> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/admin/jobs', { params });
    return response.data;
  },

  // Activer/Désactiver un utilisateur
  toggleUserActivation: async (token: string, userId: number, is_active: boolean): Promise<AdminUser> => {
    const client = createAuthenticatedClient(token);
    const response = await client.put(`/admin/users/${userId}/activate`, { is_active });
    return response.data;
  },

  // Supprimer un utilisateur
  deleteUser: async (token: string, userId: number): Promise<{ message: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Récupérer les infos de l'admin connecté
  getMe: async (token: string): Promise<AdminUser> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/admin/me');
    return response.data;
  }
};

// ============================================
// INTEGRATIONS API
// ============================================
export const integrationsAPI = {
  // Récupérer le statut de toutes les intégrations
  getStatus: async (token: string): Promise<IntegrationStatus> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/integrations/status');
    return response.data;
  },

  // Obtenir l'URL d'autorisation LinkedIn
  getLinkedInAuthUrl: async (token: string): Promise<{ auth_url: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/integrations/linkedin/auth-url');
    return response.data;
  },

  // Obtenir l'URL d'autorisation Google Calendar
  getGoogleCalendarAuthUrl: async (token: string): Promise<{ auth_url: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/integrations/google-calendar/auth-url');
    return response.data;
  },

  // Obtenir l'URL d'autorisation Outlook
  getOutlookAuthUrl: async (token: string): Promise<{ auth_url: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/integrations/outlook/auth-url');
    return response.data;
  },

  // ── Targetym ──────────────────────────────
  // Générer la clé API IntoWork (pour la partager avec Targetym)
  generateApiKey: async (token: string): Promise<{ api_key: string; message: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/integrations/api-key/generate');
    return response.data;
  },

  // Récupérer la clé API (masquée)
  getApiKey: async (token: string): Promise<{ has_key: boolean; api_key_preview: string | null; api_key_full: string | null }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/integrations/api-key');
    return response.data;
  },

  // Lier le compte Targetym
  linkTargetym: async (token: string, targetym_tenant_id: number, targetym_api_key: string): Promise<{
    linked: boolean; targetym_tenant_id: number; targetym_tenant_name: string; linked_at: string; message: string;
  }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/integrations/targetym/link', { targetym_tenant_id, targetym_api_key });
    return response.data;
  },

  // Délier le compte Targetym
  unlinkTargetym: async (token: string): Promise<{ message: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.delete('/integrations/targetym/unlink');
    return response.data;
  },

  // Statut liaison Targetym
  getTargetymStatus: async (token: string): Promise<{
    linked: boolean; targetym_tenant_id?: number; linked_at?: string;
  }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/integrations/targetym/status');
    return response.data;
  },
  // ──────────────────────────────────────────

  // Déconnecter une intégration
  disconnect: async (token: string, provider: 'linkedin' | 'google-calendar' | 'outlook'): Promise<{ message: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.delete(`/integrations/${provider}/disconnect`);
    return response.data;
  },

  // Publier une offre sur LinkedIn
  publishJobToLinkedIn: async (token: string, jobId: number, message?: string): Promise<{ post_id: string; post_url: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/integrations/linkedin/publish-job', { job_id: jobId, message });
    return response.data;
  },

  // Créer un événement Google Calendar
  createGoogleCalendarEvent: async (token: string, eventData: {
    application_id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    attendees?: string[];
    create_meeting_link?: boolean;
    timezone?: string;
  }): Promise<{ event_id: string; event_url: string; meet_link?: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/integrations/google-calendar/create-event', eventData);
    return response.data;
  },

  // Créer un événement Outlook
  createOutlookEvent: async (token: string, eventData: {
    application_id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    attendees?: string[];
    create_meeting_link?: boolean;
    timezone?: string;
  }): Promise<{ event_id: string; event_url: string; teams_link?: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/integrations/outlook/create-event', eventData);
    return response.data;
  }
};

// ============================================
// COLLABORATION API (Notes, Tags, Rating, Scorecard)
// ============================================

// Types pour la collaboration
export interface RecruiterNote {
  user_id: number;
  user_name: string;
  note: string;
  created_at: string;
}

export interface ScorecardData {
  technical_skills?: number;
  soft_skills?: number;
  experience?: number;
  culture_fit?: number;
  motivation?: number;
  overall?: number;
  average?: number;
}

export interface ScorecardUpdate {
  technical_skills?: number;
  soft_skills?: number;
  experience?: number;
  culture_fit?: number;
  motivation?: number;
  overall?: number;
}

export interface ApplicationCollaborationData {
  application_id: number;
  recruiter_notes: RecruiterNote[];
  rating: number | null;
  tags: string[];
  scorecard: ScorecardData | null;
}

export interface AddNoteResponse {
  message: string;
  note: RecruiterNote;
  total_notes: number;
}

export interface RatingResponse {
  message: string;
  rating: number;
}

export interface TagsResponse {
  message: string;
  tags: string[];
}

export interface ScorecardResponse {
  message: string;
  scorecard: ScorecardData;
}

export interface GetScorecardResponse {
  application_id: number;
  scorecard: ScorecardData;
  rating: number | null;
}

export const collaborationAPI = {
  // Récupérer toutes les données de collaboration pour une candidature
  getCollaboration: async (token: string, applicationId: number): Promise<ApplicationCollaborationData> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/applications/${applicationId}/collaboration`);
    return response.data;
  },

  // Récupérer les notes d'une candidature
  getNotes: async (token: string, applicationId: number): Promise<RecruiterNote[]> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/applications/${applicationId}/notes`);
    return response.data;
  },

  // Ajouter une note à une candidature
  addNote: async (token: string, applicationId: number, note: string): Promise<AddNoteResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post(`/applications/${applicationId}/notes`, { note });
    return response.data;
  },

  // Supprimer une note (par index)
  deleteNote: async (token: string, applicationId: number, noteIndex: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/applications/${applicationId}/notes/${noteIndex}`);
  },

  // Mettre à jour la note globale (1-5 étoiles)
  updateRating: async (token: string, applicationId: number, rating: number): Promise<RatingResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.patch(`/applications/${applicationId}/rating`, { rating });
    return response.data;
  },

  // Remplacer tous les tags
  updateTags: async (token: string, applicationId: number, tags: string[]): Promise<TagsResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.patch(`/applications/${applicationId}/tags`, { tags });
    return response.data;
  },

  // Ajouter un tag unique
  addTag: async (token: string, applicationId: number, tag: string): Promise<TagsResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post(`/applications/${applicationId}/tags/${encodeURIComponent(tag)}`);
    return response.data;
  },

  // Supprimer un tag
  removeTag: async (token: string, applicationId: number, tag: string): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/applications/${applicationId}/tags/${encodeURIComponent(tag)}`);
  },

  // Mettre à jour la scorecard
  updateScorecard: async (token: string, applicationId: number, scorecard: ScorecardUpdate): Promise<ScorecardResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.patch(`/applications/${applicationId}/scorecard`, scorecard);
    return response.data;
  },

  // Récupérer la scorecard
  getScorecard: async (token: string, applicationId: number): Promise<GetScorecardResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/applications/${applicationId}/scorecard`);
    return response.data;
  },
};

// ============================================
// JOB ALERTS API (Alertes emploi — Candidat)
// ============================================

export type JobAlertFrequency = 'INSTANT' | 'DAILY' | 'WEEKLY';

export interface JobAlertCriteria {
  keywords?: string[];
  location?: string;
  job_types?: string[];
  location_types?: string[];
  salary_min?: number;
  salary_max?: number;
}

export interface JobAlertResponse {
  id: number;
  candidate_id: number;
  name: string;
  criteria: JobAlertCriteria;
  frequency: JobAlertFrequency;
  is_active: boolean;
  jobs_sent_count: number;
  last_sent_at: string | null;
  last_matching_job_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface JobAlertCreateData {
  name: string;
  criteria: JobAlertCriteria;
  frequency: JobAlertFrequency;
}

export interface JobAlertUpdateData {
  name?: string;
  criteria?: JobAlertCriteria;
  frequency?: JobAlertFrequency;
  is_active?: boolean;
}

export interface MatchingJobPreview {
  id: number;
  title: string;
  location: string;
  location_type: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  posted_at: string;
  company_id: number;
}

export interface MatchingJobsResponse {
  alert_id: number;
  matching_jobs: MatchingJobPreview[];
  total_matches: number;
}

export interface JobAlertStatsSummary {
  total_alerts: number;
  active_alerts: number;
  inactive_alerts: number;
  total_jobs_sent: number;
}

export const jobAlertsAPI = {
  // Créer une alerte emploi
  createAlert: async (token: string, data: JobAlertCreateData): Promise<JobAlertResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/job-alerts/', data);
    return response.data;
  },

  // Lister les alertes emploi
  getAlerts: async (token: string, isActive?: boolean): Promise<JobAlertResponse[]> => {
    const client = createAuthenticatedClient(token);
    const params: Record<string, string> = {};
    if (isActive !== undefined) {
      params.is_active = String(isActive);
    }
    const response = await client.get('/job-alerts/', { params });
    return response.data;
  },

  // Récupérer une alerte spécifique
  getAlert: async (token: string, alertId: number): Promise<JobAlertResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/job-alerts/${alertId}`);
    return response.data;
  },

  // Modifier une alerte
  updateAlert: async (token: string, alertId: number, data: JobAlertUpdateData): Promise<JobAlertResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.patch(`/job-alerts/${alertId}`, data);
    return response.data;
  },

  // Supprimer une alerte
  deleteAlert: async (token: string, alertId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/job-alerts/${alertId}`);
  },

  // Activer/désactiver une alerte
  toggleAlert: async (token: string, alertId: number): Promise<JobAlertResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post(`/job-alerts/${alertId}/toggle`);
    return response.data;
  },

  // Prévisualiser les jobs correspondants
  previewMatchingJobs: async (token: string, alertId: number, limit: number = 20): Promise<MatchingJobsResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/job-alerts/${alertId}/preview`, { params: { limit } });
    return response.data;
  },

  // Statistiques des alertes
  getStatsSummary: async (token: string): Promise<JobAlertStatsSummary> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/job-alerts/stats/summary');
    return response.data;
  },
};

// ============================================
// EMAIL TEMPLATES API (Templates email — Employeur)
// ============================================

export type EmailTemplateType =
  | 'welcome_candidate'
  | 'application_received'
  | 'application_rejected'
  | 'interview_invitation'
  | 'interview_confirmation'
  | 'interview_reminder'
  | 'offer_letter'
  | 'onboarding'
  | 'custom';

export interface EmailTemplateResponse {
  id: number;
  company_id: number;
  created_by_user_id: number;
  name: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  is_active: boolean;
  is_default: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
}

export interface EmailTemplateCreateData {
  name: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  is_default?: boolean;
}

export interface EmailTemplateUpdateData {
  name?: string;
  type?: EmailTemplateType;
  subject?: string;
  body?: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface TemplateVariablesResponse {
  variables: string[];
  descriptions: Record<string, string>;
}

export interface EmailTemplateUsageStats {
  total_templates: number;
  active_templates: number;
  inactive_templates: number;
  total_usage: number;
  most_used_template: {
    id: number;
    name: string;
    usage_count: number;
  } | null;
}

export const emailTemplatesAPI = {
  // Créer un template
  createTemplate: async (token: string, data: EmailTemplateCreateData): Promise<EmailTemplateResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/email-templates', data);
    return response.data;
  },

  // Lister les templates
  getTemplates: async (
    token: string,
    params?: { type?: EmailTemplateType; is_active?: boolean }
  ): Promise<EmailTemplateResponse[]> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/email-templates', { params });
    return response.data;
  },

  // Récupérer un template spécifique
  getTemplate: async (token: string, templateId: number): Promise<EmailTemplateResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/email-templates/${templateId}`);
    return response.data;
  },

  // Modifier un template
  updateTemplate: async (
    token: string,
    templateId: number,
    data: EmailTemplateUpdateData
  ): Promise<EmailTemplateResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.patch(`/email-templates/${templateId}`, data);
    return response.data;
  },

  // Supprimer (soft delete) un template
  deleteTemplate: async (token: string, templateId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/email-templates/${templateId}`);
  },

  // Dupliquer un template
  duplicateTemplate: async (token: string, templateId: number): Promise<EmailTemplateResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post(`/email-templates/${templateId}/duplicate`);
    return response.data;
  },

  // Variables disponibles pour interpolation
  getVariables: async (token: string): Promise<TemplateVariablesResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/email-templates/variables');
    return response.data;
  },

  // Statistiques d'utilisation
  getUsageStats: async (token: string): Promise<EmailTemplateUsageStats> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/email-templates/stats/usage');
    return response.data;
  },
};

/**
 * Construire l'URL complète pour un fichier uploadé (logo, CV, etc.)
 * @param path - Chemin relatif commençant par /uploads/...
 * @returns URL complète vers le fichier sur le backend
 */
export const getUploadUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // Use getApiUrl() and remove /api suffix to get base URL
  const baseUrl = getApiUrl().replace(/\/api$/, '');
    
  // Si le path commence déjà par http, le retourner tel quel
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Sinon, construire l'URL complète
  return `${baseUrl}${path}`;
};

export default apiClient;