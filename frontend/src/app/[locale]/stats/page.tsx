'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { getApiUrl } from '@/lib/getApiUrl';
import { COUNTRIES } from '@/constants/geo';
import { logger } from '@/lib/logger';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

const API_URL = getApiUrl();

// Couleurs brand + palette harmonieuse
const BRAND_COLORS = ['#6B9B5F', '#4A7C59', '#8BC34A', '#A5C96A', '#C8E6C9', '#2E7D32', '#388E3C', '#43A047'];
const PIE_COLORS = ['#6B9B5F', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

interface MarketStatItem {
  label: string;
  count: number;
}

interface MarketStats {
  total_jobs: number;
  total_applications: number;
  total_companies: number;
  total_candidates: number;
  jobs_by_country: MarketStatItem[];
  jobs_by_type: MarketStatItem[];
  jobs_by_location_type: MarketStatItem[];
  top_industries: MarketStatItem[];
}

function getCountryLabel(code: string): string {
  return COUNTRIES.find(c => c.code === code)?.label ?? code;
}

export default function StatsPage() {
  const t = useTranslations('stats');
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/jobs/stats/market`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: MarketStats = await res.json();
      setStats(data);
    } catch (e) {
      logger.error('Stats fetch error', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // Normalize labels for charts
  const jobTypeLabels: Record<string, string> = {
    full_time: t('jobTypeFullTime'),
    part_time: t('jobTypePartTime'),
    contract: t('jobTypeContract'),
    internship: t('jobTypeInternship'),
    freelance: t('jobTypeFreelance'),
  };

  const locationTypeLabels: Record<string, string> = {
    on_site: t('locationOnSite'),
    remote: t('locationRemote'),
    hybrid: t('locationHybrid'),
  };

  const byType = stats?.jobs_by_type.map(item => ({
    name: jobTypeLabels[item.label] ?? item.label,
    value: item.count,
  })) ?? [];

  const byLocation = stats?.jobs_by_location_type.map(item => ({
    name: locationTypeLabels[item.label] ?? item.label,
    value: item.count,
  })) ?? [];

  const byCountry = stats?.jobs_by_country.map(item => ({
    name: getCountryLabel(item.label),
    value: item.count,
  })) ?? [];

  const topIndustries = stats?.top_industries.map(item => ({
    name: item.label,
    value: item.count,
  })) ?? [];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${jakarta.variable} font-[var(--font-jakarta)]`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Ligne top : logo + bouton retour */}
          <div className="flex items-center justify-between mb-5">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo-intowork.png"
                alt="IntoWork"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="font-extrabold text-xl text-[#6B9B5F] tracking-tight hidden sm:inline">INTOWORK</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour à l&apos;accueil
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#6B9B5F]/10 rounded-xl">
                  <ChartBarIcon className="w-6 h-6 text-[#6B9B5F]" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {t('title')}
                </h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('subtitle')}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/offres"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#6B9B5F] bg-[#6B9B5F]/10 hover:bg-[#6B9B5F]/20 transition-colors"
              >
                <BriefcaseIcon className="w-4 h-4" />
                {t('cta')}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#6B9B5F] hover:bg-[#5a8a4e] transition-colors shadow-sm"
              >
                {t('ctaPost')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="loading loading-spinner loading-lg text-[#6B9B5F]" />
            <p className="text-gray-500">{t('loading')}</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-red-500">{t('error')}</p>
            <button onClick={fetchStats} className="btn btn-outline btn-sm gap-2">
              <ArrowPathIcon className="w-4 h-4" />
              {t('retry')}
            </button>
          </div>
        )}

        {/* Content */}
        {stats && !loading && (
          <div className="space-y-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                icon={<BriefcaseIcon className="w-6 h-6" />}
                label={t('totalJobs')}
                value={stats.total_jobs}
                color="text-[#6B9B5F]"
                bg="bg-[#6B9B5F]/10"
              />
              <KpiCard
                icon={<DocumentTextIcon className="w-6 h-6" />}
                label={t('totalApplications')}
                value={stats.total_applications}
                color="text-blue-600"
                bg="bg-blue-50 dark:bg-blue-900/20"
              />
              <KpiCard
                icon={<BuildingOfficeIcon className="w-6 h-6" />}
                label={t('totalCompanies')}
                value={stats.total_companies}
                color="text-purple-600"
                bg="bg-purple-50 dark:bg-purple-900/20"
              />
              <KpiCard
                icon={<UserGroupIcon className="w-6 h-6" />}
                label={t('totalCandidates')}
                value={stats.total_candidates}
                color="text-amber-600"
                bg="bg-amber-50 dark:bg-amber-900/20"
              />
            </div>

            {/* Row 1 — Bar charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Offres par pays */}
              <ChartCard title={t('jobsByCountry')}>
                {byCountry.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={byCountry} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {byCountry.map((_, i) => (
                          <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Top industries */}
              <ChartCard title={t('topIndustries')}>
                {topIndustries.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={topIndustries}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                    >
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {topIndustries.map((_, i) => (
                          <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Row 2 — Pie charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Types de contrat */}
              <ChartCard title={t('jobsByType')}>
                {byType.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={byType}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {byType.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number | undefined) => [v ?? 0, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Mode de travail */}
              <ChartCard title={t('jobsByLocation')}>
                {byLocation.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={byLocation}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {byLocation.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number | undefined) => [v ?? 0, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-gray-400">{t('lastUpdated')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Sous-composants ----

function KpiCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[220px] flex items-center justify-center text-gray-300 dark:text-gray-600">
      <ChartBarIcon className="w-12 h-12" />
    </div>
  );
}
