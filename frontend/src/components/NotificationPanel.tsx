'use client';

/**
 * NotificationPanel - Panneau de notifications
 * 
 * Migrée vers React Query pour meilleures performances
 * - Cache automatique (2 min)
 * - Pas de polling excessif
 * - Mutations optimistes
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification
} from '@/hooks';
import { type Notification } from '@/lib/api';
import { BellIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Utiliser React Query hooks
  const { data: notificationsData } = useNotifications(10, 0);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Extraire les données
  const notifications = notificationsData?.notifications || [];

  // Fermer le panel si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Marquer une notification comme lue
  const handleMarkAsRead = async (notificationId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    markAsReadMutation.mutate(notificationId);
  };

  // Marquer toutes comme lues
  const handleMarkAllAsRead = async () => {
    markAllAsReadMutation.mutate();
  };

  // Supprimer une notification
  const handleDelete = async (notificationId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    deleteNotificationMutation.mutate(notificationId);
  };

  // Icône selon le type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_application':
        return '📝';
      case 'status_change':
        return '📬';
      case 'new_job':
        return '💼';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  // Lien selon le type
  const getNotificationLink = (notification: Notification) => {
    if (notification.related_application_id) {
      return `/dashboard/applications`;
    }
    if (notification.related_job_id) {
      return `/dashboard/jobs/${notification.related_job_id}`;
    }
    return '#';
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bouton de notification */}
      <button
        data-tour="notifications"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="w-6 h-6 text-blue-600" />
        ) : (
          <BellIcon className="w-6 h-6 text-gray-600" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel des notifications */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-128 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fermer"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste des notifications */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {notifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-500">
                <BellIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={getNotificationLink(notification)}
                    onClick={() => {
                      if (!notification.is_read) {
                        handleMarkAsRead(notification.id, {} as React.MouseEvent);
                      }
                      setIsOpen(false);
                    }}
                    className={`block p-3 sm:p-4 hover:bg-gray-50 transition-colors ${
                      notification.is_read ? '' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="text-xl sm:text-2xl shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { 
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-0.5 sm:gap-1">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                            title="Marquer comme lu"
                          >
                            <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notification.id, e)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Supprimer"
                        >
                          <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir toutes les notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
