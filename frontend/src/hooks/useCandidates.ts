'use client';

/**
 * React Query Hooks - Candidates (Profils candidats)
 *
 * Hooks pour gérer le profil candidat:
 * - useCandidateProfile: Profil complet du candidat
 * - useUpdateCandidateProfile: Mettre à jour le profil
 * - useCandidateCVs: Liste des CVs
 * - useDeleteCV: Supprimer un CV
 * - useExperiences: Expériences professionnelles
 * - useAddExperience, useUpdateExperience, useDeleteExperience
 * - useEducations: Formations
 * - useAddEducation, useUpdateEducation, useDeleteEducation
 * - useSkills: Compétences
 * - useAddSkill, useUpdateSkill, useDeleteSkill
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  candidatesAPI,
  type CandidateProfile,
  type Experience,
  type Education,
  type Skill,
  type CV,
} from '@/lib/api';
import { useAuth } from '@/hooks/useNextAuth';
import toast from 'react-hot-toast';

// ============================================================
// QUERIES (Lecture) - PROFIL
// ============================================================

/**
 * useCandidateProfile - Récupérer le profil du candidat connecté
 *
 * @example
 * const { data: profile, isLoading } = useCandidateProfile();
 */
export function useCandidateProfile(
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.candidates.profile(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await candidatesAPI.getMyProfile(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useCandidateCVs - Récupérer la liste des CVs du candidat
 *
 * @example
 * const { data: cvs, isLoading } = useCandidateCVs();
 */
export function useCandidateCVs(
  options: {
    enabled?: boolean;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.candidates.cvs(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await candidatesAPI.listCVs(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// ============================================================
// MUTATIONS (Écriture) - PROFIL
// ============================================================

/**
 * useUpdateCandidateProfile - Mettre à jour le profil du candidat
 *
 * @example
 * const updateProfile = useUpdateCandidateProfile();
 * updateProfile.mutate({ title: 'Full Stack Developer', location: 'Paris' });
 */
export function useUpdateCandidateProfile() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (profileData: Partial<CandidateProfile>) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await candidatesAPI.updateMyProfile(token, profileData);
    },
    onMutate: async (newProfileData) => {
      // Optimistic update
      const queryKey = queryKeys.candidates.profile();
      await queryClient.cancelQueries({ queryKey });

      const previousProfile = queryClient.getQueryData<CandidateProfile>(queryKey);

      if (previousProfile) {
        queryClient.setQueryData<CandidateProfile>(queryKey, {
          ...previousProfile,
          ...newProfileData,
        });
      }

      return { previousProfile, queryKey };
    },
    onSuccess: (updatedProfile) => {
      // Mettre à jour avec les données du serveur
      queryClient.setQueryData(queryKeys.candidates.profile(), updatedProfile);

      // Invalider le dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      toast.success('✅ Profil mis à jour avec succès !');
    },
    onError: (error: any, _variables, context) => {
      // Rollback
      if (context?.previousProfile && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousProfile);
      }

      const message = error.response?.data?.detail || 'Erreur lors de la mise à jour du profil';
      toast.error(`❌ ${message}`);
      console.error('Erreur update profile:', error);
    },
  });
}

/**
 * useDeleteCV - Supprimer un CV
 *
 * @example
 * const deleteCV = useDeleteCV();
 * deleteCV.mutate(123);
 */
export function useDeleteCV() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (cvId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await candidatesAPI.deleteCV(token, cvId);
      return cvId;
    },
    onMutate: async (cvId) => {
      // Optimistic update
      const queryKey = queryKeys.candidates.cvs();
      await queryClient.cancelQueries({ queryKey });

      const previousCVs = queryClient.getQueryData<CV[]>(queryKey);

      if (previousCVs) {
        queryClient.setQueryData<CV[]>(
          queryKey,
          previousCVs.filter(cv => cv.id !== cvId)
        );
      }

      return { previousCVs, queryKey };
    },
    onSuccess: () => {
      // Invalider pour refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.cvs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.profile() });

      toast.success('✅ CV supprimé avec succès !');
    },
    onError: (error: any, _cvId, context) => {
      // Rollback
      if (context?.previousCVs && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousCVs);
      }

      const message = error.response?.data?.detail || 'Erreur lors de la suppression du CV';
      toast.error(`❌ ${message}`);
      console.error('Erreur delete CV:', error);
    },
  });
}

