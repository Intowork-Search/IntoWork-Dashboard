'use client';

/**
 * React Query Hooks - Collaboration (ATS Phase 2)
 *
 * Hooks pour la collaboration entre recruteurs sur les candidatures:
 * - useCollaboration: Toutes les donnees de collaboration
 * - useCollaborationNotes: Notes des recruteurs
 * - useAddNote: Ajouter une note
 * - useDeleteNote: Supprimer une note
 * - useUpdateRating: Mettre a jour la note globale (1-5)
 * - useUpdateTags: Remplacer tous les tags
 * - useAddTag: Ajouter un tag unique
 * - useRemoveTag: Supprimer un tag
 * - useUpdateScorecard: Mettre a jour la scorecard
 * - useScorecard: Recuperer la scorecard
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  collaborationAPI,
  type ApplicationCollaborationData,
  type RecruiterNote,
  type ScorecardUpdate,
  type GetScorecardResponse,
} from '@/lib/api';
import { useAuth } from '@/hooks/useNextAuth';
import { getErrorMessage } from '@/types';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

// ============================================================
// QUERIES (Lecture)
// ============================================================

/**
 * useCollaboration - Recuperer toutes les donnees de collaboration d'une candidature
 *
 * @param applicationId - ID de la candidature
 * @param options - Options React Query
 *
 * @example
 * const { data, isLoading } = useCollaboration(123);
 * const notes = data?.recruiter_notes || [];
 * const tags = data?.tags || [];
 */
export function useCollaboration(
  applicationId: number,
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<ApplicationCollaborationData>({
    queryKey: queryKeys.collaboration.detail(applicationId),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifie');

      return await collaborationAPI.getCollaboration(token, applicationId);
    },
    enabled: !!applicationId && isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * useCollaborationNotes - Recuperer les notes des recruteurs pour une candidature
 *
 * @param applicationId - ID de la candidature
 * @param options - Options React Query
 *
 * @example
 * const { data: notes, isLoading } = useCollaborationNotes(123);
 */
export function useCollaborationNotes(
  applicationId: number,
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<RecruiterNote[]>({
    queryKey: queryKeys.collaboration.notes(applicationId),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifie');

      return await collaborationAPI.getNotes(token, applicationId);
    },
    enabled: !!applicationId && isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * useScorecard - Recuperer la scorecard d'une candidature
 *
 * @param applicationId - ID de la candidature
 * @param options - Options React Query
 *
 * @example
 * const { data, isLoading } = useScorecard(123);
 * const scorecard = data?.scorecard;
 */
export function useScorecard(
  applicationId: number,
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<GetScorecardResponse>({
    queryKey: queryKeys.collaboration.scorecard(applicationId),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifie');

      return await collaborationAPI.getScorecard(token, applicationId);
    },
    enabled: !!applicationId && isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ============================================================
// MUTATIONS (Ecriture)
// ============================================================

/**
 * useAddNote - Ajouter une note de recruteur a une candidature
 *
 * @example
 * const addNote = useAddNote();
 * addNote.mutate({ applicationId: 123, note: 'Excellent profil technique' });
 */
export function useAddNote() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ applicationId, note }: { applicationId: number; note: string }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifie');

      return await collaborationAPI.addNote(token, applicationId, note);
    },
    onSuccess: (_data, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collaboration.detail(applicationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collaboration.notes(applicationId) });
      toast.success('Note ajoutee avec succes');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de l\'ajout de la note');
      toast.error(message);
      logger.error('Erreur add note:', error);
    },
  });
}

/**
 * useDeleteNote - Supprimer une note de recruteur (par index)
 *
 * @example
 * const deleteNote = useDeleteNote();
 * deleteNote.mutate({ applicationId: 123, noteIndex: 0 });
 */
export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ applicationId, noteIndex }: { applicationId: number; noteIndex: number }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifie');

      await collaborationAPI.deleteNote(token, applicationId, noteIndex);
      return { applicationId, noteIndex };
    },
    onSuccess: ({ applicationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collaboration.detail(applicationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collaboration.notes(applicationId) });
      toast.success('Note supprimee avec succes');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de la suppression de la note');
      toast.error(message);
      logger.error('Erreur delete note:', error);
    },
  });
}

/**
 * useUpdateRating - Mettre a jour la note globale d'une candidature (1-5 etoiles)
 *
 * @example
 * const updateRating = useUpdateRating();
 * updateRating.mutate({ applicationId: 123, rating: 4 });
 */
export function useUpdateRating() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ applicationId, rating }: { applicationId: number; rating: number }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifie');

      return await collaborationAPI.updateRating(token, applicationId, rating);
    },
    onSuccess: (_data, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collaboration.detail(applicationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collaboration.scorecard(applicationId) });
      toast.success('Note mise a jour avec succes');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de la mise a jour de la note');
      toast.error(message);
      logger.error('Erreur update rating:', error);
    },
  });
}

/**
 * useUpdateTags - Remplacer tous les tags d'une candidature
 *
 * @example
 * const updateTags = useUpdateTags();
 * updateTags.mutate({ applicationId: 123, tags: ['senior', 'react', 'remote'] });
 */
export function useUpdateTags() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ applicationId, tags }: { applicationId: number; tags: string[] }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifie');

      return await collaborationAPI.updateTags(token, applicationId, tags);
    },
    onSuccess: (_data, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collaboration.detail(applicationId) });
      toast.success('Tags mis a jour avec succes');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de la mise a jour des tags');
      toast.error(message);
      logger.error('Erreur update tags:', error);
    },
  });
}

/**
 * useAddTag - Ajouter un tag unique a une candidature
 *
 * @example
 * const addTag = useAddTag();
 * addTag.mutate({ applicationId: 123, tag: 'senior' });
 */
export function useAddTag() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ applicationId, tag }: { applicationId: number; tag: string }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifie');

      return await collaborationAPI.addTag(token, applicationId, tag);
    },
    onSuccess: (_data, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collaboration.detail(applicationId) });
      toast.success('Tag ajoute avec succes');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de l\'ajout du tag');
      toast.error(message);
      logger.error('Erreur add tag:', error);
    },
  });
}

/**
 * useRemoveTag - Supprimer un tag d'une candidature
 *
 * @example
 * const removeTag = useRemoveTag();
 * removeTag.mutate({ applicationId: 123, tag: 'senior' });
 */
export function useRemoveTag() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ applicationId, tag }: { applicationId: number; tag: string }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifie');

      await collaborationAPI.removeTag(token, applicationId, tag);
      return { applicationId, tag };
    },
    onSuccess: ({ applicationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collaboration.detail(applicationId) });
      toast.success('Tag supprime avec succes');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de la suppression du tag');
      toast.error(message);
      logger.error('Erreur remove tag:', error);
    },
  });
}

/**
 * useUpdateScorecard - Mettre a jour la scorecard d'evaluation d'une candidature
 *
 * @example
 * const updateScorecard = useUpdateScorecard();
 * updateScorecard.mutate({
 *   applicationId: 123,
 *   scorecard: { technical_skills: 4, soft_skills: 5, experience: 3 }
 * });
 */
export function useUpdateScorecard() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ applicationId, scorecard }: { applicationId: number; scorecard: ScorecardUpdate }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifie');

      return await collaborationAPI.updateScorecard(token, applicationId, scorecard);
    },
    onSuccess: (_data, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collaboration.detail(applicationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collaboration.scorecard(applicationId) });
      toast.success('Scorecard mise a jour avec succes');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Erreur lors de la mise a jour de la scorecard');
      toast.error(message);
      logger.error('Erreur update scorecard:', error);
    },
  });
}
