'use client';

/**
 * OnboardingTour - Guide interactif pour les nouveaux utilisateurs
 * 
 * Système d'onboarding style Teams/Google avec tooltips guidés
 * - Adapté selon le rôle (candidat, employeur, admin)
 * - Persistance dans localStorage
 * - Design INTOWORK (vert #6B9B5F, or #F7C700, violet #6B46C1)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, ChevronRightIcon, ChevronLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

export interface OnboardingStep {
  target: string; // Sélecteur CSS de l'élément ciblé
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void; // Action optionnelle à exécuter
}

interface OnboardingTourProps {
  tourId: string; // ID unique du tour (ex: "candidate-dashboard", "employer-jobs")
  steps: OnboardingStep[];
  onComplete?: () => void;
  autoStart?: boolean;
}

export default function OnboardingTour({
  tourId,
  steps,
  onComplete,
  autoStart = true
}: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Vérifier si le tour a déjà été complété
  const hasCompletedTour = useCallback(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(`onboarding-${tourId}`) === 'completed';
  }, [tourId]);

  // Marquer le tour comme complété
  const markAsCompleted = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`onboarding-${tourId}`, 'completed');
    }
  }, [tourId]);

  // Réinitialiser le tour (pour le bouton "Relancer le guide")
  const resetTour = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`onboarding-${tourId}`);
      setCurrentStep(0);
      setIsActive(true);
    }
  }, [tourId]);

  // Démarrer le tour automatiquement si c'est la première fois
  useEffect(() => {
    if (autoStart && !hasCompletedTour()) {
      // Attendre que la page soit chargée
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasCompletedTour]);

  // Calculer la position du tooltip avec contraintes de viewport
  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target);

    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Dimensions du tooltip (largeur et hauteur réactives)
      const tooltipWidth = Math.min(400, window.innerWidth - 60);
      // Hauteur max: header(~150px) + content(300px) + footer(~70px) = ~520px
      // Mais limité à 100vh - 100px pour garder des marges
      const tooltipHeight = Math.min(520, viewportHeight - 100);
      
      // Dimensions du viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculer la position selon l'option
      let top = 0;
      let left = 0;

      switch (step.position || 'bottom') {
        case 'top':
          top = rect.top + scrollY - tooltipHeight - 20;
          left = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'bottom':
          top = rect.bottom + scrollY + 20;
          left = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'left':
          top = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.left + scrollX - tooltipWidth - 20;
          break;
        case 'right':
          top = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.right + scrollX + 20;
          break;
      }

      // Contraintes horizontales (marges généreuses pour éviter le débordement)
      const minLeft = scrollX + 30;
      const maxLeft = scrollX + viewportWidth - tooltipWidth - 30;
      left = Math.max(minLeft, Math.min(left, maxLeft));

      // Contraintes verticales (marges généreuses pour éviter le débordement)
      const minTop = scrollY + 50;
      const maxTop = scrollY + viewportHeight - tooltipHeight - 50;
      top = Math.max(minTop, Math.min(top, maxTop));

      setTooltipPosition({ top, left });

      // Scroll vers l'élément
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Ajouter un highlight sur l'élément
      element.classList.add('onboarding-highlight');
      return () => {
        element.classList.remove('onboarding-highlight');
      };
    }
  }, [isActive, currentStep, steps]);

  // Navigation
  const handleNext = () => {
    const step = steps[currentStep];
    if (step.action) {
      step.action();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    markAsCompleted();
    setIsActive(false);
    if (onComplete) onComplete();
  };

  const handleComplete = () => {
    markAsCompleted();
    setIsActive(false);
    if (onComplete) onComplete();
  };

  // Fonction publique pour redémarrer le tour
  useEffect(() => {
    (window as any).restartOnboarding = resetTour;
  }, [resetTour]);

  if (!isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay avec spotlight */}
      <div className="fixed inset-0 z-[9998]" style={{ 
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)'
      }} />

      {/* Spotlight sur l'élément actif */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 9999 !important;
          box-shadow: 0 0 0 4px rgba(107, 155, 95, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5) !important;
          border-radius: 8px;
          animation: pulse-highlight 2s ease-in-out infinite;
        }

        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(107, 155, 95, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(107, 155, 95, 0.8), 0 0 0 9999px rgba(0, 0, 0, 0.5);
          }
        }
      `}</style>

      {/* Tooltip */}
      <div
        className="fixed z-[10000] animate-fadeIn"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#6B9B5F]/20 overflow-hidden w-[min(400px,calc(100vw-60px))] max-h-[min(520px,calc(100vh-100px))] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#6B9B5F] to-[#6B9B5F]/80 px-6 py-4 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-bold text-lg truncate">{step.title}</h3>
                  <p className="text-white/80 text-sm">
                    Étape {currentStep + 1} sur {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="text-white/80 hover:text-white transition-colors flex-shrink-0 ml-2"
                aria-label="Fermer le guide"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Barre de progression */}
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Contenu */}
          <div className="px-6 py-5 overflow-y-auto flex-1 max-h-[300px]">
            <p className="text-gray-700 text-base leading-relaxed">{step.content}</p>
          </div>

          {/* Footer avec navigation */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-shrink-0 gap-2">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
            >
              Passer le guide
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-all font-medium"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Précédent
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6B9B5F] to-[#6B9B5F]/90 hover:from-[#6B9B5F]/90 hover:to-[#6B9B5F] text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    Terminer
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Flèche pointant vers l'élément */}
        <div
          className={`absolute w-4 h-4 bg-white transform rotate-45 border-[#6B9B5F]/20 ${
            step.position === 'bottom'
              ? '-top-2 left-1/2 -translate-x-1/2 border-t-2 border-l-2'
              : step.position === 'top'
              ? '-bottom-2 left-1/2 -translate-x-1/2 border-b-2 border-r-2'
              : step.position === 'right'
              ? '-left-2 top-1/2 -translate-y-1/2 border-t-2 border-l-2'
              : '-right-2 top-1/2 -translate-y-1/2 border-b-2 border-r-2'
          }`}
        />
      </div>
    </>
  );
}
