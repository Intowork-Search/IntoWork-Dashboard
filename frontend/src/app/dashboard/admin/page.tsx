"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI, type AdminStats, type AdminUser, type AdminEmployer, type AdminJob } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'employers' | 'jobs'>('stats');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [employers, setEmployers] = useState<AdminEmployer[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<AdminJob | null>(null);
  
  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/sign-in');
      return;
    }

    // Vérifier que l'utilisateur est admin
    if (session.user?.role !== 'admin') {
      toast.error('Accès refusé : Vous devez être administrateur');
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [session, status, router, activeTab]);

  const loadData = async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const token = session.accessToken;

      switch (activeTab) {
        case 'stats': {
          const statsData = await adminAPI.getStats(token);
          setStats(statsData);
          break;
        }
        case 'users': {
          const usersData = await adminAPI.getUsers(token, {
            search: userSearch || undefined,
            role: userRoleFilter || undefined,
            limit: 100
          });
          setUsers(usersData);
          break;
        }
        case 'employers': {
          const employersData = await adminAPI.getEmployers(token, { limit: 100 });
          setEmployers(employersData);
          break;
        }
        case 'jobs': {
          const jobsData = await adminAPI.getJobs(token, { limit: 100 });
          setJobs(jobsData);
          break;
        }
      }
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    if (!session?.accessToken) return;

    try {
      const newStatus = !currentStatus;
      await adminAPI.toggleUserActivation(session.accessToken, userId, newStatus);
      toast.success(`Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
      loadData(); // Reload data
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la modification');
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!session?.accessToken) return;
    
    // Toast de confirmation avec boutons
    const confirmation = globalThis.confirm(`⚠️ ATTENTION ⚠️\n\nÊtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?\n\nCette action est IRRÉVERSIBLE et supprimera:\n- Le compte utilisateur\n- Toutes ses données associées\n- Son profil (candidat ou employeur)\n\nTapez OK pour confirmer la suppression.`);
    
    if (!confirmation) {
      toast('ℹ️ Suppression annulée', { icon: 'ℹ️' });
      return;
    }

    try {
      await adminAPI.deleteUser(session.accessToken, userId);
      toast.success('✅ Utilisateur supprimé avec succès');
      loadData(); // Reload data
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '❌ Erreur lors de la suppression');
    }
  };
  
  // Helper function for role badge color
  const getRoleBadgeClass = (role: string): string => {
    if (role === 'admin') return 'bg-red-100 text-red-800';
    if (role === 'employer') return 'bg-purple-100 text-purple-800';
    return 'bg-green-100 text-green-800';
  };

  // Helper function for job status badge color
  const getJobStatusBadgeClass = (status: string): string => {
    if (status === 'published') return 'bg-green-100 text-green-800';
    if (status === 'draft') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Helper function for job status label
  const getJobStatusLabel = (status: string): string => {
    if (status === 'published') return '✓ Publié';
    if (status === 'draft') return '📝 Brouillon';
    return status;
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          🔐 Back-office Admin
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Gérez la plateforme IntoWork
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="-mb-px flex space-x-4 px-6">
            {[
              { id: 'stats', label: 'Statistiques', icon: '📊' },
              { id: 'users', label: 'Utilisateurs', icon: '👥' },
              { id: 'employers', label: 'Employeurs', icon: '💼' },
              { id: 'jobs', label: 'Offres', icon: '📝' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                } flex items-center gap-2 whitespace-nowrap py-4 px-4 border-b-2 font-semibold text-sm transition-all rounded-t-lg`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Utilisateurs" value={stats.total_users} icon="👥" color="blue" />
            <StatsCard title="Candidats" value={stats.total_candidates} icon="🎓" color="green" />
            <StatsCard title="Employeurs" value={stats.total_employers} icon="💼" color="purple" />
            <StatsCard title="Entreprises" value={stats.total_companies} icon="🏢" color="indigo" />
            <StatsCard title="Offres d'emploi" value={stats.total_jobs} icon="📝" color="yellow" />
            <StatsCard title="Candidatures" value={stats.total_applications} icon="📬" color="pink" />
            <StatsCard title="Utilisateurs actifs" value={stats.active_users} icon="✅" color="green" />
            <StatsCard title="Inscriptions (7j)" value={stats.recent_signups} icon="🆕" color="blue" />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <div className="p-6 bg-blue-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 Rechercher des utilisateurs</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="user-search" className="block text-sm font-semibold text-gray-700 mb-2">
                    Recherche par email ou nom
                  </label>
                  <input
                    id="user-search"
                    type="text"
                    placeholder="Tapez pour rechercher..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 font-medium shadow-sm"
                  />
                </div>
                <div className="sm:w-48">
                  <label htmlFor="role-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                    Filtrer par rôle
                  </label>
                  <select
                    id="role-filter"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium shadow-sm cursor-pointer"
                    aria-label="Filtrer par rôle"
                  >
                    <option value="">Tous les rôles</option>
                    <option value="candidate">Candidat</option>
                    <option value="employer">Employeur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="sm:w-32 flex items-end">
                  <button
                    onClick={() => loadData()}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
                  >
                    Rechercher
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date création</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? '✓ Actif' : '✗ Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold space-x-3">
                        {user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                              className={`${
                                user.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'
                              } font-semibold hover:underline`}
                            >
                              {user.is_active ? '⊘ Désactiver' : '✓ Activer'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="text-red-600 hover:text-red-800 font-semibold hover:underline"
                            >
                              🗑 Supprimer
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employers Tab */}
        {activeTab === 'employers' && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <div className="p-6 bg-purple-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">💼 Liste des Employeurs</h2>
              <p className="text-sm text-gray-600">Tous les employeurs inscrits sur la plateforme</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Entreprise</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Poste</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employers.map((employer) => (
                    <tr key={employer.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{employer.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employer.first_name} {employer.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employer.company_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employer.position || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employer.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          employer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {employer.is_active ? '✓ Actif' : '✗ Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <div className="p-6 bg-green-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📝 Offres d'emploi</h2>
              <p className="text-sm text-gray-600">Toutes les offres publiées sur la plateforme</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Titre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Entreprise</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Employeur</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lieu</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Candidatures</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date création</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr 
                      key={job.id} 
                      className="hover:bg-green-50 transition-colors cursor-pointer"
                      onClick={() => {
                        console.log('Job cliqué:', job);
                        setSelectedJob(job);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{job.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                        {job.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.company_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.employer_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.location || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getJobStatusBadgeClass(job.status)}`}>
                          {getJobStatusLabel(job.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
                          {job.applications_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {new Date(job.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal détails d'une offre */}
        {selectedJob && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-transparent" 
            onClick={() => {
              console.log('Fermeture du modal');
              setSelectedJob(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSelectedJob(null);
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
              <div className="flex items-center justify-center min-h-screen px-4 py-8">
                {/* Modal */}
                <div 
                  className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Clic dans le modal');
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  role="document"
                >
                {/* Header */}
                <div className="bg-green-500 px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 id="modal-title" className="text-2xl font-bold text-white">
                        {selectedJob.title}
                      </h3>
                      <p className="mt-1 text-green-50">
                        {selectedJob.company_name} • {selectedJob.location || 'Lieu non spécifié'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="ml-4 text-white hover:text-gray-200 transition-colors"
                      aria-label="Fermer le modal"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Statut</p>
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getJobStatusBadgeClass(selectedJob.status)}`}>
                        {getJobStatusLabel(selectedJob.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Employeur</p>
                      <p className="text-lg font-medium text-gray-900">{selectedJob.employer_email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Nombre de candidatures</p>
                      <p className="text-lg font-bold text-blue-600">{selectedJob.applications_count}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Entreprise</p>
                      <p className="text-lg font-medium text-gray-900">{selectedJob.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Date de création</p>
                      <p className="text-lg font-medium text-gray-900">
                        {new Date(selectedJob.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {selectedJob.location && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-500 mb-1">📍 Localisation</p>
                      <p className="text-lg font-medium text-gray-900">{selectedJob.location}</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Stats Card Component
interface StatsCardProps {
  readonly title: string;
  readonly value: number;
  readonly icon: string;
  readonly color: string;
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-600 text-white shadow-blue-200',
    green: 'bg-green-600 text-white shadow-green-200',
    purple: 'bg-purple-600 text-white shadow-purple-200',
    indigo: 'bg-indigo-600 text-white shadow-indigo-200',
    yellow: 'bg-yellow-600 text-white shadow-yellow-200',
    pink: 'bg-pink-600 text-white shadow-pink-200',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold opacity-90 mb-1">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <div className="p-4 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
          <span className="text-4xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
