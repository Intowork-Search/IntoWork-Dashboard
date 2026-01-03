'use client';

/**
 * React Query Hooks - Admin
 *
 * Hooks pour les fonctionnalités administrateur:
 * - useAdminStats: Statistiques de la plateforme
 * - useAdminUsers: Liste des utilisateurs
 * - useAdminEmployers: Liste des employeurs
 * - useAdminJobs: Liste des jobs
 * - useToggleUserActivation: Activer/Désactiver un utilisateur
 * - useDeleteUser: Supprimer un utilisateur
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { adminAPI, type AdminStats, type AdminUser, type AdminEmployer, type AdminJob } from '@/lib/api';
import { useAuth } from '@/hooks/useNextAuth';
import toast from 'react-hot-toast';

// ============================================================
// QUERIES (Lecture)
// ============================================================

/**
 * useAdminStats - Récupérer les statistiques globales de la plateforme
 *
 * Statistiques disponibles:
 * - total_users, total_candidates, total_employers
 * - total_companies, total_jobs, total_applications
 * - active_users, inactive_users
 * - jobs_by_status (par statut: draft, active, closed, etc.)
 * - recent_signups (inscriptions récentes)
 *
 * @example
 * const { data: stats, isLoading } = useAdminStats();
 */
export function useAdminStats(
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await adminAPI.getStats(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: options.refetchInterval,
  });
}

/**
 * useAdminUsers - Récupérer la liste des utilisateurs
 *
 * @param filters - Filtres (skip, limit, role, is_active, search)
 * @param options - Options React Query
 *
 * @example
 * const { data: users, isLoading } = useAdminUsers({ limit: 20, role: 'candidate' });
 */
export function useAdminUsers(
  filters: {
    skip?: number;
    limit?: number;
    role?: string;
    is_active?: boolean;
    search?: string;
  } = {},
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.admin.users(filters),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await adminAPI.getUsers(token, filters);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * useAdminEmployers - Récupérer la liste des employeurs
 *
 * @param page - Numéro de page (1-indexed)
 * @param limit - Nombre de résultats par page
 * @param options - Options React Query
 *
 * @example
 * const { data: employers, isLoading } = useAdminEmployers(1, 20);
 */
export function useAdminEmployers(
  page: number = 1,
  limit: number = 20,
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.admin.employers(page, limit),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      const skip = (page - 1) * limit;
      return await adminAPI.getEmployers(token, { skip, limit });
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * useAdminJobs - Récupérer la liste des offres d'emploi (admin)
 *
 * @param page - Numéro de page (1-indexed)
 * @param limit - Nombre de résultats par page
 * @param status - Filtre par statut (optional)
 * @param options - Options React Query
 *
 * @example
 * const { data: jobs, isLoading } = useAdminJobs(1, 20, 'active');
 */
export function useAdminJobs(
  page: number = 1,
  limit: number = 20,
  status?: string,
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.admin.jobs(page, limit),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      const skip = (page - 1) * limit;
      return await adminAPI.getJobs(token, { skip, limit, status });
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ============================================================
// MUTATIONS (Écriture)
// ============================================================

/**
 * useToggleUserActivation - Activer ou désactiver un utilisateur
 *
 * @example
 * const toggleActivation = useToggleUserActivation();
 * toggleActivation.mutate({ userId: 123, is_active: false });
 */
export function useToggleUserActivation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, is_active }: { userId: number; is_active: boolean }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await adminAPI.toggleUserActivation(token, userId, is_active);
    },
    onMutate: async ({ userId, is_active }) => {
      // Optimistic update dans les listes d'utilisateurs
      const usersQueries = queryClient.getQueriesData<AdminUser[]>({
        queryKey: queryKeys.admin.all,
      });

      const previousLists: Array<{ key: any; data: AdminUser[] | undefined }> = [];

      usersQueries.forEach(([key, data]) => {
        previousLists.push({ key, data });

        if (data && Array.isArray(data)) {
          const updatedUsers = data.map(user =>
            user.id === userId ? { ...user, is_active } : user
          );
          queryClient.setQueryData<AdminUser[]>(key, updatedUsers);
        }
      });

      return { previousLists };
    },
    onSuccess: (_result, { userId, is_active }) => {
      // Invalider pour refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });

      const action = is_active ? 'activé' : 'désactivé';
      toast.success(`✅ Utilisateur ${action} avec succès !`);
    },
    onError: (error: any, _variables, context) => {
      // Rollback
      if (context?.previousLists) {
        context.previousLists.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }

      const message = error.response?.data?.detail || 'Erreur lors de la modification de l\'utilisateur';
      toast.error(`❌ ${message}`);
      console.error('Erreur toggle user activation:', error);
    },
  });
}

/**
 * useDeleteUser - Supprimer un utilisateur
 *
 * @example
 * const deleteUser = useDeleteUser();
 * deleteUser.mutate(123);
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (userId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await adminAPI.deleteUser(token, userId);
      return userId;
    },
    onMutate: async (userId) => {
      // Optimistic update - supprimer de toutes les listes
      const usersQueries = queryClient.getQueriesData<AdminUser[]>({
        queryKey: queryKeys.admin.all,
      });

      const previousLists: Array<{ key: any; data: AdminUser[] | undefined }> = [];

      usersQueries.forEach(([key, data]) => {
        previousLists.push({ key, data });

        if (data && Array.isArray(data)) {
          const updatedUsers = data.filter(user => user.id !== userId);
          queryClient.setQueryData<AdminUser[]>(key, updatedUsers);
        }
      });

      return { previousLists };
    },
    onSuccess: () => {
      // Invalider pour refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });

      toast.success('✅ Utilisateur supprimé avec succès !');
    },
    onError: (error: any, _userId, context) => {
      // Rollback
      if (context?.previousLists) {
        context.previousLists.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }

      const message = error.response?.data?.detail || 'Erreur lors de la suppression de l\'utilisateur';
      toast.error(`❌ ${message}`);
      console.error('Erreur delete user:', error);
    },
  });
}
