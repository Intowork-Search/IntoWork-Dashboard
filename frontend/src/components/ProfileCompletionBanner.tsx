'use client';

/**
 * Bannière de complétion de profil gamifiée pour les candidats
 * Disparaît automatiquement quand le profil est à 100%
 */
import { useRouter } from 'next/navigation';
import {
  UserCircleIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  StarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';

export interface ProfileCompletion {
  hasBasicInfo: boolean;    // prénom, nom, email
  hasPhone: boolean;
  hasLocation: boolean;
  hasTitle: boolean;
  hasSummary: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
  hasCv: boolean;
  hasAvatar: boolean;
}

interface Step {
  key: keyof ProfileCompletion;
  label: string;
  hint: string;
  href: string;
  icon: React.ElementType;
  points: number;
}

const STEPS: Step[] = [
  { key: 'hasBasicInfo', label: 'Infos de base', hint: 'Prénom, nom et email', href: '/dashboard/profile', icon: UserCircleIcon, points: 10 },
  { key: 'hasPhone', label: 'Téléphone', hint: 'Numéro de contact', href: '/dashboard/profile', icon: UserCircleIcon, points: 10 },
  { key: 'hasLocation', label: 'Localisation', hint: 'Ville / pays', href: '/dashboard/profile', icon: UserCircleIcon, points: 10 },
  { key: 'hasTitle', label: 'Titre pro', hint: 'Ex: Développeur Full Stack', href: '/dashboard/profile', icon: BriefcaseIcon, points: 10 },
  { key: 'hasSummary', label: 'Présentation', hint: 'Quelques lignes sur toi', href: '/dashboard/profile', icon: UserCircleIcon, points: 10 },
  { key: 'hasExperience', label: 'Expériences', hint: 'Au moins une expérience pro', href: '/dashboard/profile', icon: BriefcaseIcon, points: 15 },
  { key: 'hasEducation', label: 'Formation', hint: 'Ton parcours académique', href: '/dashboard/profile', icon: AcademicCapIcon, points: 15 },
  { key: 'hasSkills', label: 'Compétences', hint: 'Minimum 3 compétences', href: '/dashboard/profile', icon: StarIcon, points: 15 },
  { key: 'hasCv', label: 'CV uploadé', hint: 'Fichier PDF ou Word', href: '/dashboard/cv', icon: BriefcaseIcon, points: 5 },
];

function computeScore(c: ProfileCompletion): number {
  return STEPS.filter(s => c[s.key]).reduce((acc, s) => acc + s.points, 0);
}

function getLevel(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 90) return { label: 'Profil Expert', color: 'text-[#6B9B5F]', bgColor: 'bg-[#6B9B5F]' };
  if (score >= 70) return { label: 'Profil Avancé', color: 'text-blue-600', bgColor: 'bg-blue-500' };
  if (score >= 50) return { label: 'Profil Intermédiaire', color: 'text-amber-600', bgColor: 'bg-amber-500' };
  return { label: 'Profil Débutant', color: 'text-gray-500', bgColor: 'bg-gray-400' };
}

interface Props {
  completion: ProfileCompletion;
}

export default function ProfileCompletionBanner({ completion }: Props) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const score = computeScore(completion);
  const missingSteps = STEPS.filter(s => !completion[s.key]);
  const level = getLevel(score);

  // Masquer si complet ou si l'utilisateur a fermé
  if (score >= 100 || dismissed) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${level.color}`}>{level.label}</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">{score}<span className="text-base font-medium text-gray-400">/100</span></span>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full ${level.bgColor} rounded-full transition-all duration-700`}
              style={{ width: `${score}%` }}
            />
          </div>

          {/* Étapes à compléter (max 3 affichées) */}
          <div className="flex flex-wrap gap-2">
            {missingSteps.slice(0, 3).map(step => {
              const Icon = step.icon;
              return (
                <button
                  key={step.key}
                  onClick={() => router.push(step.href)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-[#6B9B5F]/10 dark:hover:bg-[#6B9B5F]/20 border border-gray-200 dark:border-gray-600 hover:border-[#6B9B5F]/40 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-[#6B9B5F] transition-all group"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>+ {step.label}</span>
                  <ChevronRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
            {missingSteps.length > 3 && (
              <button
                onClick={() => router.push('/dashboard/profile')}
                className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-[#6B9B5F] transition-colors"
              >
                +{missingSteps.length - 3} autres…
              </button>
            )}
          </div>
        </div>

        {/* Étapes complètes (badges discrets) */}
        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
          {STEPS.filter(s => completion[s.key]).slice(-3).map(s => (
            <div key={s.key} className="flex items-center gap-1 text-xs text-[#6B9B5F]">
              <CheckCircleSolid className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
          aria-label="Masquer"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export { computeScore, STEPS };
