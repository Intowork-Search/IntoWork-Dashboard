import axios from 'axios';
import { getApiUrl } from './getApiUrl';

// Configuration de l'API client
const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to create authenticated axios instance
export const createAuthenticatedClient = (token: string) => {
  return axios.create({
    baseURL: getApiUrl(),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide - rediriger vers login
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

// Types pour l'API
export interface User {
  id: number;
  clerk_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'candidate' | 'employer' | 'admin';
  is_active: boolean;
  has_completed_profile: boolean;
}

export interface UserProfile {
  clerk_id: string;
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
  institution: string;
  degree: string;
  field_of_study?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface Skill {
  id?: number;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
}

export interface CV {
  id: number;
  filename: string;
  file_size?: number;
  is_active: boolean;
  created_at: string;
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
  education?: Education[];
  skills?: Skill[];
  created_at?: string;
  updated_at?: string;
}

// Services API
export const authAPI = {
  // Synchroniser l'utilisateur avec le backend après auth Clerk
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

// API simplifiée pour les candidats (pour les paramètres)
export const candidateAPI = {
  // Récupérer le profil
  getProfile: async () => {
    const response = await apiClient.get('/candidates/profile');
    return response;
  },
  
  // Mettre à jour le profil
  updateProfile: async (profileData: any) => {
    const response = await apiClient.put('/candidates/profile', profileData);
    return response;
  },
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
  
  // Obtenir l'URL du CV pour prévisualisation
  getCVUrl: (token: string): string => {
    // Force HTTPS en production
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://intowork-dashboard-production-1ede.up.railway.app/api'
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api');
    return `${apiUrl}/candidates/cv/download?token=${token}`;
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
  getJobs: async (filters?: JobFilters): Promise<JobListResponse> => {
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
    const response = await apiClient.get(url);
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
      console.warn('Erreur lors de la récupération du nombre de candidatures:', error);
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

/**
 * Construire l'URL complète pour un fichier uploadé (logo, CV, etc.)
 * @param path - Chemin relatif commençant par /uploads/...
 * @returns URL complète vers le fichier sur le backend
 */
export const getUploadUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // Force HTTPS en production avec l'URL Railway complète
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://intowork-dashboard-production-1ede.up.railway.app'
    : (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8001');
    
  // Si le path commence déjà par http, le retourner tel quel
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Sinon, construire l'URL complète
  return `${baseUrl}${path}`;
};

export default apiClient;