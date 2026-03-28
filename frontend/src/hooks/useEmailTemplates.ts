'use client';

/**
 * React Query Hooks - Email Templates (Templates d'emails)
 *
 * Hooks pour gérer les templates d'emails des employeurs:
 * - useEmailTemplates: Liste des templates
 * - useEmailTemplate: Détail d'un template
 * - useEmailTemplateVariables: Variables disponibles
 * - useEmailTemplateStats: Statistiques d'utilisation
 * - useCreateEmailTemplate: Créer un template
 * - useUpdateEmailTemplate: Modifier un template
 * - useDeleteEmailTemplate: Supprimer (soft delete) un template
 * - useDuplicateEmailTemplate: Dupliquer un template
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  emailTemplatesAPI,
  type EmailTemplateResponse,
  type EmailTemplateCreateData,
  type EmailTemplateUpdateData,
  type EmailTemplateType,
  type TemplateVariablesResponse,
  type EmailTemplateUsageStats,
} from '@/lib/api';
import { useAuth } from '@/hooks/useNextAuth';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/types';
import { logger } from '@/lib/logger';

// ============================================================
// QUERIES (Lecture)
// ============================================================

/**
 * useEmailTemplates - Récupérer la liste des templates d'emails de l'entreprise
 *
 * @param options - Filtres optionnels et options React Query
 *
 * @example
 * const { data: templates, isLoading } = useEmailTemplates();
 * const filtered = useEmailTemplates({ type: 'interview_invitation' });
 */
export function useEmailTemplates(
  options: {
    enabled?: boolean;
    type?: EmailTemplateType;
    isActive?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<EmailTemplateResponse[]>({
    queryKey: queryKeys.emailTemplates.list(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      const params: { type?: EmailTemplateType; is_active?: boolean } = {};
      if (options.type) params.type = options.type;
      if (options.isActive !== undefined) params.is_active = options.isActive;

      return await emailTemplatesAPI.getTemplates(token, params);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * useEmailTemplate - Récupérer les détails d'un template spécifique
 *
 * @param templateId - ID du template
 *
 * @example
 * const { data: template, isLoading } = useEmailTemplate(42);
 */
export function useEmailTemplate(
  templateId: number,
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<EmailTemplateResponse>({
    queryKey: queryKeys.emailTemplates.detail(templateId),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await emailTemplatesAPI.getTemplate(token, templateId);
    },
    enabled: isSignedIn && !!templateId && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useEmailTemplateVariables - Récupérer les variables d'interpolation disponibles
 *
 * @example
 * const { data } = useEmailTemplateVariables();
 * console.log(data?.variables); // ['{candidate_name}', '{job_title}', ...]
 */
export function useEmailTemplateVariables(
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<TemplateVariablesResponse>({
    queryKey: queryKeys.emailTemplates.variables(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await emailTemplatesAPI.getVariables(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 30, // 30 minutes (rarement modifié)
  });
}

/**
 * useEmailTemplateStats - Récupérer les statistiques d'utilisation des templates
 *
 * @example
 * const { data: stats } = useEmailTemplateStats();
 * console.log(stats?.total_templates, stats?.most_used_template?.name);
 */
export function useEmailTemplateStats(
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<EmailTemplateUsageStats>({
    queryKey: queryKeys.emailTemplates.stats(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await emailTemplatesAPI.getUsageStats(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================
// MUTATIONS (Écriture)
// ============================================================

/**
 * useCreateEmailTemplate - Créer un nouveau template d'email
 *
 * @example
 * const createTemplate = useCreateEmailTemplate();
 * createTemplate.mutate({
 *   name: 'Bienvenue',
 *   type: 'welcome_candidate',
 *   subject: 'Bienvenue chez {company_name}',
 *   body: 'Bonjour {candidate_name}...',
 * });
 */
export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: EmailTemplateCreateData) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await emailTemplatesAPI.createTemplate(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates.all });
      toast.success('Template créé avec succès');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de la création du template');
      toast.error(message);
      logger.error('Erreur creation email template:', error);
    },
  });
}

/**
 * useUpdateEmailTemplate - Modifier un template d'email existant
 *
 * @example
 * const updateTemplate = useUpdateEmailTemplate();
 * updateTemplate.mutate({ templateId: 1, data: { name: 'Nouveau nom' } });
 */
export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ templateId, data }: { templateId: number; data: EmailTemplateUpdateData }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await emailTemplatesAPI.updateTemplate(token, templateId, data);
    },
    onSuccess: (updatedTemplate, { templateId }) => {
      // Mettre à jour le cache avec les données du serveur
      queryClient.setQueryData(
        queryKeys.emailTemplates.detail(templateId),
        updatedTemplate
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates.all });
      toast.success('Template mis à jour');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de la mise à jour du template');
      toast.error(message);
      logger.error('Erreur update email template:', error);
    },
  });
}

/**
 * useDeleteEmailTemplate - Supprimer (soft delete) un template d'email
 *
 * @example
 * const deleteTemplate = useDeleteEmailTemplate();
 * deleteTemplate.mutate(templateId);
 */
export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (templateId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await emailTemplatesAPI.deleteTemplate(token, templateId);
      return templateId;
    },
    onMutate: async (templateId) => {
      // Optimistic update : retirer le template de la liste
      await queryClient.cancelQueries({ queryKey: queryKeys.emailTemplates.list() });

      const previousTemplates = queryClient.getQueryData<EmailTemplateResponse[]>(
        queryKeys.emailTemplates.list()
      );

      if (previousTemplates) {
        queryClient.setQueryData<EmailTemplateResponse[]>(
          queryKeys.emailTemplates.list(),
          previousTemplates.filter((template) => template.id !== templateId)
        );
      }

      return { previousTemplates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates.all });
      toast.success('Template désactivé');
    },
    onError: (error: unknown, _templateId, context) => {
      // Rollback en cas d'erreur
      if (context?.previousTemplates) {
        queryClient.setQueryData(queryKeys.emailTemplates.list(), context.previousTemplates);
      }

      const message = getErrorMessage(error, 'Erreur lors de la suppression du template');
      toast.error(message);
      logger.error('Erreur delete email template:', error);
    },
  });
}

/**
 * useDuplicateEmailTemplate - Dupliquer un template d'email existant
 *
 * @example
 * const duplicateTemplate = useDuplicateEmailTemplate();
 * duplicateTemplate.mutate(templateId);
 */
export function useDuplicateEmailTemplate() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (templateId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await emailTemplatesAPI.duplicateTemplate(token, templateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates.all });
      toast.success('Template dupliqué avec succès');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de la duplication du template');
      toast.error(message);
      logger.error('Erreur duplicate email template:', error);
    },
  });
}
