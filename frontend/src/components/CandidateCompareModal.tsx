'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  StarIcon as StarOutline,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import type { ApplicationWithScore } from '@/lib/api/ai-scoring';

interface CandidateCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: ApplicationWithScore[];
}

export default function CandidateCompareModal({
  isOpen,
  onClose,
  applications,
}: CandidateCompareModalProps) {
  const t = useTranslations('aiScoring');

  // Ferme sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || applications.length === 0) return null;

  const maxScore = Math.max(...applications.map(a => a.ai_score ?? 0));

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400';
    if (score >= 60) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400';
    if (score >= 40) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400';
  };

  const getScoreBar = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center pt-[4vh] px-4 pb-8"
      role="dialog"
      aria-modal="true"
      aria-label={t('compareTitle')}
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={onClose}
        tabIndex={-1}
        aria-label={t('compareClose')}
      />

      {/* Modal */}
      <div className="relative w-full max-w-7xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('compareTitle')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {applications.length} candidat{applications.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={t('compareClose')}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Grille de comparaison */}
        <div className="overflow-auto flex-1">
          <div
            className="grid min-w-0 gap-0 divide-x divide-gray-100 dark:divide-gray-700"
            style={{ gridTemplateColumns: `repeat(${applications.length}, minmax(280px, 1fr))` }}
          >
            {applications.map((app) => {
              const score = app.ai_score ?? 0;
              const details = app.ai_score_details;
              const isBest = score === maxScore && score > 0;

              return (
                <div key={app.id} className="flex flex-col p-5 gap-5">

                  {/* En-tête candidat */}
                  <div className="text-center">
                    <div className="relative inline-flex">
                      <div className="w-14 h-14 rounded-full bg-[#6B9B5F]/10 flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl font-bold text-[#6B9B5F]">
                          {app.candidate_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {isBest && (
                        <span className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5">
                          <TrophyIcon className="w-3.5 h-3.5 text-white" />
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                      {app.candidate_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px] mx-auto">
                      {app.candidate_email}
                    </p>
                    {isBest && (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                        <TrophyIcon className="w-3 h-3" />
                        {t('compareBest')}
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div className={`rounded-xl border-2 p-4 text-center ${getScoreBg(score)}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
                      {t('compareScoreLabel')}
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                      <StarIcon className="w-5 h-5" />
                      <span className="text-3xl font-black">{score.toFixed(1)}</span>
                      <span className="text-sm opacity-70">/100</span>
                    </div>
                    {/* Barre de progression */}
                    <div className="mt-3 h-2 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getScoreBar(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  {!details ? (
                    <div className="text-center text-sm text-gray-400 py-8">
                      <StarOutline className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      {t('compareNoDetails')}
                    </div>
                  ) : (
                    <>
                      {/* Skills match */}
                      <Section
                        label={`${t('compareSkillsMatch')} · ${details.skills_match.percentage}%`}
                        accent="blue"
                      >
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${details.skills_match.percentage}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {details.skills_match.matched.slice(0, 6).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {details.skills_match.matched.length > 6 && (
                            <span className="px-2 py-0.5 text-gray-400 text-xs">
                              +{details.skills_match.matched.length - 6}
                            </span>
                          )}
                        </div>
                        {details.skills_match.missing.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-400 mb-1">{t('compareSkillsMissing')}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {details.skills_match.missing.slice(0, 4).map((skill, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full text-xs line-through"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </Section>

                      {/* Forces */}
                      <Section label={t('compareStrengths')} accent="green">
                        <ul className="space-y-1.5">
                          {details.strengths.slice(0, 4).map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                              <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </Section>

                      {/* Faiblesses */}
                      <Section label={t('compareWeaknesses')} accent="amber">
                        <ul className="space-y-1.5">
                          {details.weaknesses.slice(0, 3).map((w, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                              <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </Section>

                      {/* Expérience */}
                      {details.experience_match && (
                        <Section label={t('compareExperience')} accent="purple">
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            {details.experience_match}
                          </p>
                        </Section>
                      )}

                      {/* Recommandation */}
                      <Section label={t('compareRecommendation')} accent="gray">
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
                          &ldquo;{details.recommendation}&rdquo;
                        </p>
                      </Section>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost"
          >
            {t('compareClose')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Sous-composant Section ----

const accentMap: Record<string, string> = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  amber: 'text-amber-600 dark:text-amber-400',
  purple: 'text-purple-600 dark:text-purple-400',
  gray: 'text-gray-500 dark:text-gray-400',
};

function Section({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${accentMap[accent] ?? 'text-gray-500'}`}>
        {label}
      </p>
      {children}
    </div>
  );
}
