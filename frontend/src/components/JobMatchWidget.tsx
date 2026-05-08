'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useNextAuth';
import { aiScoringAPI, type JobMatchResult } from '@/lib/api/ai-scoring';
import {
  SparklesIcon,
  ArrowRightIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return { bar: 'bg-green-500', text: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
  if (score >= 60) return { bar: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
  if (score >= 40) return { bar: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
  return { bar: 'bg-red-500', text: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
}

function formatSalary(min?: number, max?: number, currency = 'XAF') {
  if (!min && !max) return null;
  const fmt = (v: number) =>
    new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 0 }).format(v);
  if (min && max) return `${fmt(min)} – ${fmt(max)} ${currency}`;
  if (min) return `À partir de ${fmt(min)} ${currency}`;
  return `Jusqu'à ${fmt(max!)} ${currency}`;
}

function jobTypeLabel(type?: string) {
  const labels: Record<string, string> = {
    full_time: 'CDI',
    part_time: 'Temps partiel',
    contract: 'CDD',
    temporary: 'Intérim',
    internship: 'Stage',
  };
  return type ? (labels[type] ?? type) : null;
}

// ── Match card ────────────────────────────────────────────────────────────────

function MatchCard({ match, locale }: { match: JobMatchResult; locale: string }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const colors = scoreColor(match.match_score);
  const salary = formatSalary(match.salary_min, match.salary_max, match.currency);
  const typeLabel = jobTypeLabel(match.job_type);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug truncate">
              {match.job_title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <BuildingOfficeIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{match.company_name}</span>
            </div>
            {match.location && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPinIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{match.location}</span>
              </div>
            )}
          </div>

          {/* Score badge */}
          <div className={`shrink-0 flex flex-col items-center px-2.5 py-1.5 rounded-lg ${colors.bg}`}>
            <div className="flex items-center gap-0.5">
              <StarIcon className={`w-3.5 h-3.5 ${colors.text}`} />
              <span className={`text-sm font-bold ${colors.text}`}>{match.match_score.toFixed(0)}</span>
            </div>
            <span className={`text-xs ${colors.text} opacity-70`}>match</span>
          </div>
        </div>

        {/* Barre de score */}
        <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${colors.bar}`}
            style={{ width: `${match.match_score}%` }}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {typeLabel && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
              {typeLabel}
            </span>
          )}
          {salary && (
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
              {salary}
            </span>
          )}
        </div>
      </div>

      {/* Raisons (dépliable) */}
      {match.match_reasons.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span>{expanded ? 'Masquer les détails' : 'Voir pourquoi ce match'}</span>
            <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {expanded && (
            <div className="px-4 pb-3 space-y-1">
              {match.match_reasons.map((reason, i) => (
                <p key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5">
                  <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                  <span>{reason}</span>
                </p>
              ))}
              {match.missing_skills.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">À améliorer :</p>
                  {match.missing_skills.map((skill, i) => (
                    <p key={i} className="text-xs text-orange-600 dark:text-orange-400 flex items-start gap-1.5">
                      <span className="shrink-0 mt-0.5">⚠</span>
                      <span>{skill}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={() => router.push(`/${locale}/dashboard/jobs/${match.job_id}`)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#6B9B5F] text-white rounded-lg text-sm font-medium hover:bg-[#5a8a4e] transition-colors"
        >
          <span>Voir l&apos;offre</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Widget principal ─────────────────────────────────────────────────────────

interface JobMatchWidgetProps {
  locale: string;
}

export default function JobMatchWidget({ locale }: JobMatchWidgetProps) {
  const { getToken } = useAuth();
  const [matches, setMatches] = useState<JobMatchResult[]>([]);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await aiScoringAPI.getCandidateJobMatches(token, 5);
      setMatches(data.matches);
      setTotalAnalyzed(data.total_jobs_analyzed);
      setGeneratedAt(new Date(data.generated_at));
      setLoaded(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du matching';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-700 overflow-hidden"
      style={{ animation: 'fadeIn 0.6s ease-out 0.7s both' }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Offres pour vous</h2>
              {generatedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {totalAnalyzed} offres analysées · {generatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={loadMatches}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loaded ? 'Actualiser' : 'Analyser'}</span>
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {!loaded && !loading && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4">
              <BriefcaseIcon className="w-7 h-7 text-purple-500" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">Matching IA personnalisé</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 max-w-[220px]">
              Cliquez sur &quot;Analyser&quot; pour découvrir les offres les plus adaptées à votre profil
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4 animate-pulse">
              <SparklesIcon className="w-7 h-7 text-purple-500" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">Analyse en cours…</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">L'IA analyse votre profil et les offres disponibles</p>
          </div>
        )}

        {loaded && !loading && matches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BriefcaseIcon className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune offre disponible pour le moment</p>
          </div>
        )}

        {loaded && !loading && matches.length > 0 && (
          <div className="space-y-3">
            {matches.map((match) => (
              <MatchCard key={match.job_id} match={match} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
