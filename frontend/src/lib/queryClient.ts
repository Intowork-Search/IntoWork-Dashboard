/**
 * React Query (TanStack Query) Configuration
 *
 * Configuration centralisée du QueryClient pour l'application IntoWork
 * Gère le caching, les retry, et les refetch automatiques
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Configuration globale du QueryClient
 *
 * Options principales:
 * - staleTime: 5 minutes - Durée pendant laquelle les données sont considérées "fraîches"
 * - gcTime (garbage collection): 30 minutes - Durée avant suppression du cache
 * - retry: 2 - Nombre de tentatives en cas d'échec
 * - refetchOnWindowFocus: true - Rafraîchir quand l'utilisateur revient sur l'onglet
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Durée pendant laquelle les données sont considérées "fraîches"
      staleTime: 1000 * 60 * 5, // 5 minutes

      // Durée avant garbage collection (suppression du cache)
      gcTime: 1000 * 60 * 30, // 30 minutes

      // Nombre de retry automatiques en cas d'échec
      retry: 2,

      // ⚠️ CORRECTIF PERFORMANCE: Désactivé pour éviter le polling excessif
      // Avec plusieurs onglets ouverts, cela causait des centaines de requêtes
      refetchOnWindowFocus: false,

      // Rafraîchir automatiquement lors d'une reconnexion réseau
      refetchOnReconnect: true,

      // ⚠️ CORRECTIF PERFORMANCE: false = pas de refetch automatique au montage
      // Évite les refetch inutiles à chaque navigation entre pages
      // Les données restent en cache pendant staleTime (5 minutes)
      refetchOnMount: false,
    },
    mutations: {
      // Mutations: 1 seul retry par défaut
      retry: 1,
    },
  },
});

/**
 * Helper pour invalider plusieurs query keys en une fois
 */
export const invalidateMultipleQueries = async (queryKeys: string[][]) => {
  await Promise.all(
    queryKeys.map(key => queryClient.invalidateQueries({ queryKey: key }))
  );
};

/**
 * Helper pour préfetch une query
 */
export const prefetchQuery = async <TData>(
  queryKey: string[],
  queryFn: () => Promise<TData>
) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
};
