'use client';

/**
 * React Query Hooks - Applications (Candidatures)
 *
 * Hooks pour gérer les candidatures:
 * - useMyApplications: Mes candidatures (candidat)
 * - useApplication: Détail d'une candidature
 * - useApplyToJob: Postuler à un job (candidat)
 * - useWithdrawApplication: Retirer une candidature (candidat)
 * - useUpdateApplicationStatus: Mettre à jour le statut (employeur)
 * - useUpdateApplicationNotes: Mettre à jour les notes (employeur)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { applicationsAPI, type JobApplication, type CreateApplicationData, type ApplicationsResponse } from '@/lib/api';
import { useAuth } from '@/hooks/useNextAuth';
import { getApiUrl } from '@/lib/getApiUrl';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/types';

// ============================================================
// QUERIES (Lecture)
// ============================================================

/**
 * useMyApplications - Récupérer mes candidatures (candidat)
 *
 * @param page - Numéro de page
 * @param limit - Nombre de résultats par page
 * @param options - Options React Query
 *
 * @example
 * const { data, isLoading } = useMyApplications(1, 10);
 * const applications = data?.applications || [];
 */
export function useMyApplications(
  page: number = 1,
  limit: number = 10,
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.applications.myApplications({ page, limit }),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await applicationsAPI.getMyApplications(token, page, limit);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: options.refetchInterval,
  });
}

/**
 * useApplication - Récupérer le détail d'une candidature
 *
 * @param applicationId - ID de la candidature
 * @param options - Options React Query
 *
 * @example
 * const { data: application, isLoading } = useApplication(123);
 */
export function useApplication(
  applicationId: number,
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.applications.detail(applicationId),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await applicationsAPI.getApplication(token, applicationId);
    },
    enabled: !!applicationId && isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * useApplicationsCount - Récupérer le nombre total de candidatures (candidat)
 *
 * @example
 * const { data: count } = useApplicationsCount();
 */
