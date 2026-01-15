"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI } from '@/lib/api';
import {
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface AdminStats {
  total_users: number;
  total_candidates: number;
  total_employers: number;
  total_jobs: number;
  total_applications: number;
  active_jobs: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_candidates: 0,
    total_employers: 0,
    total_jobs: 0,
    total_applications: 0,
    active_jobs: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const loadStats = async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const statsData = await adminAPI.getStats(session.accessToken);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
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
      <DashboardLayout title="Dashboard Admin" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats.total_users,
      icon: UsersIcon,
      color: 'from-[#6B46C1] to-[#5a3aaa]',
      bgColor: 'bg-[#6B46C1]/10',
      textColor: 'text-[#6B46C1]',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Offres d\'emploi',
      value: stats.total_jobs,
      icon: BriefcaseIcon,
      color: 'from-[#6B9B5F] to-[#5a8a4f]',
      bgColor: 'bg-[#6B9B5F]/10',
      textColor: 'text-[#6B9B5F]',
      subtitle: `${stats.active_jobs} actives`,
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Entreprises',
      value: stats.total_employers,
      icon: BuildingOfficeIcon,
      color: 'from-[#F7C700] to-[#e0b400]',
      bgColor: 'bg-[#F7C700]/10',
      textColor: 'text-[#b39200]',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Candidatures',
      value: stats.total_applications,
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
      title="Dashboard Administrateur" 
      subtitle="Vue d'ensemble des statistiques de la plateforme"
    >
      <div className="space-y-6">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div 
              key={index}
              className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-300"
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
              
              <h3 className="text-gray-600 text-sm font-medium mb-2">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{card.value.toLocaleString()}</p>
              {card.subtitle && (
                <p className="text-sm text-gray-500 font-medium">{card.subtitle}</p>
              )}
            </div>
          ))}
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Candidats */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#5a3aaa] shadow-lg">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Candidats</h3>
                <p className="text-gray-600 text-sm">Utilisateurs cherchant un emploi</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-700 font-medium">Total candidats</span>
                <span className="text-2xl font-bold text-[#6B46C1]">{stats.total_candidates}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-700 font-medium">Candidatures envoyées</span>
                <span className="text-2xl font-bold text-[#6B46C1]">{stats.total_applications}</span>
              </div>
            </div>
          </div>

          {/* Employeurs */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#F7C700] to-[#e0b400] shadow-lg">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Employeurs</h3>
                <p className="text-gray-600 text-sm">Entreprises publiant des offres</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-700 font-medium">Total entreprises</span>
                <span className="text-2xl font-bold text-[#b39200]">{stats.total_employers}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-700 font-medium">Offres publiées</span>
                <span className="text-2xl font-bold text-[#b39200]">{stats.total_jobs}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
