'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  UserGroupIcon,
  SparklesIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, XCircleIcon as XCircleSolid } from '@heroicons/react/24/solid';
import type { ApplicationWithScore } from '@/lib/api/ai-scoring';
import QuickMessageModal, { type QuickActionType } from '@/components/QuickMessageModal';

// ── Colonnes ────────────────────────────────────────────────────────────────

interface Column {
  id: string;
  label: string;
  targetStatus: string;
  matchStatuses: string[];
  colorClass: string;
  headerClass: string;
  countClass: string;
}

const COLUMNS: Column[] = [
  {
    id: 'new',
    label: 'Nouvelles',
    targetStatus: 'applied',
    matchStatuses: ['applied', 'pending', 'viewed'],
    colorClass: 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800',
    headerClass: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    countClass: 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
  },
  {
    id: 'shortlisted',
    label: 'Présélectionnés',
    targetStatus: 'shortlisted',
    matchStatuses: ['shortlisted'],
    colorClass: 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-800',
    headerClass: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    countClass: 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200',
  },
  {
    id: 'interview',
    label: 'Entretien',
    targetStatus: 'interview',
    matchStatuses: ['interview'],
    colorClass: 'border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-800',
    headerClass: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    countClass: 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200',
  },
  {
    id: 'accepted',
    label: 'Acceptés',
    targetStatus: 'accepted',
    matchStatuses: ['accepted'],
    colorClass: 'border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800',
    headerClass: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    countClass: 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200',
  },
  {
    id: 'rejected',
    label: 'Refusés',
    targetStatus: 'rejected',
    matchStatuses: ['rejected'],
    colorClass: 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800',
    headerClass: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    countClass: 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200',
  },
];

// ── Card draggable ───────────────────────────────────────────────────────────

