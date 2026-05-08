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
import { UserGroupIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import type { ApplicationWithScore } from '@/lib/api/ai-scoring';

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
}: {
  app: ApplicationWithScore;
  isDragging?: boolean;
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
      {/* Avatar + nom */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#6B9B5F]/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-[#6B9B5F]">
            {app.candidate_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {app.candidate_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.candidate_email}</p>
        </div>
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
    </div>
  );
}

// ── Card overlay (pendant le drag) ──────────────────────────────────────────

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
}: {
  column: Column;
  cards: ApplicationWithScore[];
  activeId: number | null;
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
          <KanbanCard key={app.id} app={app} isDragging={activeId === app.id} />
        ))}
      </div>
    </div>
  );
}

// ── Kanban Board principal ───────────────────────────────────────────────────

interface KanbanBoardProps {
  applications: ApplicationWithScore[];
  onStatusChange: (applicationId: number, newStatus: string) => Promise<void>;
}

export default function KanbanBoard({ applications, onStatusChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [localApps, setLocalApps] = useState<ApplicationWithScore[]>(applications);

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
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => (
            <DroppableColumn
              key={col.id}
              column={col}
              cards={getColumnCards(col)}
              activeId={activeId}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeApp ? <KanbanCardOverlay app={activeApp} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
