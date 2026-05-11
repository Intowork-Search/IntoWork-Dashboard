'use client';

/**
 * Entonnoir de recrutement employeur
 * Affiché dans le dashboard pour les recruteurs
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useNextAuth';
import { getApiUrl } from '@/lib/getApiUrl';
import { logger } from '@/lib/logger';
import {
  FunnelIcon,
  BriefcaseIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface FunnelStep {
  status: string;
  label: string;
  count: number;
  pct: number;
}

interface ByJob {
  job_id: number;
  title: string;
  total: number;
}

interface FunnelData {
  funnel: FunnelStep[];
  by_job: ByJob[];
  conversion_rate: number;
  avg_days_to_interview: number | null;
}

const STEP_COLORS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-600',
  'bg-[#6B9B5F]',
];

export default function EmployerFunnel() {
  const { getToken } = useAuth();
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${getApiUrl()}/dashboard/employer-funnel`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setData(await res.json());
      } catch (e) {
        logger.error('EmployerFunnel fetch error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getToken]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
        <div className="space-y-3">
          {[80, 60, 45, 30, 20].map((w) => (
            <div key={w} className="flex items-center gap-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
              <div className={`h-6 bg-gray-200 dark:bg-gray-700 rounded`} style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.funnel.length === 0) return null;

  const maxCount = data.funnel[0]?.count || 1;

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Entonnoir principal */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <FunnelIcon className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Entonnoir de recrutement</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Toutes offres confondues</p>
          </div>
        </div>

        <div className="space-y-3">
          {data.funnel.map((step, i) => (
            <div key={step.status} className="flex items-center gap-3">
              <span className="w-28 text-sm text-gray-600 dark:text-gray-400 text-right shrink-0">
                {step.label}
              </span>
              <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${STEP_COLORS[i]} rounded-lg transition-all duration-700 flex items-center justify-end pr-2`}
                  style={{ width: `${Math.max((step.count / maxCount) * 100, step.count > 0 ? 4 : 0)}%` }}
                >
                  {step.count > 0 && (
                    <span className="text-xs font-bold text-white">{step.count}</span>
                  )}
                </div>
              </div>
              <span className="w-12 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                {step.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Métriques + top offres */}
      <div className="space-y-4">
        {/* KPIs */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-5 h-5 text-[#6B9B5F]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.conversion_rate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Taux de conversion</p>
              </div>
            </div>
            {data.avg_days_to_interview !== null && (
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.avg_days_to_interview}j</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Délai moyen avant entretien</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top offres */}
        {data.by_job.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BriefcaseIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top offres</span>
            </div>
            <div className="space-y-2">
              {data.by_job.map((job) => (
                <div key={job.job_id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[140px]" title={job.title}>
                    {job.title}
                  </span>
                  <span className="badge badge-sm bg-[#6B9B5F]/10 text-[#6B9B5F] border-0 font-semibold ml-2 shrink-0">
                    {job.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