function KanbanCard({
  app,
  isDragging = false,
  onView,
  onQuickAction,
}: {
  app: ApplicationWithScore;
  isDragging?: boolean;
  onView: (app: ApplicationWithScore) => void;
  onQuickAction: (app: ApplicationWithScore, action: QuickActionType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: app.id });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-4 cursor-grab active:cursor-grabbing select-none transition-shadow ${
        isDragging
          ? 'opacity-50 border-gray-300'
          : 'border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-[#6B9B5F]/40'
      }`}
    >
      {/* Avatar + nom + bouton détail */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#6B9B5F]/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-[#6B9B5F]">
            {app.candidate_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {app.candidate_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.candidate_email}</p>
        </div>
        {/* Bouton voir détails — stopPropagation pour ne pas déclencher le drag */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onView(app); }}
          className="shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-[#6B9B5F] transition-colors cursor-pointer"
          title="Voir les détails"
          aria-label="Voir les détails du candidat"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Score IA */}
      {app.ai_score !== null && app.ai_score !== undefined ? (
        <div className="flex items-center gap-2">
          <StarSolid className="w-4 h-4 text-yellow-500 shrink-0" />
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                app.ai_score >= 80
                  ? 'bg-green-500'
                  : app.ai_score >= 60
                  ? 'bg-blue-500'
                  : app.ai_score >= 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${app.ai_score}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0">
            {app.ai_score.toFixed(0)}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Non scoré</span>
        </div>
      )}

      {/* Date */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        {new Date(app.applied_at).toLocaleDateString('fr-FR')}
      </p>

      {/* Boutons action rapide */}
      {app.status !== 'interview' && app.status !== 'rejected' && (
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {app.status !== 'interview' && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onQuickAction(app, 'interview'); }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#6B9B5F]/10 hover:bg-[#6B9B5F]/20 text-[#6B9B5F] text-xs font-medium transition-colors cursor-pointer"
              title="Inviter en entretien"
            >
              <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
              Inviter
            </button>
          )}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onQuickAction(app, 'rejected'); }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-500 text-xs font-medium transition-colors cursor-pointer"
            title="Refuser"
          >
            <XCircleSolid className="w-3.5 h-3.5" />
            Refuser
          </button>
        </div>
      )}
    </div>
  );
}

// ── Modal détails candidat ───────────────────────────────────────────────────

function KanbanDetailModal({
  app,
  onClose,
  onQuickAction,
}: {
  app: ApplicationWithScore;
  onClose: () => void;
  onQuickAction: (app: ApplicationWithScore, action: QuickActionType) => void;
}) {
  const score = app.ai_score;

  const scoreColor =
    score === null || score === undefined
      ? ''
      : score >= 80
      ? 'text-green-600 border-green-300 bg-green-50'
      : score >= 60
      ? 'text-blue-600 border-blue-300 bg-blue-50'
      : score >= 40
      ? 'text-yellow-600 border-yellow-300 bg-yellow-50'
      : 'text-red-600 border-red-300 bg-red-50';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6B9B5F]/20 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-[#6B9B5F]">
                {app.candidate_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{app.candidate_name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{app.candidate_email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date candidature */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CalendarIcon className="w-4 h-4" />
            <span>Candidature le {new Date(app.applied_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            {app.ai_analyzed_at && (
              <span className="ml-2 text-xs text-gray-400">• Analysé le {new Date(app.ai_analyzed_at).toLocaleDateString('fr-FR')}</span>
            )}
          </div>

          {/* Score IA */}
          {score !== null && score !== undefined ? (
            <>
              <div className="flex items-center gap-4">
                <div className={`px-5 py-3 rounded-xl border-2 ${scoreColor}`}>
                  <div className="flex items-center gap-2">
                    <StarSolid className="w-5 h-5" />
                    <span className="text-3xl font-bold">{score.toFixed(1)}</span>
                    <span className="text-sm font-medium">/100</span>
                  </div>
                  <p className="text-xs mt-0.5 opacity-70">Score IA</p>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </div>

              {app.ai_score_details && (
                <>
                  {/* Points forts */}
                  {app.ai_score_details.strengths.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400 mb-3">
                        <CheckCircleIcon className="w-5 h-5" />
                        Points forts
                      </h3>
                      <ul className="space-y-2">
                        {app.ai_score_details.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-green-500 font-bold mt-0.5">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Points à améliorer */}
                  {app.ai_score_details.weaknesses.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400 mb-3">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        Points à améliorer
                      </h3>
                      <ul className="space-y-2">
                        {app.ai_score_details.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-orange-500 mt-0.5">⚠</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Compétences */}
                  {app.ai_score_details.skills_match.matched.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">
                        Compétences matchées — {app.ai_score_details.skills_match.percentage}%
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {app.ai_score_details.skills_match.matched.map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommandation */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Recommandation IA</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {app.ai_score_details.recommendation}
                    </p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <SparklesIcon className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">Ce candidat n&apos;a pas encore été analysé par l&apos;IA</p>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {app.status !== 'interview' && (
            <button
              onClick={() => { onClose(); onQuickAction(app, 'interview'); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B9B5F]/10 hover:bg-[#6B9B5F]/20 text-[#6B9B5F] text-sm font-semibold transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Inviter en entretien
            </button>
          )}
          {app.status !== 'rejected' && (
            <button
              onClick={() => { onClose(); onQuickAction(app, 'rejected'); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 text-sm font-semibold transition-colors"
            >
              <XCircleSolid className="w-4 h-4" />
              Refuser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



function KanbanCardOverlay({ app }: { app: ApplicationWithScore }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-[#6B9B5F] p-4 shadow-2xl rotate-2 w-56">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-[#6B9B5F]/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-[#6B9B5F]">
            {app.candidate_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {app.candidate_name}
        </p>
      </div>
      {app.ai_score !== null && app.ai_score !== undefined && (
        <div className="flex items-center gap-1">
          <StarSolid className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-xs font-bold text-gray-700">{app.ai_score.toFixed(0)}/100</span>
        </div>
      )}
    </div>
  );
}

// ── Colonne droppable ────────────────────────────────────────────────────────

function DroppableColumn({
  column,
  cards,
  activeId,
  onView,
  onQuickAction,
}: {
  column: Column;
  cards: ApplicationWithScore[];
  activeId: number | null;
  onView: (app: ApplicationWithScore) => void;
  onQuickAction: (app: ApplicationWithScore, action: QuickActionType) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col min-w-[220px] w-56 shrink-0">
      {/* Header colonne */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl ${column.headerClass}`}>
        <span className="text-sm font-semibold">{column.label}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.countClass}`}>
          {cards.length}
        </span>
      </div>

      {/* Zone de drop */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[400px] p-2 rounded-b-xl border-2 border-t-0 space-y-2 transition-colors ${column.colorClass} ${
          isOver ? 'ring-2 ring-[#6B9B5F] ring-inset bg-[#6B9B5F]/10' : ''
        }`}
      >
        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-gray-400 dark:text-gray-600">
            <UserGroupIcon className="w-8 h-8 mb-1 opacity-40" />
            <p className="text-xs">Déposer ici</p>
          </div>
        )}
        {cards.map((app) => (
          <KanbanCard key={app.id} app={app} isDragging={activeId === app.id} onView={onView} onQuickAction={onQuickAction} />
        ))}
      </div>
    </div>
  );
}

