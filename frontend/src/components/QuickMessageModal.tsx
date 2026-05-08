'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, ArrowPathIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

// ── Templates par défaut ────────────────────────────────────────────────────

const DEFAULT_TEMPLATES = {
  interview: (candidateName: string, jobTitle: string, companyName: string) => ({
    subject: `Invitation à un entretien — ${jobTitle}`,
    message: `Bonjour ${candidateName},

Nous avons examiné votre candidature pour le poste de ${jobTitle} au sein de ${companyName} et nous avons le plaisir de vous inviter à un entretien.

Nous vous contacterons prochainement pour convenir d'une date et d'un horaire qui vous convient.

Dans l'attente de vous rencontrer, nous restons à votre disposition pour toute question.

Cordialement,
L'équipe ${companyName}`,
  }),
  rejected: (candidateName: string, jobTitle: string, companyName: string) => ({
    subject: `Réponse à votre candidature — ${jobTitle}`,
    message: `Bonjour ${candidateName},

Nous vous remercions de l'intérêt que vous avez porté au poste de ${jobTitle} au sein de ${companyName} et du temps que vous avez consacré à votre candidature.

Après examen attentif de votre dossier, nous avons le regret de vous informer que nous n'allons pas donner suite à votre candidature. Cette décision ne remet pas en question la qualité de votre profil, mais reflète davantage les besoins spécifiques du poste à ce moment.

Nous vous souhaitons plein succès dans vos recherches et espérons avoir l'occasion de collaborer avec vous à l'avenir.

Cordialement,
L'équipe ${companyName}`,
  }),
  shortlisted: (candidateName: string, jobTitle: string, companyName: string) => ({
    subject: `Votre candidature est présélectionnée — ${jobTitle}`,
    message: `Bonjour ${candidateName},

Bonne nouvelle ! Votre candidature pour le poste de ${jobTitle} chez ${companyName} a été présélectionnée.

Nous l'examinons actuellement et nous vous recontacterons très prochainement pour la suite du processus.

Cordialement,
L'équipe ${companyName}`,
  }),
};

// ── Types ───────────────────────────────────────────────────────────────────

export type QuickActionType = 'interview' | 'rejected' | 'shortlisted';

export interface QuickMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (status: string, subject: string, message: string) => Promise<void>;
  action: QuickActionType;
  candidateName: string;
  jobTitle: string;
  companyName?: string;
}

// ── Config par action ────────────────────────────────────────────────────────

const ACTION_CONFIG = {
  interview: {
    label: 'Inviter en entretien',
    icon: CheckCircleIcon,
    color: 'text-[#6B9B5F]',
    bg: 'bg-[#6B9B5F]',
    bgLight: 'bg-[#6B9B5F]/10',
    border: 'border-[#6B9B5F]/30',
    status: 'interview',
  },
  rejected: {
    label: 'Refuser la candidature',
    icon: XCircleIcon,
    color: 'text-red-600',
    bg: 'bg-red-600',
    bgLight: 'bg-red-50',
    border: 'border-red-200',
    status: 'rejected',
  },
  shortlisted: {
    label: 'Présélectionner',
    icon: ChatBubbleLeftRightIcon,
    color: 'text-purple-600',
    bg: 'bg-purple-600',
    bgLight: 'bg-purple-50',
    border: 'border-purple-200',
    status: 'shortlisted',
  },
} as const;

// ── Composant ────────────────────────────────────────────────────────────────

export default function QuickMessageModal({
  isOpen,
  onClose,
  onSend,
  action,
  candidateName,
  jobTitle,
  companyName = 'notre entreprise',
}: QuickMessageModalProps) {
  const cfg = ACTION_CONFIG[action];
  const Icon = cfg.icon;
  const tpl = DEFAULT_TEMPLATES[action](candidateName, jobTitle, companyName);

  const [subject, setSubject] = useState(tpl.subject);
  const [message, setMessage] = useState(tpl.message);
  const [sending, setSending] = useState(false);

  // Réinitialiser quand l'action/candidat change
  useEffect(() => {
    const t = DEFAULT_TEMPLATES[action](candidateName, jobTitle, companyName);
    setSubject(t.subject);
    setMessage(t.message);
  }, [action, candidateName, jobTitle, companyName]);

  const handleReset = () => {
    const t = DEFAULT_TEMPLATES[action](candidateName, jobTitle, companyName);
    setSubject(t.subject);
    setMessage(t.message);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await onSend(cfg.status, subject, message);
      onClose();
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 ${cfg.bgLight} rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-base">{cfg.label}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {candidateName} · {jobTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Objet */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Objet de l&apos;email
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/40 focus:border-[#6B9B5F]"
              placeholder="Objet de l'email…"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/40 focus:border-[#6B9B5F] resize-y font-mono leading-relaxed"
              placeholder="Votre message…"
            />
          </div>

          {/* Note info */}
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-start gap-1.5">
            <span className="shrink-0 mt-0.5">ℹ️</span>
            Le candidat recevra cet email et son statut sera mis à jour automatiquement.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Réinitialiser le message par défaut"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Réinitialiser
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !message.trim()}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white ${cfg.bg} hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg`}
            >
              {sending ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Envoi…
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
