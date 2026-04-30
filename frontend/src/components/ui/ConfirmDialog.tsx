"use client";

import { ExclamationTriangleIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { ConfirmOptions } from '@/hooks/useConfirmModal';

interface ConfirmDialogProps {
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  options,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const isDanger = options.variant !== 'warning';
  const iconBg = isDanger ? 'bg-red-100' : 'bg-amber-100';
  const iconColor = isDanger ? 'text-red-600' : 'text-amber-600';
  const btnClass = isDanger
    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:shadow-red-200'
    : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:shadow-lg hover:shadow-amber-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icône */}
          <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
            <ExclamationTriangleIcon className={`w-8 h-8 ${iconColor}`} />
          </div>

          {/* Texte */}
          <div className="space-y-1">
            {options.title && (
              <h2 className="text-xl font-bold text-gray-900">{options.title}</h2>
            )}
            <p className="text-sm text-gray-600 leading-relaxed">{options.message}</p>
            {options.detail && (
              <p className="text-xs text-red-500 font-medium mt-2">{options.detail}</p>
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-3 w-full pt-1">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <XMarkIcon className="w-4 h-4" />
              {options.cancelLabel ?? 'Annuler'}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 ${btnClass} text-white rounded-xl font-medium text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  {isDanger && <TrashIcon className="w-4 h-4" />}
                  {options.confirmLabel ?? 'Confirmer'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
