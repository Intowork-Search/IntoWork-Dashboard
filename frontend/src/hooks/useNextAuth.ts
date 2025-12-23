'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

/**
 * Hook personnalisé pour remplacer useAuth de Clerk
 * Retourne getToken qui récupère l'accessToken de la session NextAuth
 */
export function useAuth() {
  const { data: session } = useSession();

  const getToken = useCallback(async () => {
    return session?.accessToken || null;
  }, [session]);

  return {
    getToken,
    isLoaded: true, // NextAuth charge automatiquement
    isSignedIn: !!session,
    userId: session?.user?.id,
  };
}

/**
 * Hook personnalisé pour remplacer useUser de Clerk
 * Retourne les informations de l'utilisateur depuis la session NextAuth
 */
export function useUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ? {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.name?.split(' ')[0] || '',
      lastName: session.user.name?.split(' ')[1] || '',
      fullName: session.user.name,
      imageUrl: session.user.image,
      role: session.user.role,
    } : null,
    isLoaded: status !== 'loading',
    isSignedIn: !!session,
  };
}
