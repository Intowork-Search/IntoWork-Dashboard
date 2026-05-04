"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { useAdminUsers } from '@/hooks/useAdminData';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/api';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Modal confirmation suppression
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; userId: number | null; userEmail: string }>({
    open: false, userId: null, userEmail: '',
  });
  const [deleting, setDeleting] = useState(false);

  // Modal création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'candidate' as 'candidate' | 'employer',
    company_name: '',
  });

  const { data: users = [], isLoading, refetch } = useAdminUsers(
    { search: userSearch || undefined, role: userRoleFilter || undefined }
  );

  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  if (status === 'authenticated' && session?.user?.role !== 'admin') {
    router.replace('/dashboard');
    return null;
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    if (!session?.accessToken) return;
    
    try {
      await adminAPI.toggleUserActivation(session.accessToken, userId, !currentStatus);
      toast.success(currentStatus ? 'Utilisateur désactivé avec succès' : 'Utilisateur activé avec succès');
      refetch();
    } catch (error) {
      logger.error("Erreur toggle status:", error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    setDeleteConfirm({ open: true, userId, userEmail });
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirm.userId || !session?.accessToken) return;
    setDeleting(true);
    try {
      await adminAPI.deleteUser(session.accessToken, deleteConfirm.userId);
      toast.success('Utilisateur supprimé avec succès');
      setDeleteConfirm({ open: false, userId: null, userEmail: '' });
      refetch();
    } catch (error: unknown) {
      logger.error("Erreur suppression:", error);
      toast.error(getErrorMessage(error, 'Erreur lors de la suppression'));
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    setCreating(true);
    try {
      await adminAPI.createUser(session.accessToken, {
        email: createForm.email,
        first_name: createForm.first_name,
        last_name: createForm.last_name,
        role: createForm.role,
        company_name: createForm.role === 'employer' ? createForm.company_name : undefined,
      });
      toast.success(`Compte créé et email envoyé à ${createForm.email}`);
      setShowCreateModal(false);
      setCreateForm({ first_name: '', last_name: '', email: '', role: 'candidate', company_name: '' });
      refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Erreur lors de la création'));
    } finally {
      setCreating(false);
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
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] text-gray-900 dark:text-white placeholder:text-gray-400 transition-all duration-200"
              />
            </div>
            <select
              title="Filtrer par rôle"
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="">Tous les rôles</option>
              <option value="candidate">Candidats</option>
              <option value="employer">Employeurs</option>
              <option value="admin">Admins</option>
            </select>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white rounded-2xl hover:shadow-lg hover:shadow-[#6B9B5F]/30 transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Actualiser
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#6B46C1] to-[#5a35b0] text-white rounded-2xl hover:shadow-lg hover:shadow-[#6B46C1]/30 transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              Créer un utilisateur
            </button>
          </div>
        </div>

        {/* Table des utilisateurs */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Inscription</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#3B82F6] flex items-center justify-center text-white font-bold shadow-lg shadow-[#6B46C1]/20">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user.first_name} {user.last_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
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
                    <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">
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
              <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal création utilisateur */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Créer un utilisateur</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors">
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={createForm.first_name}
                    onChange={(e) => setCreateForm(f => ({ ...f, first_name: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#6B9B5F] text-gray-900 dark:text-white text-sm"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={createForm.last_name}
                    onChange={(e) => setCreateForm(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#6B9B5F] text-gray-900 dark:text-white text-sm"
                    placeholder="Dupont"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#6B9B5F] text-gray-900 dark:text-white text-sm"
                  placeholder="jean.dupont@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm(f => ({ ...f, role: e.target.value as 'candidate' | 'employer' }))}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#6B9B5F] text-gray-900 dark:text-white text-sm"
                >
                  <option value="candidate">Candidat</option>
                  <option value="employer">Employeur</option>
                </select>
              </div>
              {createForm.role === 'employer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l&apos;entreprise</label>
                  <input
                    type="text"
                    required
                    value={createForm.company_name}
                    onChange={(e) => setCreateForm(f => ({ ...f, company_name: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#6B9B5F] text-gray-900 dark:text-white text-sm"
                    placeholder="Nom de l'entreprise"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                Un mot de passe temporaire sera généré automatiquement et envoyé par email à l&apos;utilisateur.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#6B46C1] to-[#5a35b0] text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Création...</>
                  ) : (
                    <><PlusIcon className="w-4 h-4" /> Créer et envoyer</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Supprimer cet utilisateur ?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Vous êtes sur le point de supprimer définitivement le compte de
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 break-all">{deleteConfirm.userEmail}</p>
                <p className="text-xs text-red-500 mt-2 font-medium">
                  Cette action est irréversible et supprimera toutes les données associées.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setDeleteConfirm({ open: false, userId: null, userEmail: '' })}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-red-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Suppression...</>
                  ) : (
                    <><TrashIcon className="w-4 h-4" /> Supprimer</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