export function useApplicationsCount(
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.applications.all, 'count'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return 0;

      return await applicationsAPI.getApplicationsCount(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useEmployerApplications - Récupérer les candidatures reçues (employeur)
 *
 * @param page - Numéro de page
 * @param limit - Nombre de résultats par page
 * @param status - Filtre par statut (optionnel)
 * @param options - Options React Query
 *
 * @example
 * const { data, isLoading } = useEmployerApplications(1, 20, 'applied');
 * const applications = data?.applications || [];
 */
export function useEmployerApplications(
  page: number = 1,
  limit: number = 20,
  status?: string,
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.applications.employerApplications({ page, limit, status }),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      const apiUrl = getApiUrl();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (status) params.append('status', status);

      const response = await fetch(`${apiUrl}/applications/employer/applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      return await response.json();
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: options.refetchInterval,
  });
}

// ============================================================
// MUTATIONS (Écriture)
// ============================================================

/**
 * useApplyToJob - Postuler à une offre d'emploi (candidat)
 *
 * @example
 * const applyToJob = useApplyToJob();
 * applyToJob.mutate({ job_id: 123, cover_letter: 'I am interested...' });
 */
export function useApplyToJob() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateApplicationData) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await applicationsAPI.applyToJob(token, data);
    },
    onSuccess: (newApplication, variables) => {
      // Invalider les listes d'applications
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });

      // Invalider les jobs pour mettre à jour has_applied
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(variables.job_id) });

      // Invalider le dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      toast.success('✅ Candidature envoyée avec succès !');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de l\'envoi de la candidature');
      toast.error(`❌ ${message}`);
      console.error('Erreur apply to job:', error);
    },
  });
}

/**
 * useWithdrawApplication - Retirer une candidature (candidat)
 *
 * @example
 * const withdrawApplication = useWithdrawApplication();
 * withdrawApplication.mutate(123);
 */
export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (applicationId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await applicationsAPI.withdrawApplication(token, applicationId);
      return applicationId;
    },
    onMutate: async (applicationId) => {
      // Optimistic update - supprimer de la liste
      const myApplicationsQueries = queryClient.getQueriesData<ApplicationsResponse>({
        queryKey: queryKeys.applications.all,
      });

      // Sauvegarder les anciennes listes
      const previousLists = myApplicationsQueries.map(([key, data]) => ({ key, data }));

      // Supprimer de toutes les listes
      myApplicationsQueries.forEach(([key, data]) => {
        if (data?.applications) {
          queryClient.setQueryData<ApplicationsResponse>(key, {
            ...data,
            applications: data.applications.filter(app => app.id !== applicationId),
            total: data.total - 1,
          });
        }
      });

      return { previousLists, applicationId };
    },
    onSuccess: (_result, applicationId) => {
      // Supprimer le détail du cache
      queryClient.removeQueries({ queryKey: queryKeys.applications.detail(applicationId) });

      // Invalider les listes pour refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      toast.success('✅ Candidature retirée avec succès !');
    },
    onError: (error: unknown, _applicationId, context) => {
      // Rollback en cas d'erreur
      if (context?.previousLists) {
        context.previousLists.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }

      const message = getErrorMessage(error, 'Erreur lors du retrait de la candidature');
      toast.error(`❌ ${message}`);
      console.error('Erreur withdraw application:', error);
    },
  });
}

/**
 * useUpdateApplicationStatus - Mettre à jour le statut d'une candidature (employeur)
 *
 * @example
 * const updateStatus = useUpdateApplicationStatus();
 * updateStatus.mutate({ applicationId: 123, status: 'interview' });
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await applicationsAPI.updateApplicationStatus(token, applicationId, status);
      return { applicationId, status };
    },
    onMutate: async ({ applicationId, status }) => {
      // Optimistic update du détail
      const queryKey = queryKeys.applications.detail(applicationId);
      await queryClient.cancelQueries({ queryKey });

      const previousApplication = queryClient.getQueryData<JobApplication>(queryKey);

      if (previousApplication) {
        queryClient.setQueryData<JobApplication>(queryKey, {
          ...previousApplication,
          status: status as JobApplication['status'],
        });
      }

      return { previousApplication, queryKey };
    },
    onSuccess: ({ applicationId, status }) => {
      // Invalider les listes employer
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });

      // Invalider le dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      toast.success(`✅ Statut mis à jour: ${status}`);
    },
    onError: (error: unknown, _variables, context) => {
      // Rollback
      if (context?.previousApplication && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousApplication);
      }

      const message = getErrorMessage(error, 'Erreur lors de la mise à jour du statut');
      toast.error(`❌ ${message}`);
      console.error('Erreur update application status:', error);
    },
  });
}

/**
 * useUpdateApplicationNotes - Mettre à jour les notes d'une candidature (employeur)
 *
 * @example
 * const updateNotes = useUpdateApplicationNotes();
 * updateNotes.mutate({ applicationId: 123, notes: 'Excellent candidate' });
 */
export function useUpdateApplicationNotes() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ applicationId, notes }: { applicationId: number; notes: string }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await applicationsAPI.updateApplicationNotes(token, applicationId, notes);
      return { applicationId, notes };
    },
    onMutate: async ({ applicationId, notes }) => {
      // Optimistic update
      const queryKey = queryKeys.applications.detail(applicationId);
      await queryClient.cancelQueries({ queryKey });

      const previousApplication = queryClient.getQueryData<JobApplication>(queryKey);

      if (previousApplication) {
        queryClient.setQueryData<JobApplication>(queryKey, {
          ...previousApplication,
          notes,
        });
      }

      return { previousApplication, queryKey };
    },
    onSuccess: () => {
      toast.success('✅ Notes mises à jour avec succès !');
    },
    onError: (error: unknown, _variables, context) => {
      // Rollback
      if (context?.previousApplication && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousApplication);
      }

      const message = getErrorMessage(error, 'Erreur lors de la mise à jour des notes');
      toast.error(`❌ ${message}`);
      console.error('Erreur update application notes:', error);
    },
  });
}
