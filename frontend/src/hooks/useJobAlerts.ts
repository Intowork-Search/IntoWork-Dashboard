'use client';

/**
 * React Query Hooks - Job Alerts (Alertes emploi)
 *
 * Hooks pour gérer les alertes emploi des candidats:
 * - useJobAlerts: Liste des alertes
 * - useJobAlertStats: Statistiques des alertes
 * - useCreateJobAlert: Créer une alerte
 * - useUpdateJobAlert: Modifier une alerte
 * - useDeleteJobAlert: Supprimer une alerte
 * - useToggleJobAlert: Activer/désactiver une alerte
 * - usePreviewMatchingJobs: Prévisualiser les jobs correspondants
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  jobAlertsAPI,
  type JobAlertResponse,
  type JobAlertCreateData,
  type JobAlertUpdateData,
  type JobAlertStatsSummary,
  type MatchingJobsResponse,
} from '@/lib/api';
import { useAuth } from '@/hooks/useNextAuth';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/types';
import { logger } from '@/lib/logger';

// ============================================================
// QUERIES (Lecture)
// ============================================================

/**
 * useJobAlerts - Récupérer la liste des alertes emploi du candidat
 *
 * @param options - Options React Query
 *
 * @example
 * const { data: alerts, isLoading } = useJobAlerts();
 */
export function useJobAlerts(
  options: {
    enabled?: boolean;
    isActive?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<JobAlertResponse[]>({
    queryKey: queryKeys.jobAlerts.list(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await jobAlertsAPI.getAlerts(token, options.isActive);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * useJobAlertStats - Récupérer les statistiques des alertes emploi
 *
 * @example
 * const { data: stats } = useJobAlertStats();
 * console.log(stats?.total_alerts, stats?.active_alerts);
 */
export function useJobAlertStats(
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<JobAlertStatsSummary>({
    queryKey: queryKeys.jobAlerts.stats(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await jobAlertsAPI.getStatsSummary(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * usePreviewMatchingJobs - Prévisualiser les jobs correspondant à une alerte
 *
 * @param alertId - ID de l'alerte
 * @param limit - Nombre max de résultats
 *
 * @example
 * const { data, refetch } = usePreviewMatchingJobs(alertId, 10, { enabled: false });
 * // Appeler refetch() pour déclencher manuellement
 */
export function usePreviewMatchingJobs(
  alertId: number,
  limit: number = 20,
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<MatchingJobsResponse>({
    queryKey: [...queryKeys.jobAlerts.detail(alertId), 'preview', limit],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await jobAlertsAPI.previewMatchingJobs(token, alertId, limit);
    },
    enabled: isSignedIn && !!alertId && (options.enabled !== false),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

// ============================================================
// MUTATIONS (Écriture)
// ============================================================

/**
 * useCreateJobAlert - Créer une nouvelle alerte emploi
 *
 * @example
 * const createAlert = useCreateJobAlert();
 * createAlert.mutate({ name: 'Dev Python', criteria: { keywords: ['python'] }, frequency: 'DAILY' });
 */
export function useCreateJobAlert() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: JobAlertCreateData) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await jobAlertsAPI.createAlert(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobAlerts.all });
      toast.success('Alerte créée avec succès');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de la création de l\'alerte');
      toast.error(message);
      logger.error('Erreur creation job alert:', error);
    },
  });
}

/**
 * useUpdateJobAlert - Modifier une alerte emploi existante
 *
 * @example
 * const updateAlert = useUpdateJobAlert();
 * updateAlert.mutate({ alertId: 1, data: { name: 'Nouveau nom' } });
 */
export function useUpdateJobAlert() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ alertId, data }: { alertId: number; data: JobAlertUpdateData }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await jobAlertsAPI.updateAlert(token, alertId, data);
    },
    onSuccess: (_updatedAlert, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobAlerts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobAlerts.detail(alertId) });
      toast.success('Alerte mise à jour');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de la mise à jour de l\'alerte');
      toast.error(message);
      logger.error('Erreur update job alert:', error);
    },
  });
}

/**
 * useDeleteJobAlert - Supprimer une alerte emploi
 *
 * @example
 * const deleteAlert = useDeleteJobAlert();
 * deleteAlert.mutate(alertId);
 */
export function useDeleteJobAlert() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (alertId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await jobAlertsAPI.deleteAlert(token, alertId);
      return alertId;
    },
    onMutate: async (alertId) => {
      // Optimistic update : retirer l'alerte de la liste
      await queryClient.cancelQueries({ queryKey: queryKeys.jobAlerts.list() });

      const previousAlerts = queryClient.getQueryData<JobAlertResponse[]>(
        queryKeys.jobAlerts.list()
      );

      if (previousAlerts) {
        queryClient.setQueryData<JobAlertResponse[]>(
          queryKeys.jobAlerts.list(),
          previousAlerts.filter((alert) => alert.id !== alertId)
        );
      }

      return { previousAlerts };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobAlerts.all });
      toast.success('Alerte supprimée');
    },
    onError: (error: unknown, _alertId, context) => {
      // Rollback en cas d'erreur
      if (context?.previousAlerts) {
        queryClient.setQueryData(queryKeys.jobAlerts.list(), context.previousAlerts);
      }

      const message = getErrorMessage(error, 'Erreur lors de la suppression de l\'alerte');
      toast.error(message);
      logger.error('Erreur delete job alert:', error);
    },
  });
}

/**
 * useToggleJobAlert - Activer/désactiver une alerte emploi
 *
 * @example
 * const toggleAlert = useToggleJobAlert();
 * toggleAlert.mutate(alertId);
 */
export function useToggleJobAlert() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (alertId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await jobAlertsAPI.toggleAlert(token, alertId);
    },
    onMutate: async (alertId) => {
      // Optimistic update : inverser is_active dans la liste
      await queryClient.cancelQueries({ queryKey: queryKeys.jobAlerts.list() });

      const previousAlerts = queryClient.getQueryData<JobAlertResponse[]>(
        queryKeys.jobAlerts.list()
      );

      if (previousAlerts) {
        queryClient.setQueryData<JobAlertResponse[]>(
          queryKeys.jobAlerts.list(),
          previousAlerts.map((alert) =>
            alert.id === alertId ? { ...alert, is_active: !alert.is_active } : alert
          )
        );
      }

      return { previousAlerts };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobAlerts.all });
      toast.success('Alerte mise à jour');
    },
    onError: (error: unknown, _alertId, context) => {
      // Rollback en cas d'erreur
      if (context?.previousAlerts) {
        queryClient.setQueryData(queryKeys.jobAlerts.list(), context.previousAlerts);
      }

      const message = getErrorMessage(error, 'Erreur lors de la mise à jour de l\'alerte');
      toast.error(message);
      logger.error('Erreur toggle job alert:', error);
    },
  });
}
