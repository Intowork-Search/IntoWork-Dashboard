import axios from 'axios';

// Configuration de l'API client - VERSION CORRIGÉE v3 - FORCE DEPLOYMENT
export const getBaseUrl = () => {
  // En production (Vercel), toujours utiliser HTTPS - FORCE ABSOLUE
  if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.protocol === 'https:')) {
    console.log('🚀 Force HTTPS URL en production');
    return 'https://intowork-dashboard-production.up.railway.app/api';
  }
  
  // Récupérer l'URL de l'environnement
  const url = process.env.NEXT_PUBLIC_API_URL;
  
  // Si l'URL n'est pas définie, utiliser localhost en HTTPS (pour le dev local)
  if (!url) {
    return 'https://localhost:8000/api';
  }
  
  // Force HTTPS en production si l'URL commence par http://
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
    console.warn('⚠️ URL HTTP détectée en production, conversion en HTTPS');
    return url.replace('http://', 'https://');
  }
  
  return url;
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout de 10 secondes
});

// Function to create authenticated axios instance
export const createAuthenticatedClient = (token: string) => {
  const client = axios.create({
    baseURL: getBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    timeout: 10000,
  });
  return client;
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
    return `${process.env.NEXT_PUBLIC_API_URL}/candidates/cv/download?token=${token}`;
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
}

export interface JobDetail extends Job {
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  company_description?: string;
  company_industry?: string;
  company_size?: string;
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
  status: 'pending' | 'under_review' | 'accepted' | 'rejected';
  applied_at: string;
  notes?: string;
  // Données relationnelles
  job: Job;
}

export interface CreateApplicationData {
  job_id: number;
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
    
    const response = await apiClient.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Récupérer les détails d'une offre d'emploi
  getJob: async (jobId: number): Promise<JobDetail> => {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  },

  // Récupérer les statistiques (nombre d'offres récentes)
  getRecentJobsCount: async (days: number = 7): Promise<{ count: number; days: number }> => {
    const response = await apiClient.get(`/jobs/stats/recent?days=${days}`);
    return response.data;
  }
};

// API pour les candidatures
export const applicationsAPI = {
  // Récupérer mes candidatures
  getMyApplications: async (token: string, page: number = 1, limit: number = 10): Promise<ApplicationsResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/candidates/applications?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Postuler à une offre
  applyToJob: async (token: string, applicationData: CreateApplicationData): Promise<JobApplication> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/candidates/applications', applicationData);
    return response.data;
  },

  // Récupérer une candidature spécifique
  getApplication: async (token: string, applicationId: number): Promise<JobApplication> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/candidates/applications/${applicationId}`);
    return response.data;
  },

  // Retirer une candidature
  withdrawApplication: async (token: string, applicationId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/candidates/applications/${applicationId}`);
  },

  // Récupérer le nombre total de candidatures
  getApplicationsCount: async (token: string): Promise<number> => {
    try {
      const client = createAuthenticatedClient(token);
      const response = await client.get('/candidates/applications?limit=1');
      return response.data.total || 0;
    } catch (error) {
      console.warn('Erreur lors de la récupération du nombre de candidatures:', error);
      return 0; // Retourner 0 en cas d'erreur
    }
  }
};

export default apiClient;