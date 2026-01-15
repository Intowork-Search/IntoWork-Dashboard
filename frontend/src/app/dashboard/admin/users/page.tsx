"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { useAdminUsers } from '@/hooks/useAdminData';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Utilise SWR pour le cache automatique
  const { users, isLoading, refresh } = useAdminUsers(userSearch, userRoleFilter);

  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    if (!session?.accessToken) return;
    
    try {
      await adminAPI.toggleUserActivation(session.accessToken, userId, !currentStatus);
      toast.success(currentStatus ? 'Utilisateur désactivé avec succès' : 'Utilisateur activé avec succès');
      refresh(); // Rafraîchit le cache SWR
    } catch (error) {
      console.error('Erreur toggle status:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`⚠️ ATTENTION ⚠️\n\nÊtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${userEmail} ?\n\nCette action est IRRÉVERSIBLE et supprimera toutes les données associées.`)) return;
    if (!session?.accessToken) return;

    try {
      await adminAPI.deleteUser(session.accessToken, userId);
      toast.success('Utilisateur supprimé avec succès');
      refresh(); // Rafraîchit le cache SWR
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la suppression';
      toast.error(errorMessage);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout title="Utilisateurs" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Gestion des utilisateurs" 
      subtitle={`${users.length} utilisateur${users.length > 1 ? 's' : ''} au total`}
    >
      <div className="space-y-6">
        {/* Filtres */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] text-gray-900 placeholder:text-gray-400 transition-all duration-200"
              />
            </div>
            <select
              title="Filtrer par rôle"
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] text-gray-900 transition-all duration-200"
            >
              <option value="">Tous les rôles</option>
              <option value="candidate">Candidats</option>
              <option value="employer">Employeurs</option>
              <option value="admin">Admins</option>
            </select>
            <button
              onClick={() => refresh()}
              className="px-6 py-3 bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white rounded-2xl hover:shadow-lg hover:shadow-[#6B9B5F]/30 transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Table des utilisateurs */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Inscription</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#3B82F6] flex items-center justify-center text-white font-bold shadow-lg shadow-[#6B46C1]/20">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-4 py-1.5 text-xs font-bold rounded-full ${
                        user.role === 'admin' ? 'bg-[#6B46C1]/10 text-[#6B46C1]' :
                        user.role === 'candidate' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
                        'bg-[#6B9B5F]/10 text-[#6B9B5F]'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'candidate' ? 'Candidat' : 'Employeur'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full ${
                        user.is_active ? 'bg-[#6B9B5F]/10 text-[#6B9B5F]' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? (
                          <><CheckCircleIcon className="w-4 h-4" /> Actif</>
                        ) : (
                          <><XCircleIcon className="w-4 h-4" /> Inactif</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                            user.is_active
                              ? 'bg-[#F7C700]/10 text-[#b39200] hover:bg-[#F7C700]/20'
                              : 'bg-[#6B9B5F]/10 text-[#6B9B5F] hover:bg-[#6B9B5F]/20'
                          }`}
                        >
                          {user.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="px-4 py-2 text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 rounded-xl transition-all duration-200"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
