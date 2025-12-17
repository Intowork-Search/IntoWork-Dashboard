import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api';

export const useAuthenticatedAPI = () => {
  const { getToken } = useAuth();

  const candidateAPI = {
    getProfile: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');
      const client = createAuthenticatedClient(token);
      const response = await client.get('/candidates/profile');
      return response;
    },

    updateProfile: async (profileData: any) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');
      const client = createAuthenticatedClient(token);
      const response = await client.put('/candidates/profile', profileData);
      return response;
    },
  };

  return { candidateAPI };
};
