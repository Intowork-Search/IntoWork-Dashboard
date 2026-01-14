'use client';

/**
 * React Query Hooks - CV Builder
 *
 * Hooks pour gérer le CV Builder:
 * - useCVDocument: Charger le CV de l'utilisateur
 * - useSaveCV: Sauvegarder le CV
 * - useGeneratePDF: Générer un PDF
 * - useCVAnalytics: Récupérer les analytics
 * - useTogglePublic: Activer/désactiver le partage public
 * - useDeleteCV: Supprimer le CV
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createAuthenticatedClient } from '@/lib/api';
import { getApiUrl } from '@/lib/getApiUrl';
import { useAuth } from '@/hooks/useNextAuth';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

export interface PersonalInfo {
  photo: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  title: string;
  summary: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
}

export type CVTemplate = 'elegance' | 'bold' | 'minimal' | 'creative' | 'executive';

export interface CVDocument {
  id: number;
  title: string | null;
  slug: string;
  template: CVTemplate;
  is_public: boolean;
  views_count: number;
  downloads_count: number;
  cv_data: CVData;
  created_at: string;
  updated_at: string;
  public_url: string | null;
}

export interface CVSaveRequest {
  cv_data: CVData;
  template: CVTemplate;
  title?: string;
  slug?: string;
  is_public?: boolean;
}

export interface CVAnalytics {
  total_views: number;
  total_downloads: number;
  views_by_date: Array<{ date: string; count: number }>;
  views_by_country: Array<{ country: string; count: number }>;
  recent_views: Array<{ date: string; referrer: string | null; country: string | null }>;
}

export interface CVPublicResponse {
  slug: string;
  template: CVTemplate;
  cv_data: CVData;
  views_count: number;
}

// ============================================================
// QUERY KEYS
// ============================================================

export const cvBuilderKeys = {
  all: ['cv-builder'] as const,
  document: () => [...cvBuilderKeys.all, 'document'] as const,
  list: () => [...cvBuilderKeys.all, 'list'] as const,
  analytics: () => [...cvBuilderKeys.all, 'analytics'] as const,
  public: (slug: string) => [...cvBuilderKeys.all, 'public', slug] as const,
};

// ============================================================
// API FUNCTIONS
// ============================================================

const cvBuilderAPI = {
  load: async (token: string): Promise<CVDocument | null> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/cv-builder/load');
    return response.data;
  },

  save: async (token: string, data: CVSaveRequest): Promise<CVDocument> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/cv-builder/save', data);
    return response.data;
  },

  list: async (token: string): Promise<CVDocument[]> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/cv-builder/list');
    return response.data;
  },

  getPublic: async (slug: string): Promise<CVPublicResponse> => {
    const response = await fetch(`${getApiUrl()}/cv-builder/public/${slug}`);
    if (!response.ok) {
      throw new Error('CV not found');
    }
    return response.json();
  },

  generatePDF: async (token: string): Promise<Blob> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/cv-builder/generate-pdf', {}, {
      responseType: 'blob',
    });
    return response.data;
  },

  getAnalytics: async (token: string): Promise<CVAnalytics> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get('/cv-builder/analytics');
    return response.data;
  },

  togglePublic: async (token: string): Promise<{ is_public: boolean; public_url: string | null }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.patch('/cv-builder/toggle-public');
    return response.data;
  },

  delete: async (token: string): Promise<void> => {
    const client = createAuthenticatedClient(token);
    await client.delete('/cv-builder/delete');
  },

  trackView: async (slug: string): Promise<void> => {
    await fetch(`${getApiUrl()}/cv-builder/track-view/${slug}`, {
      method: 'POST',
    });
  },
};

// ============================================================
// HOOKS
// ============================================================

/**
 * useCVDocument - Charger le CV de l'utilisateur connecté
 */
export function useCVDocument(options: { enabled?: boolean } = {}) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: cvBuilderKeys.document(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');
      return await cvBuilderAPI.load(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useSaveCV - Sauvegarder le CV
 */
export function useSaveCV() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: CVSaveRequest) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');
      return await cvBuilderAPI.save(token, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cvBuilderKeys.document(), data);
      queryClient.invalidateQueries({ queryKey: cvBuilderKeys.list() });
    },
    onError: (error: Error) => {
      console.error('Error saving CV:', error);
      toast.error('Erreur lors de la sauvegarde du CV');
    },
  });
}

/**
 * useGeneratePDF - Générer et télécharger le PDF
 */
export function useGeneratePDF() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');
      return await cvBuilderAPI.generatePDF(token);
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CV.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('PDF téléchargé avec succès');
    },
    onError: (error: Error) => {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    },
  });
}

/**
 * useCVAnalytics - Récupérer les statistiques du CV
 */
export function useCVAnalytics(options: { enabled?: boolean } = {}) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: cvBuilderKeys.analytics(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');
      return await cvBuilderAPI.getAnalytics(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * useTogglePublic - Activer/désactiver le partage public
 */
export function useTogglePublic() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');
      return await cvBuilderAPI.togglePublic(token);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cvBuilderKeys.document() });
      if (data.is_public) {
        toast.success('CV partagé publiquement');
      } else {
        toast.success('CV rendu privé');
      }
    },
    onError: (error: Error) => {
      console.error('Error toggling public:', error);
      toast.error('Erreur lors du changement de visibilité');
    },
  });
}

/**
 * useDeleteCV - Supprimer le CV
 */
export function useDeleteCV() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');
      return await cvBuilderAPI.delete(token);
    },
    onSuccess: () => {
      queryClient.setQueryData(cvBuilderKeys.document(), null);
      queryClient.invalidateQueries({ queryKey: cvBuilderKeys.all });
      toast.success('CV supprimé');
    },
    onError: (error: Error) => {
      console.error('Error deleting CV:', error);
      toast.error('Erreur lors de la suppression du CV');
    },
  });
}

/**
 * usePublicCV - Charger un CV public par son slug
 */
export function usePublicCV(slug: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: cvBuilderKeys.public(slug),
    queryFn: async () => {
      return await cvBuilderAPI.getPublic(slug);
    },
    enabled: !!slug && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useTrackCVView - Tracker une vue sur un CV public
 */
export function useTrackCVView() {
  return useMutation({
    mutationFn: async (slug: string) => {
      return await cvBuilderAPI.trackView(slug);
    },
  });
}
