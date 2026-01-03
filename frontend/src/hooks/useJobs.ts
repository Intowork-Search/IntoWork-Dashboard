'use client';

/**
 * React Query Hooks - Jobs (Offres d'emploi)
 *
 * Hooks pour gérer les offres d'emploi:
 * - useJobs: Liste des jobs avec filtres (public)
 * - useMyJobs: Mes jobs (employeur)
 * - useJob: Détail d'un job
 * - useCreateJob: Créer un job (employeur)
 * - useUpdateJob: Mettre à jour un job (employeur)
 * - useDeleteJob: Supprimer un job (employeur)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { jobsAPI, type JobFilters, type Job, type JobDetail, type JobListResponse } from '@/lib/api';
import { useAuth } from '@/hooks/useNextAuth';
import toast from 'react-hot-toast';

// ============================================================
// QUERIES (Lecture)
// ============================================================

/**
 * useJobs - Récupérer la liste des offres d'emploi
 *
 * @param filters - Filtres de recherche (page, limit, search, location, etc.)
 * @param options - Options React Query
 *
 * @example
 * const { data, isLoading, error } = useJobs({ page: 1, limit: 10, search: 'developer' });
 * const jobs = data?.jobs || [];
 * const total = data?.total || 0;
 */
export function useJobs(
  filters: JobFilters = {},
  options: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
  } = {}
) {
  return useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: async () => {
      const response = await jobsAPI.getJobs(filters);
      return response;
    },
    staleTime: options.staleTime ?? 1000 * 60 * 2, // 2 minutes par défaut
    enabled: options.enabled !== false,
    refetchInterval: options.refetchInterval,
  });
}

/**
 * useMyJobs - Récupérer mes offres d'emploi (employeur)
 *
 * @param filters - Filtres de recherche
 * @param options - Options React Query
 *
 * @example
 * const { data, isLoading } = useMyJobs({ page: 1, status: 'active' });
 */
export function useMyJobs(
  filters: JobFilters = {},
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.jobs.myJobs(filters),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await jobsAPI.getMyJobs(token, filters);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * useJob - Récupérer les détails d'une offre d'emploi
 *
 * @param jobId - ID du job
 * @param options - Options React Query
 *
 * @example
 * const { data: job, isLoading } = useJob(123);
 */
export function useJob(
  jobId: number,
  options: {
    enabled?: boolean;
    useAuth?: boolean; // Si true, utilise la version authentifiée (pour has_applied)
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: async () => {
      // Si useAuth=true et utilisateur connecté, utiliser version authentifiée
      if (options.useAuth && isSignedIn) {
        const token = await getToken();
        if (token) {
          return await jobsAPI.getJobById(token, jobId);
        }
      }

      // Sinon version publique
      return await jobsAPI.getJob(jobId);
    },
    enabled: !!jobId && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================
// MUTATIONS (Écriture)
// ============================================================

/**
 * useCreateJob - Créer une nouvelle offre d'emploi (employeur)
 *
 * @example
 * const createJob = useCreateJob();
 * createJob.mutate({ title: 'Developer', description: '...' });
 */
export function useCreateJob() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (jobData: Partial<Job>) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await jobsAPI.createJob(jobData, token);
    },
    onSuccess: (newJob) => {
      // Invalider les listes de jobs
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });

      // Invalider les stats dashboard si existantes
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });

      toast.success('✅ Offre d\'emploi créée avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erreur lors de la création de l\'offre';
      toast.error(`❌ ${message}`);
      console.error('Erreur création job:', error);
    },
  });
}

/**
 * useUpdateJob - Mettre à jour une offre d'emploi (employeur)
 *
 * @example
 * const updateJob = useUpdateJob();
 * updateJob.mutate({ jobId: 123, data: { title: 'Senior Developer' } });
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: number; data: Partial<Job> }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await jobsAPI.updateJob(jobId, data, token);
    },
    onMutate: async ({ jobId, data }) => {
      // Optimistic update
      const queryKey = queryKeys.jobs.detail(jobId);

      // Annuler les queries en cours
      await queryClient.cancelQueries({ queryKey });

      // Sauvegarder l'ancien état
      const previousJob = queryClient.getQueryData<JobDetail>(queryKey);

      // Mise à jour optimiste
      if (previousJob) {
        queryClient.setQueryData<JobDetail>(queryKey, {
          ...previousJob,
          ...data,
        });
      }

      return { previousJob, queryKey };
    },
    onSuccess: (updatedJob, { jobId }) => {
      // Mettre à jour le cache avec les données du serveur
      queryClient.setQueryData(queryKeys.jobs.detail(jobId), updatedJob);

      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });

      toast.success('✅ Offre mise à jour avec succès !');
    },
    onError: (error: any, _variables, context) => {
      // Rollback en cas d'erreur
      if (context?.previousJob && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousJob);
      }

      const message = error.response?.data?.detail || 'Erreur lors de la mise à jour';
      toast.error(`❌ ${message}`);
      console.error('Erreur update job:', error);
    },
  });
}

/**
 * useDeleteJob - Supprimer une offre d'emploi (employeur)
 *
 * @example
 * const deleteJob = useDeleteJob();
 * deleteJob.mutate(123);
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (jobId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await jobsAPI.deleteJob(jobId, token);
      return jobId;
    },
    onMutate: async (jobId) => {
      // Optimistic update - supprimer de la liste
      const myJobsQueries = queryClient.getQueriesData<JobListResponse>({ queryKey: ['my-jobs'] });

      // Sauvegarder les anciennes listes
      const previousLists = myJobsQueries.map(([key, data]) => ({ key, data }));

      // Supprimer de toutes les listes
      myJobsQueries.forEach(([key, data]) => {
        if (data?.jobs) {
          queryClient.setQueryData<JobListResponse>(key, {
            ...data,
            jobs: data.jobs.filter(job => job.id !== jobId),
            total: data.total - 1,
          });
        }
      });

      return { previousLists, jobId };
    },
    onSuccess: (_result, jobId) => {
      // Supprimer le détail du cache
      queryClient.removeQueries({ queryKey: queryKeys.jobs.detail(jobId) });

      // Invalider les listes pour refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });

      toast.success('✅ Offre supprimée avec succès !');
    },
    onError: (error: any, _jobId, context) => {
      // Rollback en cas d'erreur
      if (context?.previousLists) {
        context.previousLists.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }

      const message = error.response?.data?.detail || 'Erreur lors de la suppression';
      toast.error(`❌ ${message}`);
      console.error('Erreur delete job:', error);
    },
  });
}
