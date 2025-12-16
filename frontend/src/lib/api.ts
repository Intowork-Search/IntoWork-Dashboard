import axios from 'axios';

// Configuration de l'API client
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to create authenticated axios instance
export const createAuthenticatedClient = (token: string) => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
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

export default apiClient;
