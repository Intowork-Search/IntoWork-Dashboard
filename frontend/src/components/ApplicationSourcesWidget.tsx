'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useNextAuth';
import { createAuthenticatedClient } from '@/lib/api';
import { logger } from '@/lib/logger';

interface SourceRow {
  source: string;
  label: string;
  count: number;
  pct: number;
  color: string;
}

interface SourcesResponse {
  sources: SourceRow[];
  total: number;
}

const SOURCE_ICONS: Record<string, string> = {
  whatsapp: '💬',
  email: '📧',
  linkedin: '💼',
  facebook: '👥',
  direct: '🔗',
};

export default function ApplicationSourcesWidget() {
  const { getToken } = useAuth();
  const [data, setData] = useState<SourcesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const client = createAuthenticatedClient(token);
      const res = await client.get<SourcesResponse>('/applications/employer/applications/sources');
      setData(res.data);
    } catch (err) {
      logger.error('ApplicationSourcesWidget error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-sm border border-base-200 p-5 animate-pulse">
        <div className="h-5 bg-base-200 rounded w-40 mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <div className="h-4 bg-base-200 rounded w-24" />
            <div className="flex-1 h-3 bg-base-200 rounded" />
            <div className="h-4 bg-base-200 rounded w-10" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.total === 0) return null;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base-content">Sources des candidatures</h3>
        <span className="text-sm text-base-content/50">{data.total} total</span>
      </div>

      <div className="space-y-3">
        {data.sources.map(row => (
          <div key={row.source} className="flex items-center gap-3">
            {/* Icône + label */}
            <div className="flex items-center gap-2 w-32 shrink-0">
              <span className="text-base">{SOURCE_ICONS[row.source] ?? '🔗'}</span>
              <span className="text-sm font-medium text-base-content/80 truncate">{row.label}</span>
            </div>

            {/* Barre de progression */}
            <div className="flex-1 h-2.5 bg-base-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${row.pct}%`, backgroundColor: row.color }}
              />
            </div>

            {/* Compteur + % */}
            <div className="flex items-center gap-1.5 shrink-0 text-right">
              <span className="text-sm font-semibold text-base-content">{row.count}</span>
              <span className="text-xs text-base-content/40">({row.pct}%)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Légende liens partageables */}
      <p className="text-xs text-base-content/40 mt-4 border-t border-base-200 pt-3">
        Partagez vos offres avec un lien tracé pour mesurer chaque canal →{' '}
        <span className="font-medium text-primary">Copier un lien de partage</span> depuis la page de l&apos;offre.
      </p>
    </div>
  );
}
