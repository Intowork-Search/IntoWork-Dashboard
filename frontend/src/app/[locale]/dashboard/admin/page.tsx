"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI, type AdminStats } from '@/lib/api';
import { logger } from '@/lib/logger';
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
  ResponsiveContainer
} from 'recharts';
import {
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

// INTOWORK Brand Colors
const BRAND_COLORS = {
  primary: '#6B9B5F',    // Green
  secondary: '#6B46C1',  // Violet
  accent: '#F7C700',     // Gold
  blue: '#3B82F6',       // Blue
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const t = useTranslations('admin');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [status, session, router]);

  const loadStats = async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const statsData = await adminAPI.getStats(session.accessToken);
      setStats(statsData);
    } catch (error) {
      logger.error("Erreur chargement statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      loadStats();
    }
  }, [session?.accessToken]);

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout title={t('dashboardTitle')} subtitle={t('loadingSubtitle')}>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Helper function to get job status value (handles case insensitivity)
  const getJobStatusValue = (status: string): number => {
    if (!stats?.jobs_by_status) return 0;
    const jobsByStatus = stats.jobs_by_status;
    // Try all possible case variations
    const statusLower = status.toLowerCase();
    const statusUpper = status.toUpperCase();
    const statusCapital = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    return (jobsByStatus as any)[status] || 
           (jobsByStatus as any)[statusLower] || 
           (jobsByStatus as any)[statusUpper] || 
           (jobsByStatus as any)[statusCapital] || 0;
  };

  // Map des statuts réels de la BD: draft, published, closed, archived
  const activeJobs = getJobStatusValue('published');

  // Chart data
  const userDistribution = [
    { name: t('candidates'), value: stats?.total_candidates || 0, fill: BRAND_COLORS.blue },
    { name: t('employers'), value: stats?.total_employers || 0, fill: BRAND_COLORS.primary },
    { name: t('active'), value: stats?.active_users || 0, fill: BRAND_COLORS.accent },
  ].filter(item => item.value > 0);

  // Utiliser les vrais statuts de la BD: draft, published, closed, archived
  let jobStatusData = [
    { name: t('published'), value: getJobStatusValue('published'), fill: BRAND_COLORS.primary },
    { name: t('drafts'), value: getJobStatusValue('draft'), fill: BRAND_COLORS.accent },
    { name: t('closed'), value: getJobStatusValue('closed'), fill: '#EF4444' },
    { name: t('archived'), value: getJobStatusValue('archived'), fill: '#6B7280' },
  ].filter(item => item.value > 0);

  // If no data, use total_jobs as fallback
  if (jobStatusData.length === 0 && stats?.total_jobs && stats.total_jobs > 0) {
    jobStatusData = [
      { name: t('total'), value: stats.total_jobs, fill: BRAND_COLORS.primary }
    ];
  }

  const monthlyData = [
    {
      name: t('users'),
      value: stats?.total_users || 0,
      fill: BRAND_COLORS.secondary
    },
    {
      name: t('jobs'),
      value: stats?.total_jobs || 0,
      fill: BRAND_COLORS.primary
    },
    {
      name: t('applicationsTitle'),
      value: stats?.total_applications || 0,
      fill: BRAND_COLORS.blue
    }
  ];

  const hasUserData = userDistribution.some(item => item.value > 0);
  const hasJobStatusData = jobStatusData.some(item => item.value > 0);
  const hasMonthlyData = monthlyData.some(item => item.value > 0);

  const statCards = [
    {
      title: t('users'),
      value: stats?.total_users || 0,
      icon: UsersIcon,
      color: 'from-[#6B46C1] to-[#5a3aaa]',
      bgColor: 'bg-[#6B46C1]/10',
      textColor: 'text-[#6B46C1]',
      trend: '+12%',
      trendUp: true
    },
    {
      title: t('jobsTitle'),
      value: stats?.total_jobs || 0,
      icon: BriefcaseIcon,
      color: 'from-[#6B9B5F] to-[#5a8a4f]',
      bgColor: 'bg-[#6B9B5F]/10',
      textColor: 'text-[#6B9B5F]',
      subtitle: t('publishedCount', { count: activeJobs }),
      trend: '+8%',
      trendUp: true
    },
    {
      title: t('enterprisesTitle'),
      value: stats?.total_employers || 0,
      icon: BuildingOfficeIcon,
      color: 'from-[#F7C700] to-[#e0b400]',
      bgColor: 'bg-[#F7C700]/10',
      textColor: 'text-[#b39200]',
      trend: '+5%',
      trendUp: true
    },
    {
      title: t('applicationsTitle'),
      value: stats?.total_applications || 0,
      icon: DocumentTextIcon,
      color: 'from-[#3B82F6] to-[#2563EB]',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      trend: '+23%',
      trendUp: true
    }
  ];

  return (
    <DashboardLayout 
      title={t('dashboardTitle')} 
      subtitle={t('dashboardSubtitle')}
    >
      <div className="space-y-6">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <div 
              key={card.title}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                {card.trend && (
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold ${
                    card.trendUp 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {card.trendUp ? (
                      <ArrowTrendingUpIcon className="w-4 h-4" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4" />
                    )}
                    {card.trend}
                  </div>
                )}
              </div>
              
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{card.value.toLocaleString()}</p>
              {card.subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.subtitle}</p>
              )}
            </div>
          ))}
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Candidats */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#5a3aaa] shadow-lg">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{t('candidates')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('candidatesDesc')}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{t('totalCandidates')}</span>
                <span className="text-2xl font-bold text-[#6B46C1]">{stats?.total_candidates || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{t('applicationsSent')}</span>
                <span className="text-2xl font-bold text-[#6B46C1]">{stats?.total_applications || 0}</span>
              </div>
            </div>
          </div>

          {/* Employeurs */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#F7C700] to-[#e0b400] shadow-lg">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{t('employers')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('employersDesc')}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{t('totalCompanies')}</span>
                <span className="text-2xl font-bold text-[#b39200]">{stats?.total_employers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{t('publishedJobs')}</span>
                <span className="text-2xl font-bold text-[#b39200]">{stats?.total_jobs || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution des utilisateurs (Pie Chart) */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#5a3aaa] shadow-lg">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{t('usersDistribution')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('byAccountType')}</p>
              </div>
            </div>
            
            {!hasUserData ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{t('noData')}</p>
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
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    dataKey="value"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-user-${entry.name}-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1F2937'
                    }}
                    labelStyle={{ color: '#1F2937', fontWeight: 600 }}
                    itemStyle={{ color: '#1F2937', fontWeight: 600 }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }} 
                    iconType="circle" 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Statut des offres (Pie Chart) */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#6B9B5F] to-[#5a8a4f] shadow-lg">
                <BriefcaseIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{t('jobStatus')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('byStatus')}</p>
              </div>
            </div>
            
            {!hasJobStatusData ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{t('noData')}</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={jobStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    dataKey="value"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    {jobStatusData.map((entry, index) => (
                      <Cell key={`cell-job-${entry.name}-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1F2937'
                    }}
                    labelStyle={{ color: '#1F2937', fontWeight: 600 }}
                    itemStyle={{ color: '#1F2937', fontWeight: 600 }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }} 
                    iconType="circle" 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Graphique à barres - Vue d'ensemble */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] shadow-lg">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">{t('overview')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('globalTotals')}</p>
            </div>
          </div>
          
          {!hasMonthlyData ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('noData')}</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  stroke="#1F2937" 
                  style={{ fontSize: '14px', fontWeight: 600, fill: '#1F2937' }} 
                  tick={{ fill: '#1F2937' }} 
                />
                <YAxis 
                  stroke="#1F2937" 
                  style={{ fontSize: '14px', fontWeight: 600, fill: '#1F2937' }} 
                  tick={{ fill: '#1F2937' }} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1F2937'
                  }}
                  labelStyle={{ color: '#1F2937', fontWeight: 600, fontSize: '14px' }}
                  itemStyle={{ color: '#1F2937', fontWeight: 600, fontSize: '14px' }}
                  cursor={{ fill: 'rgba(107, 155, 95, 0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-bar-${entry.name}-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
