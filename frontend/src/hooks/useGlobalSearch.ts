'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { jobsAPI, applicationsAPI, type Job, type JobApplication } from '@/lib/api';
import { useAuth } from '@/hooks/useNextAuth';
import { useUser } from '@/hooks/useNextAuth';

export interface SearchResult {
  id: string;
  type: 'job' | 'application' | 'job_post';
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

interface UseGlobalSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  hasResults: boolean;
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      const searchResults: SearchResult[] = [];

      const role = user?.role;

      // Recherche dans les offres (candidat + employeur + admin)
      if (role === 'candidate' || role === 'admin') {
        const jobsData = await jobsAPI.getJobs(
          { search: q, limit: 5 },
          token ?? undefined
        );
        for (const job of jobsData.jobs) {
          searchResults.push({
            id: `job-${job.id}`,
            type: 'job',
            title: job.title,
            subtitle: job.company_name + (job.location ? ` — ${job.location}` : ''),
            href: `/dashboard/jobs/${job.id}`,
            badge: job.job_type,
            badgeColor: 'badge-success',
          });
        }
      }

      // Recherche dans mes offres (employeur)
      if (role === 'employer' && token) {
        const myJobsData = await jobsAPI.getMyJobs(token, { search: q, limit: 5 });
        for (const job of myJobsData.jobs) {
          searchResults.push({
            id: `job_post-${job.id}`,
            type: 'job_post',
            title: job.title,
            subtitle: `${job.applications_count} candidature${job.applications_count !== 1 ? 's' : ''}`,
            href: `/dashboard/job-posts`,
            badge: job.status,
            badgeColor: job.status === 'active' ? 'badge-success' : 'badge-ghost',
          });
        }
      }

      // Recherche dans les candidatures (candidat)
      if (role === 'candidate' && token) {
        const appsData = await applicationsAPI.getMyApplications(token, 1, 20);
        const filtered = appsData.applications.filter((app: JobApplication) =>
          app.job.title.toLowerCase().includes(q.toLowerCase()) ||
          app.job.company_name.toLowerCase().includes(q.toLowerCase())
        );
        for (const app of filtered.slice(0, 5)) {
          searchResults.push({
            id: `application-${app.id}`,
            type: 'application',
            title: app.job.title,
            subtitle: app.job.company_name,
            href: `/dashboard/applications`,
            badge: app.status,
            badgeColor: getStatusColor(app.status),
          });
        }
      }

      setResults(searchResults.slice(0, 10));
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, user?.role]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    hasResults: results.length > 0,
  };
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'accepted': return 'badge-success';
    case 'rejected': return 'badge-error';
    case 'interview': return 'badge-info';
    case 'shortlisted': return 'badge-warning';
    default: return 'badge-ghost';
  }
}
