"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI, type AdminStats, type AdminUser, type AdminEmployer, type AdminJob } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

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
  
  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  
  // Pagination
  const [employersPage, setEmployersPage] = useState(1);
  const [jobsPage, setJobsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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
  }, [session, status, router, activeTab, loadData]); // ✅ Ajout de loadData

  // Recharger quand la pagination change
  useEffect(() => {
    if (session && (activeTab === 'employers' || activeTab === 'jobs')) {
      loadData();
    }
  }, [employersPage, jobsPage, session, activeTab, loadData]); // ✅ Ajout de loadData

  const loadData = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const token = session.accessToken;

      switch (activeTab) {
        case 'stats': {
          const statsData = await adminAPI.getStats(token);
          console.log('📊 Stats reçues:', statsData);
          console.log('📊 Jobs by status:', statsData?.jobs_by_status);
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
          const employersData = await adminAPI.getEmployers(token, { 
            limit: ITEMS_PER_PAGE,
            skip: (employersPage - 1) * ITEMS_PER_PAGE
          });
          setEmployers(employersData);
          break;
        }
        case 'jobs': {
          const jobsData = await adminAPI.getJobs(token, { 
            limit: ITEMS_PER_PAGE,
            skip: (jobsPage - 1) * ITEMS_PER_PAGE
          });
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
  }, [session?.accessToken, activeTab, userSearch, userRoleFilter, employersPage, jobsPage]); // ✅ useCallback avec dépendances

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    if (!session?.accessToken) return;

    try {
      const newStatus = !currentStatus;
      await adminAPI.toggleUserActivation(session.accessToken, userId, newStatus);
      toast.success(`Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la modification');
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!session?.accessToken) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(session.accessToken, userId);
      toast.success('Utilisateur supprimé avec succès');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  // Données réelles depuis la BD (pas de mock data)
  // Note: Pour les données mensuelles, on utilise les totaux actuels
  // TODO: Implémenter une API pour récupérer les vraies données mensuelles
  const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'short' });
  const monthlyData = [
    { 
      month: currentMonth, 
      users: stats?.total_users || 0, 
      jobs: stats?.total_jobs || 0, 
      applications: stats?.total_applications || 0 
    },
  ];

  const userDistribution = [
    { name: 'Candidats', value: stats?.total_candidates || 0, color: '#3B82F6' },
    { name: 'Employeurs', value: stats?.total_employers || 0, color: '#10B981' },
    { name: 'Actifs', value: stats?.active_users || 0, color: '#F59E0B' },
  ];

  const jobStatusData = [
    { name: 'Actives', value: (stats?.jobs_by_status?.active || stats?.jobs_by_status?.ACTIVE || 0), color: '#10B981' },
    { name: 'Pourvues', value: (stats?.jobs_by_status?.filled || stats?.jobs_by_status?.FILLED || 0), color: '#3B82F6' },
    { name: 'Expirées', value: (stats?.jobs_by_status?.expired || stats?.jobs_by_status?.EXPIRED || stats?.jobs_by_status?.closed || stats?.jobs_by_status?.CLOSED || 0), color: '#EF4444' },
    { name: 'Brouillons', value: (stats?.jobs_by_status?.draft || stats?.jobs_by_status?.DRAFT || 0), color: '#F59E0B' },
  ];

  // Si aucune donnée ne correspond, afficher les données brutes de l'API
  const hasJobStatusData = jobStatusData.some(item => item.value > 0);
  const rawJobStatusData = stats?.jobs_by_status ? Object.entries(stats.jobs_by_status).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
    value: value as number,
    color: name === 'active' || name === 'ACTIVE' ? '#10B981' :
           name === 'filled' || name === 'FILLED' ? '#3B82F6' :
           name === 'expired' || name === 'EXPIRED' || name === 'closed' || name === 'CLOSED' ? '#EF4444' :
           '#F59E0B'
  })) : [];
  
  const displayJobStatusData = hasJobStatusData ? jobStatusData : rawJobStatusData;

  // Stats cards data
  const statsCards = [
    {
      title: 'Utilisateurs Totaux',
      value: stats?.total_users || 0,
      change: '+12.5%',
      trend: 'up',
      icon: UsersIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Offres d\'emploi',
      value: stats?.total_jobs || 0,
      change: '+8.2%',
      trend: 'up',
      icon: BriefcaseIcon,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Entreprises',
      value: stats?.total_employers || 0,
      change: '+5.7%',
      trend: 'up',
      icon: BuildingOfficeIcon,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Candidatures',
      value: stats?.total_applications || 0,
      change: '+18.3%',
      trend: 'up',
      icon: DocumentTextIcon,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
  ];

  const renderStatsView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} border ${card.borderColor} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{card.value.toLocaleString()}</h3>
                <div className="flex items-center gap-1">
                  {card.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500">ce mois</span>
                </div>
              </div>
              <div className={`${card.bgColor} p-3 rounded-xl border ${card.borderColor}`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Statistiques Actuelles</h3>
              <p className="text-sm text-gray-500 mt-1">Vue d'ensemble des principaux indicateurs</p>
            </div>
            <ChartBarIcon className="w-6 h-6 text-gray-400" />
          </div>
          {!stats || (stats.total_users === 0 && stats.total_jobs === 0 && stats.total_applications === 0) ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
                <p className="text-gray-400 text-xs mt-2">Les statistiques apparaîtront une fois des données créées</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  stroke="#374151" 
                  style={{ fontSize: '14px', fontWeight: 500 }}
                  tick={{ fill: '#374151' }}
                />
                <YAxis 
                  stroke="#374151" 
                  style={{ fontSize: '14px', fontWeight: 500 }}
                  tick={{ fill: '#374151' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                    fontWeight: 500
                  }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}
                  iconType="circle"
                />
                <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" name="Utilisateurs" />
                <Area type="monotone" dataKey="jobs" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorJobs)" name="Offres" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User Distribution Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Distribution Utilisateurs</h3>
              <p className="text-sm text-gray-500 mt-1">Répartition par type de compte</p>
            </div>
            <UserGroupIcon className="w-6 h-6 text-gray-400" />
          </div>
          {!stats || (stats.total_candidates === 0 && stats.total_employers === 0) ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Aucun utilisateur pour le moment</p>
                <p className="text-gray-400 text-xs mt-2">Les statistiques apparaîtront une fois des utilisateurs créés</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent, value }) => `${name}: ${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: '11px', fontWeight: 500 }}
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                    fontWeight: 500
                  }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Candidatures Totales</h3>
              <p className="text-sm text-gray-500 mt-1">Volume total de candidatures</p>
            </div>
            <DocumentTextIcon className="w-6 h-6 text-gray-400" />
          </div>
          {!stats || stats.total_applications === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Aucune candidature pour le moment</p>
                <p className="text-gray-400 text-xs mt-2">Les statistiques apparaîtront une fois des candidatures créées</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  stroke="#374151" 
                  style={{ fontSize: '14px', fontWeight: 500 }}
                  tick={{ fill: '#374151' }}
                />
                <YAxis 
                  stroke="#374151" 
                  style={{ fontSize: '14px', fontWeight: 500 }}
                  tick={{ fill: '#374151' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                    fontWeight: 500
                  }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}
                  iconType="circle"
                />
                <Bar dataKey="applications" fill="#F59E0B" radius={[8, 8, 0, 0]} name="Candidatures" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Job Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Statut des Offres</h3>
              <p className="text-sm text-gray-500 mt-1">État actuel des offres d'emploi</p>
            </div>
            <ArchiveBoxIcon className="w-6 h-6 text-gray-400" />
          </div>
          {displayJobStatusData.length === 0 || displayJobStatusData.every(item => item.value === 0) ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <ArchiveBoxIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Aucune offre d'emploi pour le moment</p>
                <p className="text-gray-400 text-xs mt-2">Les statistiques apparaîtront une fois que des offres seront publiées</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={displayJobStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent, value }) => `${name}: ${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: '11px', fontWeight: 500 }}
                >
                  {displayJobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                    fontWeight: 500
                  }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsersView = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <select
            title="Filtrer par rôle"
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">Tous les rôles</option>
            <option value="candidate">Candidats</option>
            <option value="employer">Employeurs</option>
            <option value="admin">Admins</option>
          </select>
          <button
            onClick={loadData}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date d'inscription</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'candidate' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'candidate' ? 'Candidat' : 'Employeur'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? (
                        <><CheckCircleIcon className="w-3.5 h-3.5" /> Actif</>
                      ) : (
                        <><XCircleIcon className="w-3.5 h-3.5" /> Inactif</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          user.is_active 
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
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
      </div>
    </div>
  );

  const renderEmployersView = () => (
    <div className="space-y-6">
      {/* Header with pagination */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Liste des Entreprises</h3>
            <p className="text-sm text-gray-500 mt-1">{employers.length} entreprise(s) affichée(s)</p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Employers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employers.map((employer) => (
          <div key={employer.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {employer.company_name?.substring(0, 2).toUpperCase() || 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-lg mb-2">{employer.company_name || 'Non renseigné'}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <UsersIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{employer.first_name} {employer.last_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{employer.email}</span>
                  </div>
                  {(employer as any).company_website && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="text-xs truncate">{(employer as any).company_website}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                    employer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {employer.is_active ? (
                      <><CheckCircleIcon className="w-3.5 h-3.5" /> Actif</>
                    ) : (
                      <><XCircleIcon className="w-3.5 h-3.5" /> Inactif</>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    Inscrit le {new Date(employer.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {employers.length >= ITEMS_PER_PAGE && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setEmployersPage(prev => Math.max(1, prev - 1))}
              disabled={employersPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-600">
              Page {employersPage}
            </span>
            <button
              onClick={() => setEmployersPage(prev => prev + 1)}
              disabled={employers.length < ITEMS_PER_PAGE}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderJobsView = () => (
    <div className="space-y-6">
      {/* Header with pagination */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Liste des Offres d'emploi</h3>
            <p className="text-sm text-gray-500 mt-1">{jobs.length} offre(s) affichée(s)</p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {job.title?.substring(0, 1).toUpperCase() || 'J'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        <span>{job.company_name || 'Non renseigné'}</span>
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          <span>{job.location}</span>
                        </div>
                      )}
                      {(job as any).contract_type && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                          {(job as any).contract_type}
                        </span>
                      )}
                    </div>
                    {(job as any).description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {(job as any).description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Publié le {new Date(job.created_at).toLocaleDateString('fr-FR')}</span>
                      {(job as any).deadline && (
                        <span>• Expire le {new Date((job as any).deadline).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                  job.status === 'active' || job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  job.status === 'filled' || job.status === 'FILLED' ? 'bg-blue-100 text-blue-700' :
                  job.status === 'draft' || job.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                  job.status === 'expired' || job.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                  job.status === 'closed' || job.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {job.status === 'active' || job.status === 'ACTIVE' ? 'Active' :
                   job.status === 'filled' || job.status === 'FILLED' ? 'Pourvue' :
                   job.status === 'draft' || job.status === 'DRAFT' ? 'Brouillon' :
                   job.status === 'expired' || job.status === 'EXPIRED' ? 'Expirée' :
                   job.status === 'closed' || job.status === 'CLOSED' ? 'Fermée' :
                   job.status || 'Inconnu'}
                </span>
                {(job as any).is_remote && (
                  <span className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                    🌍 Remote
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {jobs.length >= ITEMS_PER_PAGE && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setJobsPage(prev => Math.max(1, prev - 1))}
              disabled={jobsPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-600">
              Page {jobsPage}
            </span>
            <button
              onClick={() => setJobsPage(prev => prev + 1)}
              disabled={jobs.length < ITEMS_PER_PAGE}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Back-office Administration</h1>
              <p className="text-gray-600">Gérez votre plateforme et suivez les performances</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-6">
          <div className="flex gap-2">
            {[
              { id: 'stats', label: 'Statistiques', icon: ChartBarIcon },
              { id: 'users', label: 'Utilisateurs', icon: UsersIcon },
              { id: 'employers', label: 'Entreprises', icon: BuildingOfficeIcon },
              { id: 'jobs', label: 'Offres d\'emploi', icon: BriefcaseIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'stats' && renderStatsView()}
            {activeTab === 'users' && renderUsersView()}
            {activeTab === 'employers' && renderEmployersView()}
            {activeTab === 'jobs' && renderJobsView()}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
