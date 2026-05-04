'use client';

/**
 * Page de Scoring IA des Candidatures
 * 
 * Permet aux employeurs de:
 * - Voir les candidatures avec scores IA
 * - Scorer individuellement ou en masse
 * - Analyser les forces/faiblesses des candidats
 * - Trier par score pour identifier les meilleurs profils
 */

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useNextAuth';
import { aiScoringAPI, type ApplicationWithScore, type AIScoreDetails } from '@/lib/api/ai-scoring';
import {
  SparklesIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BoltIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/types/api';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Props {
  params: Promise<{
    jobId: string;
  }>;
}

export default function AIScoringPage({ params }: Props) {
  const resolvedParams = use(params);
  const jobId = parseInt(resolvedParams.jobId);
  const router = useRouter();
  const { getToken } = useAuth();

  const [applications, setApplications] = useState<ApplicationWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [bulkScoring, setBulkScoring] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortByScore, setSortByScore] = useState(true);
  const [expandedDetails, setExpandedDetails] = useState<number | null>(null);
  const [bulkConfirmLoading, setBulkConfirmLoading] = useState(false);
  const { confirm, isOpen: isConfirmOpen, options: confirmOptions, handleConfirm, handleCancel } = useConfirmModal();

  const limit = 20;

  // Charger les candidatures scorées
  useEffect(() => {
    loadApplications();
  }, [page, sortByScore]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error('Non authentifié');
        return;
      }

      const data = await aiScoringAPI.getScoredApplications(jobId, token, page, limit, sortByScore);
      setApplications(data.applications);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Erreur lors du chargement'));
    } finally {
      setLoading(false);
    }
  };

  // Scorer une candidature individuelle
  const handleScoreApplication = async (applicationId: number) => {
    try {
      setScoring(true);
      const token = await getToken();
      if (!token) {
        toast.error('Non authentifié');
        return;
      }

      toast.loading('Analyse IA en cours...', { id: 'scoring' });
      const result = await aiScoringAPI.scoreApplication(applicationId, token);
      
      toast.success(`Score: ${result.ai_score.toFixed(1)}/100`, { id: 'scoring' });
      
      // Recharger la liste
      loadApplications();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Erreur lors du scoring'), { id: 'scoring' });
    } finally {
      setScoring(false);
    }
  };

  // Scorer toutes les candidatures non scorées
  const handleBulkScore = async () => {
    const ok = await confirm({
      title: 'Analyser toutes les candidatures ?',
      message: 'L\'IA va analyser toutes les candidatures non scorées pour cette offre.',
      detail: 'Cette opération peut prendre quelques minutes.',
      confirmLabel: 'Lancer l\'analyse',
      variant: 'warning',
    });
    if (!ok) return;

    try {
      setBulkScoring(true);
      const token = await getToken();
      if (!token) {
        toast.error('Non authentifié');
        return;
      }

      toast.loading('Analyse IA en masse...', { id: 'bulk-scoring' });
      const result = await aiScoringAPI.scoreJobApplications(jobId, token);
      
      toast.success(`${result.scored_count} candidatures analysées !`, { id: 'bulk-scoring' });
      
      // Recharger la liste
      loadApplications();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Erreur lors du scoring en masse'), { id: 'bulk-scoring' });
    } finally {
      setBulkScoring(false);
    }
  };

  // Obtenir la couleur selon le score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Obtenir l'icône de recommandation
  const getRecommendationIcon = (recommendation: string) => {
    const lower = recommendation.toLowerCase();
    if (lower.includes('shortlist') || lower.includes('excellent')) return TrophyIcon;
    if (lower.includes('interview')) return CheckCircleIcon;
    if (lower.includes('review')) return ExclamationTriangleIcon;
    return XCircleIcon;
  };

  // Statistiques
  const stats = {
    scored: applications.filter(a => a.ai_score !== null && a.ai_score !== undefined).length,
    unscored: applications.filter(a => a.ai_score === null || a.ai_score === undefined).length,
    excellent: applications.filter(a => a.ai_score && a.ai_score >= 80).length,
    good: applications.filter(a => a.ai_score && a.ai_score >= 60 && a.ai_score < 80).length,
  };

  if (loading && applications.length === 0) {
    return (
      <DashboardLayout title="Scoring IA" subtitle="Analyse intelligente des candidatures">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Scoring IA" subtitle="Analyse intelligente des candidatures">
      <div className="space-y-6">
        {/* Header avec actions */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm">
                <SparklesIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scoring IA avec Claude</h2>
                <p className="text-gray-600 dark:text-gray-400">Analyse automatique de {total} candidature{total > 1 ? 's' : ''}</p>
              </div>
            </div>
            
            <button
              onClick={handleBulkScore}
              disabled={bulkScoring || scoring}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {bulkScoring ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <>
                  <BoltIcon className="w-5 h-5" />
                  <span>Tout analyser</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analysées</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scored}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unscored}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrophyIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Excellents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.excellent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bons profils</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.good}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tri */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trier par:</span>
          </div>
          <button
            onClick={() => setSortByScore(!sortByScore)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium">
              {sortByScore ? 'Score IA' : 'Date de candidature'}
            </span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Liste des candidatures */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-xl text-center border border-gray-200 dark:border-gray-600">
              <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucune candidature pour cette offre</p>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Infos candidat */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-green-100 p-3 rounded-full">
                        <UserGroupIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{app.candidate_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{app.candidate_email}</p>
                      </div>
                    </div>

                    {/* Score IA */}
                    {app.ai_score !== null && app.ai_score !== undefined ? (
                      <div className="mt-4">
                        <div className="flex items-center gap-4">
                          <div className={`px-4 py-2 rounded-lg border-2 ${getScoreColor(app.ai_score)}`}>
                            <div className="flex items-center gap-2">
                              <StarIcon className="w-5 h-5" />
                              <span className="text-2xl font-bold">{app.ai_score.toFixed(1)}</span>
                              <span className="text-sm">/100</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setExpandedDetails(expandedDetails === app.id ? null : app.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            {expandedDetails === app.id ? (
                              <>
                                <ChevronUpIcon className="w-4 h-4" />
                                <span>Masquer détails</span>
                              </>
                            ) : (
                              <>
                                <ChevronDownIcon className="w-4 h-4" />
                                <span>Voir détails</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Détails du scoring */}
                        {expandedDetails === app.id && app.ai_score_details && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4">
                            {/* Forces */}
                            <div>
                              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5" />
                                Points forts
                              </h4>
                              <ul className="space-y-1">
                                {app.ai_score_details.strengths.map((strength, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Faiblesses */}
                            <div>
                              <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-5 h-5" />
                                Points à améliorer
                              </h4>
                              <ul className="space-y-1">
                                {app.ai_score_details.weaknesses.map((weakness, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                    <span className="text-orange-500">⚠</span>
                                    <span>{weakness}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Compétences matchées */}
                            <div>
                              <h4 className="font-semibold text-blue-700 mb-2">
                                Compétences ({app.ai_score_details.skills_match.percentage}% match)
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {app.ai_score_details.skills_match.matched.map((skill, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Recommandation */}
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommandation IA</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{app.ai_score_details.recommendation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <button
                          onClick={() => handleScoreApplication(app.id)}
                          disabled={scoring}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50"
                        >
                          <SparklesIcon className="w-5 h-5" />
                          <span>Analyser avec IA</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    <p>Candidature:</p>
                    <p>{new Date(app.applied_at).toLocaleDateString('fr-FR')}</p>
                    {app.ai_analyzed_at && (
                      <>
                        <p className="mt-2">Analysé:</p>
                        <p>{new Date(app.ai_analyzed_at).toLocaleDateString('fr-FR')}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        options={confirmOptions}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={bulkConfirmLoading}
      />
    </DashboardLayout>
  );
}
