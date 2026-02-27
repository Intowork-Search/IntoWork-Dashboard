'use client';

/**
 * HelpButton - Bouton flottant pour relancer le guide
 * 
 * Bouton "?" flottant en bas à droite qui permet de relancer le tour d'onboarding
 */

import React, { useState } from 'react';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SparklesIcon, ArrowPathIcon, BookOpenIcon } from '@heroicons/react/24/solid';

interface HelpButtonProps {
  onRestartTour?: () => void;
}

export default function HelpButton({ onRestartTour }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleRestartTour = () => {
    setIsOpen(false);
    if (onRestartTour) {
      onRestartTour();
    } else if (typeof window !== 'undefined' && (window as any).restartOnboarding) {
      (window as any).restartOnboarding();
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-[#6B9B5F] to-[#6B9B5F]/90 hover:from-[#6B9B5F]/90 hover:to-[#6B9B5F] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Aide"
      >
        {isOpen ? (
          <XMarkIcon className="w-7 h-7" />
        ) : (
          <QuestionMarkCircleIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Menu d'aide */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-72 bg-white rounded-2xl shadow-2xl border-2 border-[#6B9B5F]/20 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#6B9B5F] to-[#6B9B5F]/80 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Besoin d'aide ?</h3>
                <p className="text-white/80 text-sm">Guides et tutoriels</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-4 space-y-2">
            {/* Relancer le guide */}
            <button
              onClick={handleRestartTour}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#6B9B5F]/10 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#6B9B5F]/10 group-hover:bg-[#6B9B5F]/20 flex items-center justify-center transition-colors">
                <ArrowPathIcon className="w-5 h-5 text-[#6B9B5F]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Relancer le guide</p>
                <p className="text-xs text-gray-500 mt-0.5">Revoir le tutoriel d'onboarding</p>
              </div>
            </button>

            {/* Documentation */}
            <a
              href="/docs"
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#F7C700]/10 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F7C700]/10 group-hover:bg-[#F7C700]/20 flex items-center justify-center transition-colors">
                <BookOpenIcon className="w-5 h-5 text-[#F7C700]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Documentation</p>
                <p className="text-xs text-gray-500 mt-0.5">Guides complets et FAQ</p>
              </div>
            </a>

            {/* Support */}
            <a
              href="/support"
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#6B46C1]/10 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#6B46C1]/10 group-hover:bg-[#6B46C1]/20 flex items-center justify-center transition-colors">
                <QuestionMarkCircleIcon className="w-5 h-5 text-[#6B46C1]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Contacter le support</p>
                <p className="text-xs text-gray-500 mt-0.5">Nous sommes là pour vous aider</p>
              </div>
            </a>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Raccourci clavier : <kbd className="px-2 py-0.5 bg-gray-200 rounded text-gray-700 font-mono">?</kbd>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
