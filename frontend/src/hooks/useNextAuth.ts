'use client';

import { useSession } from 'next-auth/react';

/**
 * Retourne getToken qui récupère l'accessToken de la session NextAuth
 */
export function useAuth() {
  const { data: session, status } = useSession();

  const getToken = async () => {
    return session?.accessToken || null;
  };

  return {
    getToken,
    isLoaded: status !== 'loading',
    isSignedIn: !!session,
    userId: session?.user?.id,
  };
}

/**
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
