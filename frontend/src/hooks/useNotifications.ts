'use client';

/**
 * React Query Hooks - Notifications
 *
 * Hooks pour gérer les notifications utilisateur:
 * - useNotifications: Liste des notifications
 * - useUnreadNotificationsCount: Nombre de notifications non lues
 * - useMarkAsRead: Marquer une notification comme lue
 * - useMarkAllAsRead: Marquer toutes les notifications comme lues
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { notificationsAPI, type Notification, type NotificationListResponse } from '@/lib/api';
import { useAuth } from '@/hooks/useNextAuth';
import toast from 'react-hot-toast';

// ============================================================
// QUERIES (Lecture)
// ============================================================

/**
 * useNotifications - Récupérer la liste des notifications
 *
 * @param limit - Nombre de notifications à récupérer
 * @param offset - Offset pour la pagination
 * @param unreadOnly - Afficher uniquement les notifications non lues
 * @param options - Options React Query
 *
 * @example
 * const { data, isLoading } = useNotifications(20, 0, false);
 * const notifications = data?.notifications || [];
 * const unreadCount = data?.unread_count || 0;
 */
export function useNotifications(
  limit: number = 20,
  offset: number = 0,
  unreadOnly: boolean = false,
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.list(Math.floor(offset / limit) + 1, limit),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      return await notificationsAPI.getNotifications(token, limit, offset, unreadOnly);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 30, // 30 secondes (fréquent pour les notifications)
    refetchInterval: options.refetchInterval ?? 1000 * 60, // 1 minute par défaut
  });
}

/**
 * useUnreadNotificationsCount - Récupérer le nombre de notifications non lues
 *
 * @example
 * const { data: unreadCount } = useUnreadNotificationsCount();
 */
export function useUnreadNotificationsCount(
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) return 0;

      return await notificationsAPI.getUnreadCount(token);
    },
    enabled: isSignedIn && (options.enabled !== false),
    staleTime: 1000 * 30, // 30 secondes
    refetchInterval: options.refetchInterval ?? 1000 * 60, // Polling 1 minute
  });
}

// ============================================================
// MUTATIONS (Écriture)
// ============================================================

/**
 * useMarkNotificationAsRead - Marquer une notification comme lue
 *
 * @example
 * const markAsRead = useMarkNotificationAsRead();
 * markAsRead.mutate(123);
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await notificationsAPI.markAsRead(token, notificationId);
      return notificationId;
    },
    onMutate: async (notificationId) => {
      // Optimistic update - marquer comme lu dans le cache
      const listQueries = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: queryKeys.notifications.all,
      });

      const previousLists: Array<{ key: any; data: NotificationListResponse | undefined }> = [];

      listQueries.forEach(([key, data]) => {
        previousLists.push({ key, data });

        if (data?.notifications) {
          const updatedNotifications = data.notifications.map(notif =>
            notif.id === notificationId
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          );

          queryClient.setQueryData<NotificationListResponse>(key, {
            ...data,
            notifications: updatedNotifications,
            unread_count: Math.max(0, data.unread_count - 1),
          });
        }
      });

      // Décrémenter le compteur
      const unreadCountKey = queryKeys.notifications.unreadCount();
      const previousCount = queryClient.getQueryData<number>(unreadCountKey);

      if (previousCount !== undefined && previousCount > 0) {
        queryClient.setQueryData<number>(unreadCountKey, previousCount - 1);
      }

      return { previousLists, previousCount };
    },
    onSuccess: () => {
      // Refetch pour synchroniser avec le serveur
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error: any, _notificationId, context) => {
      // Rollback en cas d'erreur
      if (context?.previousLists) {
        context.previousLists.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }

      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), context.previousCount);
      }

      const message = error.response?.data?.detail || 'Erreur lors du marquage de la notification';
      toast.error(`❌ ${message}`);
      console.error('Erreur mark as read:', error);
    },
  });
}

/**
 * useMarkAllNotificationsAsRead - Marquer toutes les notifications comme lues
 *
 * @example
 * const markAllAsRead = useMarkAllNotificationsAsRead();
 * markAllAsRead.mutate();
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await notificationsAPI.markAllAsRead(token);
    },
    onMutate: async () => {
      // Optimistic update - marquer toutes comme lues
      const listQueries = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: queryKeys.notifications.all,
      });

      const previousLists: Array<{ key: any; data: NotificationListResponse | undefined }> = [];

      listQueries.forEach(([key, data]) => {
        previousLists.push({ key, data });

        if (data?.notifications) {
          const now = new Date().toISOString();
          const updatedNotifications = data.notifications.map(notif => ({
            ...notif,
            is_read: true,
            read_at: notif.read_at || now,
          }));

          queryClient.setQueryData<NotificationListResponse>(key, {
            ...data,
            notifications: updatedNotifications,
            unread_count: 0,
          });
        }
      });

      // Réinitialiser le compteur
      queryClient.setQueryData<number>(queryKeys.notifications.unreadCount(), 0);

      return { previousLists };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success('✅ Toutes les notifications marquées comme lues !');
    },
    onError: (error: any, _variables, context) => {
      // Rollback
      if (context?.previousLists) {
        context.previousLists.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }

      const message = error.response?.data?.detail || 'Erreur lors du marquage des notifications';
      toast.error(`❌ ${message}`);
      console.error('Erreur mark all as read:', error);
    },
  });
}

/**
 * useDeleteNotification - Supprimer une notification
 *
 * @example
 * const deleteNotification = useDeleteNotification();
 * deleteNotification.mutate(123);
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const token = await getToken();
      if (!token) throw new Error('Non authentifié');

      await notificationsAPI.deleteNotification(token, notificationId);
      return notificationId;
    },
    onMutate: async (notificationId) => {
      // Optimistic update - supprimer de la liste
      const listQueries = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: queryKeys.notifications.all,
      });

      const previousLists: Array<{ key: any; data: NotificationListResponse | undefined }> = [];

      listQueries.forEach(([key, data]) => {
        previousLists.push({ key, data });

        if (data?.notifications) {
          const notifToDelete = data.notifications.find(n => n.id === notificationId);
          const wasUnread = notifToDelete && !notifToDelete.is_read;

          const updatedNotifications = data.notifications.filter(n => n.id !== notificationId);

          queryClient.setQueryData<NotificationListResponse>(key, {
            ...data,
            notifications: updatedNotifications,
            total: data.total - 1,
            unread_count: wasUnread ? Math.max(0, data.unread_count - 1) : data.unread_count,
          });
        }
      });

      return { previousLists };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success('✅ Notification supprimée !');
    },
    onError: (error: any, _notificationId, context) => {
      // Rollback
      if (context?.previousLists) {
        context.previousLists.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }

      const message = error.response?.data?.detail || 'Erreur lors de la suppression';
      toast.error(`❌ ${message}`);
      console.error('Erreur delete notification:', error);
    },
  });
}