// ── Kanban Board principal ───────────────────────────────────────────────────

interface KanbanBoardProps {
  applications: ApplicationWithScore[];
  onStatusChange: (applicationId: number, newStatus: string) => Promise<void>;
  onQuickMessage: (applicationId: number, status: string, subject: string, message: string) => Promise<void>;
  jobTitle?: string;
  companyName?: string;
}

export default function KanbanBoard({ applications, onStatusChange, onQuickMessage, jobTitle = '', companyName = '' }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [localApps, setLocalApps] = useState<ApplicationWithScore[]>(applications);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithScore | null>(null);
  const [quickAction, setQuickAction] = useState<{ app: ApplicationWithScore; action: QuickActionType } | null>(null);

  const handleQuickAction = (app: ApplicationWithScore, action: QuickActionType) => {
    setQuickAction({ app, action });
  };

  const handleQuickSend = async (status: string, subject: string, message: string) => {
    if (!quickAction) return;
    await onQuickMessage(quickAction.app.id, status, subject, message);
    // Mettre à jour localement
    setLocalApps(prev =>
      prev.map(a => a.id === quickAction.app.id ? { ...a, status } : a)
    );
  };

  // Synchroniser si les props changent
  React.useEffect(() => {
    setLocalApps(applications);
  }, [applications]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeApp = localApps.find((a) => a.id === activeId) ?? null;

  const getColumnCards = (col: Column) =>
    localApps.filter((a) => col.matchStatuses.includes(a.status));

  const getTargetColumn = (columnId: string) =>
    COLUMNS.find((c) => c.id === columnId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const appId = active.id as number;
    const targetCol = getTargetColumn(over.id as string);
    if (!targetCol) return;

    const app = localApps.find((a) => a.id === appId);
    if (!app) return;

    // Déjà dans la bonne colonne
    if (targetCol.matchStatuses.includes(app.status)) return;

    // Mise à jour optimiste
    setLocalApps((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, status: targetCol.targetStatus } : a
      )
    );

    try {
      await onStatusChange(appId, targetCol.targetStatus);
    } catch {
      // Rollback en cas d'erreur
      setLocalApps((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, status: app.status } : a
        )
      );
    }
  };

  return (
    <>
      {selectedApp && (
        <KanbanDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} onQuickAction={handleQuickAction} />
      )}
      {quickAction && (
        <QuickMessageModal
          isOpen={true}
          onClose={() => setQuickAction(null)}
          onSend={handleQuickSend}
          action={quickAction.action}
          candidateName={quickAction.app.candidate_name}
          jobTitle={jobTitle}
          companyName={companyName}
        />
      )}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map((col) => (
              <DroppableColumn
                key={col.id}
                column={col}
                cards={getColumnCards(col)}
                activeId={activeId}
                onView={setSelectedApp}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeApp ? <KanbanCardOverlay app={activeApp} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