// ============================================================
// MUTATIONS - EXPÉRIENCES
// ============================================================

/**
 * useAddExperience - Ajouter une expérience professionnelle
 *
 * @example
 * const addExperience = useAddExperience();
 * addExperience.mutate({ title: 'Developer', company: 'Google', ... });
 */
export function useAddExperience() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (experienceData: Omit<Experience, 'id'>) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await candidatesAPI.addExperience(token, experienceData);
    },
    onSuccess: () => {
      // Invalider le profil pour refetch avec la nouvelle expérience
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.experiences() });

      toast.success('✅ Expérience ajoutée avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erreur lors de l\'ajout de l\'expérience';
      toast.error(`❌ ${message}`);
      console.error('Erreur add experience:', error);
    },
  });
}

/**
 * useUpdateExperience - Mettre à jour une expérience professionnelle
 *
 * @example
 * const updateExperience = useUpdateExperience();
 * updateExperience.mutate({ id: 123, data: { title: 'Senior Developer' } });
 */
export function useUpdateExperience() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Experience> }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await candidatesAPI.updateExperience(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.experiences() });

      toast.success('✅ Expérience mise à jour !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erreur lors de la mise à jour';
      toast.error(`❌ ${message}`);
      console.error('Erreur update experience:', error);
    },
  });
}

/**
 * useDeleteExperience - Supprimer une expérience professionnelle
 *
 * @example
 * const deleteExperience = useDeleteExperience();
 * deleteExperience.mutate(123);
 */
export function useDeleteExperience() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (experienceId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await candidatesAPI.deleteExperience(token, experienceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.experiences() });

      toast.success('✅ Expérience supprimée !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erreur lors de la suppression';
      toast.error(`❌ ${message}`);
      console.error('Erreur delete experience:', error);
    },
  });
}

// ============================================================
// MUTATIONS - FORMATIONS
// ============================================================

/**
 * useAddEducation - Ajouter une formation
 */
export function useAddEducation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (educationData: Omit<Education, 'id'>) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await candidatesAPI.addEducation(token, educationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.educations() });

      toast.success('✅ Formation ajoutée avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erreur lors de l\'ajout de la formation';
      toast.error(`❌ ${message}`);
      console.error('Erreur add education:', error);
    },
  });
}

/**
 * useUpdateEducation - Mettre à jour une formation
 */
export function useUpdateEducation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Education> }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await candidatesAPI.updateEducation(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.educations() });

      toast.success('✅ Formation mise à jour !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erreur lors de la mise à jour';
      toast.error(`❌ ${message}`);
    },
  });
}

/**
 * useDeleteEducation - Supprimer une formation
 */
export function useDeleteEducation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (educationId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await candidatesAPI.deleteEducation(token, educationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.educations() });

      toast.success('✅ Formation supprimée !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erreur lors de la suppression';
      toast.error(`❌ ${message}`);
    },
  });
}

// ============================================================
// MUTATIONS - COMPÉTENCES
// ============================================================

/**
 * useAddSkill - Ajouter une compétence
 */
export function useAddSkill() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (skillData: Omit<Skill, 'id'>) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await candidatesAPI.addSkill(token, skillData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.skills() });

      toast.success('✅ Compétence ajoutée avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erreur lors de l\'ajout de la compétence';
      toast.error(`❌ ${message}`);
    },
  });
}

/**
 * useUpdateSkill - Mettre à jour une compétence
 */
export function useUpdateSkill() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Skill> }) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await candidatesAPI.updateSkill(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.skills() });

      toast.success('✅ Compétence mise à jour !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erreur lors de la mise à jour';
      toast.error(`❌ ${message}`);
    },
  });
}

/**
 * useDeleteSkill - Supprimer une compétence
 */
export function useDeleteSkill() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (skillId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await candidatesAPI.deleteSkill(token, skillId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.skills() });

      toast.success('✅ Compétence supprimée !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erreur lors de la suppression';
      toast.error(`❌ ${message}`);
    },
  });
}
