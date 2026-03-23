'use client';

import { useCallback } from 'react';
import { useAuth } from '@/hooks/useNextAuth';
import { candidatesAPI } from '@/lib/api';
import type { CandidateProfile } from '@/lib/api';

/**
 * useAuthenticatedAPI — Encapsule les appels API en injectant le token automatiquement.
 * Retourne un objet `candidateAPI` dont chaque méthode gère le token en interne.
 */
export function useAuthenticatedAPI() {
  const { getToken } = useAuth();

  const candidateAPI = {
    getProfile: useCallback(async (): Promise<CandidateProfile> => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');
      return candidatesAPI.getMyProfile(token);
    }, [getToken]),

    updateProfile: useCallback(async (data: Partial<CandidateProfile>): Promise<CandidateProfile> => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');
      return candidatesAPI.updateMyProfile(token, data);
    }, [getToken]),
  };

  return { candidateAPI };
}
