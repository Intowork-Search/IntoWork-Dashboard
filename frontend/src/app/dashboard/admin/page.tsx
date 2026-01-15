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
  EnvelopeIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// INTOWORK Brand Colors
const BRAND_COLORS = {
  primary: '#6B9B5F',    // Green
  secondary: '#6B46C1',  // Violet
  accent: '#F7C700',     // Gold
  blue: '#3B82F6',       // Blue
};

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

  const loadData = useCallback(async () => {
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      console.error('Error loading admin data:', error);
      toast.error(err.response?.data?.detail || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, activeTab, userSearch, userRoleFilter, employersPage, jobsPage]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/sign-in');
      return;
    }

    if (session.user?.role !== 'admin') {
      toast.error('Accès refusé : Vous devez être administrateur');
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [session, status, router, activeTab, loadData]);

  useEffect(() => {
    if (session && (activeTab === 'employers' || activeTab === 'jobs')) {
      loadData();
    }
  }, [employersPage, jobsPage, session, activeTab, loadData]);

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    if (!session?.accessToken) return;

    try {
      const newStatus = !currentStatus;
      await adminAPI.toggleUserActivation(session.accessToken, userId, newStatus);
      toast.success(`Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Erreur lors de la modification');
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  // Chart data
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
    { name: 'Candidats', value: stats?.total_candidates || 0, color: BRAND_COLORS.blue },
    { name: 'Employeurs', value: stats?.total_employers || 0, color: BRAND_COLORS.primary },
    { name: 'Actifs', value: stats?.active_users || 0, color: BRAND_COLORS.accent },
  ];

  const jobStatusData = [
    { name: 'Actives', value: (stats?.jobs_by_status?.active || stats?.jobs_by_status?.ACTIVE || 0), color: BRAND_COLORS.primary },
    { name: 'Pourvues', value: (stats?.jobs_by_status?.filled || stats?.jobs_by_status?.FILLED || 0), color: BRAND_COLORS.blue },
    { name: 'Expirées', value: (stats?.jobs_by_status?.expired || stats?.jobs_by_status?.EXPIRED || stats?.jobs_by_status?.closed || stats?.jobs_by_status?.CLOSED || 0), color: '#EF4444' },
    { name: 'Brouillons', value: (stats?.jobs_by_status?.draft || stats?.jobs_by_status?.DRAFT || 0), color: BRAND_COLORS.accent },
  ];

  const hasJobStatusData = jobStatusData.some(item => item.value > 0);
  const rawJobStatusData = stats?.jobs_by_status ? Object.entries(stats.jobs_by_status).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
    value: value as number,
    color: name === 'active' || name === 'ACTIVE' ? BRAND_COLORS.primary :
           name === 'filled' || name === 'FILLED' ? BRAND_COLORS.blue :
           name === 'expired' || name === 'EXPIRED' || name === 'closed' || name === 'CLOSED' ? '#EF4444' :
           BRAND_COLORS.accent
  })) : [];

  const displayJobStatusData = hasJobStatusData ? jobStatusData : rawJobStatusData;

  // Stats cards with INTOWORK colors
  const statsCards = [
    {
      title: 'Utilisateurs Totaux',
      value: stats?.total_users || 0,
      change: '+12.5%',
      trend: 'up',
      icon: UsersIcon,
      bgGradient: 'from-[#6B9B5F] to-[#5a8a4f]',
      shadowColor: 'shadow-[#6B9B5F]/20'
    },
    {
      title: 'Offres d\'emploi',
      value: stats?.total_jobs || 0,
      change: '+8.2%',
      trend: 'up',
      icon: BriefcaseIcon,
      bgGradient: 'from-[#6B46C1] to-[#5a3aaa]',
      shadowColor: 'shadow-[#6B46C1]/20'
    },
    {
      title: 'Entreprises',
      value: stats?.total_employers || 0,
      change: '+5.7%',
      trend: 'up',
      icon: BuildingOfficeIcon,
      bgGradient: 'from-[#F7C700] to-[#e0b400]',
      shadowColor: 'shadow-[#F7C700]/20'
    },
    {
      title: 'Candidatures',
      value: stats?.total_applications || 0,
      change: '+18.3%',
      trend: 'up',
      icon: DocumentTextIcon,
      bgGradient: 'from-[#3B82F6] to-[#2563eb]',
      shadowColor: 'shadow-[#3B82F6]/20'
    },
  ];

  const renderStatsView = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.bgGradient} rounded-3xl p-6 shadow-xl ${card.shadowColor} hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80 mb-2">{card.title}</p>
                <h3 className="text-3xl font-bold text-white mb-2">{card.value.toLocaleString()}</h3>
                <div className="flex items-center gap-1">
                  {card.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-white/90" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-white/90" />
                  )}
                  <span className="text-sm font-medium text-white/90">{card.change}</span>
                  <span className="text-sm text-white/70">ce mois</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <card.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Statistiques Actuelles</h3>
              <p className="text-sm text-gray-500 mt-1">Vue d'ensemble des principaux indicateurs</p>
            </div>
            <div className="bg-[#6B9B5F]/10 p-3 rounded-2xl">
              <ChartBarIcon className="w-6 h-6 text-[#6B9B5F]" />
            </div>
          </div>
          {!stats || (stats.total_users === 0 && stats.total_jobs === 0 && stats.total_applications === 0) ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Aucune donnée disponible</p>
                <p className="text-gray-400 text-sm mt-2">Les statistiques apparaîtront une fois des données créées</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={BRAND_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_COLORS.secondary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={BRAND_COLORS.secondary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#374151" style={{ fontSize: '14px', fontWeight: 500 }} tick={{ fill: '#374151' }} />
                <YAxis stroke="#374151" style={{ fontSize: '14px', fontWeight: 500 }} tick={{ fill: '#374151' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 500 }} iconType="circle" />
                <Area type="monotone" dataKey="users" stroke={BRAND_COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" name="Utilisateurs" />
                <Area type="monotone" dataKey="jobs" stroke={BRAND_COLORS.secondary} strokeWidth={3} fillOpacity={1} fill="url(#colorJobs)" name="Offres" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User Distribution Pie Chart */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Distribution Utilisateurs</h3>
              <p className="text-sm text-gray-500 mt-1">Répartition par type de compte</p>
            </div>
            <div className="bg-[#6B46C1]/10 p-3 rounded-2xl">
              <UserGroupIcon className="w-6 h-6 text-[#6B46C1]" />
            </div>
          </div>
          {!stats || (stats.total_candidates === 0 && stats.total_employers === 0) ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Aucun utilisateur pour le moment</p>
                <p className="text-gray-400 text-sm mt-2">Les statistiques apparaîtront une fois des utilisateurs créés</p>
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
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 500 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Bar Chart */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Candidatures Totales</h3>
              <p className="text-sm text-gray-500 mt-1">Volume total de candidatures</p>
            </div>
            <div className="bg-[#F7C700]/10 p-3 rounded-2xl">
              <DocumentTextIcon className="w-6 h-6 text-[#F7C700]" />
            </div>
          </div>
          {!stats || stats.total_applications === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Aucune candidature pour le moment</p>
                <p className="text-gray-400 text-sm mt-2">Les statistiques apparaîtront une fois des candidatures créées</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#374151" style={{ fontSize: '14px', fontWeight: 500 }} tick={{ fill: '#374151' }} />
                <YAxis stroke="#374151" style={{ fontSize: '14px', fontWeight: 500 }} tick={{ fill: '#374151' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 500 }} iconType="circle" />
                <Bar dataKey="applications" fill={BRAND_COLORS.accent} radius={[12, 12, 0, 0]} name="Candidatures" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Job Status Pie Chart */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Statut des Offres</h3>
              <p className="text-sm text-gray-500 mt-1">État actuel des offres d'emploi</p>
            </div>
            <div className="bg-[#3B82F6]/10 p-3 rounded-2xl">
              <ArchiveBoxIcon className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
          {displayJobStatusData.length === 0 || displayJobStatusData.every(item => item.value === 0) ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ArchiveBoxIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Aucune offre d'emploi pour le moment</p>
                <p className="text-gray-400 text-sm mt-2">Les statistiques apparaîtront une fois que des offres seront publiées</p>
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
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 500 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsersView = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Filters */}
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
            onClick={loadData}
            className="px-6 py-3 bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white rounded-2xl hover:shadow-lg hover:shadow-[#6B9B5F]/30 transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Users Table */}
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
      </div>
    </div>
  );

  const renderEmployersView = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Liste des Entreprises</h3>
            <p className="text-sm text-gray-500 mt-1">{employers.length} entreprise(s) affichée(s)</p>
          </div>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-gradient-to-r from-[#6B46C1] to-[#5a3aaa] text-white rounded-2xl hover:shadow-lg hover:shadow-[#6B46C1]/30 transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Employers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employers.map((employer) => (
          <div key={employer.id} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#3B82F6] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-[#6B46C1]/20">
                {employer.company_name?.substring(0, 2).toUpperCase() || 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-lg mb-3">{employer.company_name || 'Non renseigné'}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <UsersIcon className="w-4 h-4 text-[#6B9B5F] flex-shrink-0" />
                    <span className="truncate">{employer.first_name} {employer.last_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 text-[#6B46C1] flex-shrink-0" />
                    <span className="truncate">{employer.email}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full ${
                    employer.is_active ? 'bg-[#6B9B5F]/10 text-[#6B9B5F]' : 'bg-red-100 text-red-700'
                  }`}>
                    {employer.is_active ? (
                      <><CheckCircleIcon className="w-4 h-4" /> Actif</>
                    ) : (
                      <><XCircleIcon className="w-4 h-4" /> Inactif</>
                    )}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(employer.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {employers.length >= ITEMS_PER_PAGE && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setEmployersPage(prev => Math.max(1, prev - 1))}
              disabled={employersPage === 1}
              className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Précédent
            </button>
            <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-4 py-2 rounded-xl">
              Page {employersPage}
            </span>
            <button
              onClick={() => setEmployersPage(prev => prev + 1)}
              disabled={employers.length < ITEMS_PER_PAGE}
              className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderJobsView = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Liste des Offres d'emploi</h3>
            <p className="text-sm text-gray-500 mt-1">{jobs.length} offre(s) affichée(s)</p>
          </div>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-gradient-to-r from-[#F7C700] to-[#e0b400] text-gray-900 rounded-2xl hover:shadow-lg hover:shadow-[#F7C700]/30 transition-all duration-300 flex items-center gap-2 font-bold"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B9B5F] to-[#5a8a4f] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-[#6B9B5F]/20">
                    {job.title?.substring(0, 1).toUpperCase() || 'J'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-lg mb-2">{job.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                        <BuildingOfficeIcon className="w-4 h-4 text-[#6B46C1]" />
                        <span className="font-medium">{job.company_name || 'Non renseigné'}</span>
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                          <span>📍</span>
                          <span className="font-medium">{job.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-medium">Publié le {new Date(job.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex px-4 py-1.5 text-xs font-bold rounded-full ${
                  job.status === 'active' || job.status === 'ACTIVE' ? 'bg-[#6B9B5F]/10 text-[#6B9B5F]' :
                  job.status === 'filled' || job.status === 'FILLED' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
                  job.status === 'draft' || job.status === 'DRAFT' ? 'bg-[#F7C700]/10 text-[#b39200]' :
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {jobs.length >= ITEMS_PER_PAGE && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setJobsPage(prev => Math.max(1, prev - 1))}
              disabled={jobsPage === 1}
              className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Précédent
            </button>
            <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-4 py-2 rounded-xl">
              Page {jobsPage}
            </span>
            <button
              onClick={() => setJobsPage(prev => prev + 1)}
              disabled={jobs.length < ITEMS_PER_PAGE}
              className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#6B46C1] via-[#5a3aaa] to-[#3B82F6] rounded-b-[3rem] px-6 py-10 mb-8">
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white"></div>
            <div className="absolute bottom-10 right-20 w-48 h-48 rounded-full bg-white"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-white"></div>
          </div>

          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium">
                Administration
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Back-office INTOWORK
            </h1>
            <p className="text-xl text-white/80 max-w-2xl">
              Gérez votre plateforme et suivez les performances en temps réel
            </p>
          </div>
        </div>

        <div className="px-6 pb-10">
          {/* Tabs */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-2 mb-8 border border-gray-100">
            <div className="flex gap-2">
              {[
                { id: 'stats', label: 'Statistiques', icon: ChartBarIcon, color: '#6B9B5F' },
                { id: 'users', label: 'Utilisateurs', icon: UsersIcon, color: '#3B82F6' },
                { id: 'employers', label: 'Entreprises', icon: BuildingOfficeIcon, color: '#6B46C1' },
                { id: 'jobs', label: 'Offres', icon: BriefcaseIcon, color: '#F7C700' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'stats' | 'users' | 'employers' | 'jobs')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#6B46C1] to-[#3B82F6] text-white shadow-lg shadow-[#6B46C1]/30'
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
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#6B46C1]/20 border-t-[#6B46C1] mx-auto"></div>
                  <Cog6ToothIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#6B46C1]" />
                </div>
                <p className="mt-4 text-gray-600 font-medium">Chargement des données...</p>
              </div>
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
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
}
