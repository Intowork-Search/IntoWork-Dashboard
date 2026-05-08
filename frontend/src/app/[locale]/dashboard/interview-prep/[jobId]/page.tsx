'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useNextAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { aiScoringAPI, type InterviewPrepResponse, type InterviewQuestion } from '@/lib/api/ai-scoring';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  SparklesIcon,
  ArrowPathIcon,
  LightBulbIcon,
  CodeBracketIcon,
  UserIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// ── Config catégories ─────────────────────────────────────────────────────────

const CATEGORIES = {
  technical: {
    label: 'Questions techniques',
    color: 'bg-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    icon: CodeBracketIcon,
  },
  behavioral: {
    label: 'Questions comportementales',
    color: 'bg-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-700',
    text: 'text-purple-700 dark:text-purple-300',
    icon: UserIcon,
  },
  motivation: {
    label: 'Motivation & adéquation',
    color: 'bg-[#6B9B5F]',
    bg: 'bg-[#6B9B5F]/10 dark:bg-[#6B9B5F]/20',
    border: 'border-[#6B9B5F]/30',
    text: 'text-[#6B9B5F]',
    icon: HeartIcon,
  },
  company: {
    label: 'Questions à poser',
    color: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-700',
    text: 'text-amber-700 dark:text-amber-300',
    icon: QuestionMarkCircleIcon,
  },
} as const;

// ── Question card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  category,
}: {
  question: InterviewQuestion;
  index: number;
  category: keyof typeof CATEGORIES;
}) {
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState(false);
  const cfg = CATEGORIES[category];

  return (
    <div
      className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-all duration-200 ${checked ? 'opacity-60' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Numéro + check */}
          <button
            onClick={() => setChecked(!checked)}
            className="shrink-0 mt-0.5"
            title={checked ? 'Marquer comme non préparé' : 'Marquer comme préparé'}
          >
            {checked ? (
              <CheckCircleIcon className="w-6 h-6 text-[#6B9B5F]" />
            ) : (
              <span className={`w-6 h-6 rounded-full border-2 ${cfg.border} flex items-center justify-center text-xs font-bold ${cfg.text}`}>
                {index + 1}
              </span>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className={`font-medium text-gray-900 dark:text-white text-sm leading-relaxed ${checked ? 'line-through text-gray-400' : ''}`}>
              {question.question}
            </p>

            {/* Bouton conseil */}
            {question.tip && (
              <button
                onClick={() => setExpanded(!expanded)}
                className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${cfg.text} hover:opacity-80 transition-opacity`}
              >
                <LightBulbIcon className="w-3.5 h-3.5" />
                <span>{expanded ? 'Masquer le conseil' : 'Voir le conseil'}</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Conseil dépliable */}
        {expanded && question.tip && (
          <div className={`mt-3 ml-9 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 border ${cfg.border} text-xs text-gray-700 dark:text-gray-300 leading-relaxed`}>
            <span className="font-semibold">💡 Conseil : </span>
            {question.tip}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────

const CACHE_PREFIX = 'interviewPrep_';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

export default function InterviewPrepPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const jobId = Number(params.jobId);

  const [data, setData] = useState<InterviewPrepResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Restaurer depuis cache
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${CACHE_PREFIX}${jobId}`);
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (Date.now() - cached.savedAt > CACHE_TTL_MS) {
        localStorage.removeItem(`${CACHE_PREFIX}${jobId}`);
        return;
      }
      setData(cached.data);
    } catch {
      localStorage.removeItem(`${CACHE_PREFIX}${jobId}`);
    }
  }, [jobId]);

  const generate = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const result = await aiScoringAPI.generateInterviewPrep(token, jobId);
      setData(result);
      // Mettre en cache
      try {
        localStorage.setItem(
          `${CACHE_PREFIX}${jobId}`,
          JSON.stringify({ data: result, savedAt: Date.now() })
        );
      } catch { /* quota dépassé */ }
    } catch (err: unknown) {
      logger.error('Erreur préparation entretien:', err);
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  // Grouper par catégorie
  const grouped = data
    ? (Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((cat) => ({
        category: cat,
        questions: data.questions.filter((q) => q.category === cat),
      })).filter((g) => g.questions.length > 0)
    : [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#6B9B5F] mb-6 transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Retour</span>
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
          <div className="h-2 bg-[#6B9B5F]" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#6B9B5F] flex items-center justify-center shadow-lg shrink-0">
                  <SparklesIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Préparation entretien
                  </h1>
                  {data ? (
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                      <span className="font-medium text-[#6B9B5F]">{data.job_title}</span>
                      {' · '}
                      {data.company_name}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
                      L&apos;IA génère des questions personnalisées selon votre profil et l&apos;offre visée
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={generate}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#6B9B5F] hover:bg-[#5a8a4e] text-white shadow-lg shadow-[#6B9B5F]/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    <span>{data ? 'Régénérer' : 'Générer les questions'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* État vide */}
        {!data && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#6B9B5F]/15 flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-[#6B9B5F]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Préparez votre entretien
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              L&apos;IA analyse votre profil et l&apos;offre pour générer 12 questions personnalisées avec des conseils pratiques.
            </p>
            <button
              onClick={generate}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[#6B9B5F] hover:bg-[#5a8a4e] text-white shadow-lg shadow-[#6B9B5F]/30 transition-all"
            >
              <SparklesIcon className="w-5 h-5" />
              Générer les questions
            </button>
          </div>
        )}

        {/* Squelette loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-40" />
                </div>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-start gap-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Contenu généré */}
        {data && !loading && (
          <div className="space-y-6">
            {/* Conseils généraux */}
            {data.general_advice.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-700 p-6">
                <h2 className="text-base font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                  <LightBulbIcon className="w-5 h-5" />
                  Conseils pour cet entretien
                </h2>
                <ul className="space-y-2">
                  {data.general_advice.map((advice, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                      <span className="text-amber-500 shrink-0 mt-0.5">✦</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Questions par catégorie */}
            {grouped.map(({ category, questions }) => {
              const cfg = CATEGORIES[category];
              const IconComponent = cfg.icon;
              return (
                <div key={category} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                  {/* Header catégorie */}
                  <div className={`p-4 sm:p-5 ${cfg.color} flex items-center gap-3`}>
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-sm">{cfg.label}</h2>
                      <p className="text-white/70 text-xs">{questions.length} question{questions.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="p-4 space-y-3">
                    {questions.map((q, i) => (
                      <QuestionCard
                        key={i}
                        question={q}
                        index={i}
                        category={category}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Footer info */}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-4">
              Généré le {new Date(data.generated_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })} · Cliquez sur le numéro pour cocher les questions préparées
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
