'use client';

/**
 * React Query Hooks - Dashboard
 *
 * Hooks pour gérer les statistiques et activités du dashboard:
 * - useDashboardStats: Statistiques du dashboard (role-based)
 * - useDashboardActivities: Activités récentes
 * - useCompanyStats: Statistiques de l'entreprise (employeur)
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { dashboardAPI, companiesAPI, type DashboardData, type CompanyStats } from '@/lib/api';
import { useAuth } from '@/hooks/useNextAuth';

// ============================================================
// QUERIES (Lecture) - DASHBOARD
// ============================================================

/**
 * useDashboardStats - Récupérer les statistiques du dashboard
 *
 * Les statistiques varient selon le rôle de l'utilisateur:
 * - Candidat: applications actives, jobs vus, interviews à venir
 * - Employeur: jobs actifs, candidatures reçues, candidats présélectionnés
 * - Admin: total utilisateurs, jobs, applications
 *
 * @example
 * const { data: dashboardData, isLoading } = useDashboardStats();
 * const stats = dashboardData?.stats || [];
 * const activities = dashboardData?.recentActivities || [];
 */
export function useDashboardStats(
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await dashboardAPI.getDashboardData(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: options.refetchInterval, // Permet le polling si nécessaire
  });
}

/**
 * useDashboardActivities - Récupérer uniquement les activités récentes
 *
 * Alias de useDashboardStats mais expose uniquement les activités
 *
 * @example
 * const { data: activities, isLoading } = useDashboardActivities();
 */
export function useDashboardActivities(
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard.activities(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      const data = await dashboardAPI.getDashboardData(token);
      return data.recentActivities;
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 1, // 1 minute (plus fréquent pour les activités)
    refetchInterval: options.refetchInterval,
  });
}

// ============================================================
// QUERIES (Lecture) - COMPANY STATS (Employeur)
// ============================================================

/**
 * useCompanyStats - Récupérer les statistiques de l'entreprise (employeur)
 *
 * Statistiques disponibles:
 * - active_jobs: Nombre de jobs actifs
 * - total_jobs: Total de jobs créés
 * - total_employers: Nombre d'employeurs dans l'entreprise
 * - total_applications: Total de candidatures reçues
 *
 * @example
 * const { data: companyStats, isLoading } = useCompanyStats();
 */
export function useCompanyStats(
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.companies.stats(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await companiesAPI.getCompanyStats(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
