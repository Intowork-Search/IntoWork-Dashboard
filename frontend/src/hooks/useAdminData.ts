import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { adminAPI } from '@/lib/api';

// Configuration SWR globale
export const swrConfig = {
  revalidateOnFocus: false, // Ne pas revalider quand on revient sur l'onglet
  revalidateOnReconnect: true, // Revalider quand la connexion revient
  dedupingInterval: 60000, // Dédupliquer les requêtes pendant 60 secondes
  focusThrottleInterval: 300000, // Throttle focus à 5 minutes
};

// Hook pour les statistiques admin
export function useAdminStats() {
  const { data: session } = useSession();
  
  const { data, error, isLoading, mutate } = useSWR(
    session?.accessToken ? ['admin-stats', session.accessToken] : null,
    async ([_, token]) => {
      return await adminAPI.getStats(token);
    },
    {
      ...swrConfig,
      revalidateOnMount: true, // Toujours charger au montage
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// Hook pour les utilisateurs admin
export function useAdminUsers(search?: string, role?: string) {
  const { data: session } = useSession();
  
  const { data, error, isLoading, mutate } = useSWR(
    session?.accessToken ? ['admin-users', session.accessToken, search, role] : null,
    async ([_, token, searchParam, roleParam]) => {
      return await adminAPI.getUsers(token, {
        search: searchParam || undefined,
        role: roleParam || undefined,
        limit: 100,
      });
    },
    swrConfig
  );

  return {
    users: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// Hook pour les employeurs admin
export function useAdminEmployers() {
  const { data: session } = useSession();
  
  const { data, error, isLoading, mutate } = useSWR(
    session?.accessToken ? ['admin-employers', session.accessToken] : null,
    async ([_, token]) => {
      return await adminAPI.getEmployers(token, {
        limit: 100,
      });
    },
    swrConfig
  );

  return {
    employers: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// Hook pour les offres admin
export function useAdminJobs(page: number = 1, itemsPerPage: number = 10) {
  const { data: session } = useSession();
  
  const { data, error, isLoading, mutate } = useSWR(
    session?.accessToken ? ['admin-jobs', session.accessToken, page] : null,
    async ([_, token, currentPage]) => {
      return await adminAPI.getJobs(token, {
        limit: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
      });
    },
    swrConfig
  );

  return {
    jobs: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
