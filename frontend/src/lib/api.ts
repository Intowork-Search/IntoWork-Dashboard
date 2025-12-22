import axios from 'axios';

// CACHE BUSTER - Version 22-DEC-2025
const BUILD_TIMESTAMP = '2025-12-22T00:00:00Z';

// Configuration de l'API client - Supporte dev local (HTTP) et production (HTTPS)
export const getBaseUrl = () => {
  // Utiliser la variable d'environnement ou fallback vers Railway en production
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://intowork-dashboard-production.up.railway.app/api';
  
  console.log(`🚀 [${BUILD_TIMESTAMP}] Base URL:`, url);
  console.log(`🔧 Environment:`, process.env.NODE_ENV);
  
  // Vérification de sécurité uniquement en production
  if (process.env.NODE_ENV === 'production' && !url.startsWith('https://')) {
    console.error('❌ ERREUR: URL non HTTPS en production!');
    throw new Error('URL non HTTPS détectée en production');
  }
  
  return url;
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Function to create authenticated axios instance
export const createAuthenticatedClient = (token: string) => {
  const client = axios.create({
    baseURL: getBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    timeout: 15000,
  });
  
  // Intercepteur - forcer HTTPS uniquement en production
  client.interceptors.request.use(
    (config) => {
      // En production, forcer HTTPS
      if (process.env.NODE_ENV === 'production') {
        if (config.url && config.url.includes('http://')) {
          console.warn('⚠️ URL HTTP convertie en HTTPS en production');
          config.url = config.url.replace('http://', 'https://');
        }
        if (config.baseURL && config.baseURL.includes('http://')) {
          console.warn('⚠️ BaseURL HTTP convertie en HTTPS en production');
          config.baseURL = config.baseURL.replace('http://', 'https://');
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  return client;
};

// Intercepteur global - forcer HTTPS uniquement en production
apiClient.interceptors.request.use(
  (config) => {
    // Log pour debug
    console.log('📤 Requête:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: (config.baseURL || '') + (config.url || ''),
      env: process.env.NODE_ENV
    });
    
    // En production, forcer HTTPS
    if (process.env.NODE_ENV === 'production') {
      if (config.url && config.url.includes('http://')) {
        console.warn('⚠️ URL HTTP convertie en HTTPS en production');
        config.url = config.url.replace('http://', 'https://');
      }
      if (config.baseURL && config.baseURL.includes('http://')) {
        console.warn('⚠️ BaseURL HTTP convertie en HTTPS en production');
        config.baseURL = config.baseURL.replace('http://', 'https://');
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Erreur API:', error);
    
    if (error.response?.status === 401) {
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

export const authAPI = {
  syncUser: async (userProfile: UserProfile, token?: string): Promise<User> => {
    const client = token ? createAuthenticatedClient(token) : apiClient;
    const response = await client.post('/auth/sync', userProfile);
    return response.data;
  },
  
  completeRegistration: async (data: CompleteRegistration, token: string) => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/auth/complete-registration', data);
    return response.data;
  },
  
  getCurrentUser: async (token: string): Promise<User> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/auth/me');
    return response.data;
  }
};

export const usersAPI = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  getUser: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  }
};

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

export const dashboardAPI = {
  getDashboardData: async (token: string): Promise<DashboardData> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/dashboard');
    return response.data;
  }
};

export const candidateAPI = {
  getProfile: async () => {
    const response = await apiClient.get('/candidates/profile');
    return response;
  },
  
  updateProfile: async (profileData: any) => {
    const response = await apiClient.put('/candidates/profile', profileData);
    return response;
  },
};

export const candidatesAPI = {
  getMyProfile: async (token: string): Promise<CandidateProfile> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/candidates/profile');
    return response.data;
  },
  
  updateMyProfile: async (token: string, profileData: Partial<CandidateProfile>): Promise<CandidateProfile> => {
    const client = createAuthenticatedClient(token);
    const response = await client.put('/candidates/profile', profileData);
    return response.data;
  },
  
  addExperience: async (token: string, experienceData: Omit<Experience, 'id'>): Promise<Experience> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/candidates/profile/experiences', experienceData);
    return response.data;
  },
  
  updateExperience: async (token: string, experienceId: number, experienceData: Partial<Experience>): Promise<Experience> => {
    const client = createAuthenticatedClient(token);
    const response = await client.put(`/candidates/profile/experiences/${experienceId}`, experienceData);
    return response.data;
  },
  
  deleteExperience: async (token: string, experienceId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/candidates/profile/experiences/${experienceId}`);
  },
  
  addEducation: async (token: string, educationData: Omit<Education, 'id'>): Promise<Education> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/candidates/profile/education', educationData);
    return response.data;
  },
  
  updateEducation: async (token: string, educationId: number, educationData: Partial<Education>): Promise<Education> => {
    const client = createAuthenticatedClient(token);
    const response = await client.put(`/candidates/profile/education/${educationId}`, educationData);
    return response.data;
  },
  
  deleteEducation: async (token: string, educationId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/candidates/profile/education/${educationId}`);
  },
  
  addSkill: async (token: string, skillData: Omit<Skill, 'id'>): Promise<Skill> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/candidates/profile/skills', skillData);
    return response.data;
  },
  
  updateSkill: async (token: string, skillId: number, skillData: Partial<Skill>): Promise<Skill> => {
    const client = createAuthenticatedClient(token);
    const response = await client.put(`/candidates/profile/skills/${skillId}`, skillData);
    return response.data;
  },
  
  deleteSkill: async (token: string, skillId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/candidates/profile/skills/${skillId}`);
  },
  
  downloadCV: async (token: string): Promise<Blob> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/candidates/cv/download', {
      responseType: 'blob'
    });
    return response.data;
  },
  
  getCVUrl: (token: string): string => {
    return `https://intowork-dashboard-production.up.railway.app/api/candidates/cv/download?token=${token}`;
  },
  
  listCVs: async (token: string): Promise<CV[]> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/candidates/cvs');
    return response.data;
  },
  
  downloadSpecificCV: async (token: string, cvId: number): Promise<Blob> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/candidates/cvs/${cvId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  deleteCV: async (token: string, cvId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/candidates/cvs/${cvId}`);
  }
};

export const systemAPI = {
  checkDbStatus: async () => {
    const response = await apiClient.get('/db-status');
    return response.data;
  },
  
  ping: async () => {
    const response = await apiClient.get('/ping');
    return response.data;
  }
};

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

export interface JobApplication {
  id: number;
  job_id: number;
  candidate_id: number;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected';
  applied_at: string;
  notes?: string;
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

export const jobsAPI = {
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

  getJob: async (jobId: number): Promise<JobDetail> => {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  },

  getRecentJobsCount: async (days: number = 7): Promise<{ count: number; days: number }> => {
    const response = await apiClient.get(`/jobs/stats/recent?days=${days}`);
    return response.data;
  }
};

export const applicationsAPI = {
  getMyApplications: async (token: string, page: number = 1, limit: number = 10): Promise<ApplicationsResponse> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/candidates/applications?page=${page}&limit=${limit}`);
    return response.data;
  },

  applyToJob: async (token: string, applicationData: CreateApplicationData): Promise<JobApplication> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/candidates/applications', applicationData);
    return response.data;
  },

  getApplication: async (token: string, applicationId: number): Promise<JobApplication> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get(`/candidates/applications/${applicationId}`);
    return response.data;
  },

  withdrawApplication: async (token: string, applicationId: number): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete(`/candidates/applications/${applicationId}`);
  },

  getApplicationsCount: async (token: string): Promise<number> => {
    try {
      const client = createAuthenticatedClient(token);
      const response = await client.get('/candidates/applications?limit=1');
      return response.data.total || 0;
    } catch (error) {
      console.warn('Erreur lors de la récupération du nombre de candidatures:', error);
      return 0;
    }
  }
};

export default apiClient;