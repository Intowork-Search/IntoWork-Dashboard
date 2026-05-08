'use client';

import { useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  MagnifyingGlassIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useGlobalSearch, type SearchResult } from '@/hooks/useGlobalSearch';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, isLoading, hasResults } = useGlobalSearch();
  const selectedIndexRef = useRef(-1);

  // Focus sur l'input à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      selectedIndexRef.current = -1;
    } else {
      setQuery('');
    }
  }, [isOpen, setQuery]);

  // Fermer sur Escape
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleNavigate = (result: SearchResult) => {
    router.push(result.href);
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!hasResults) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndexRef.current = Math.min(selectedIndexRef.current + 1, results.length - 1);
      const el = document.getElementById(`search-result-${selectedIndexRef.current}`);
      el?.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndexRef.current = Math.max(selectedIndexRef.current - 1, -1);
      if (selectedIndexRef.current === -1) {
        inputRef.current?.focus();
      } else {
        const el = document.getElementById(`search-result-${selectedIndexRef.current}`);
        el?.focus();
      }
    }
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'job':
      case 'job_post':
        return <BriefcaseIcon className="w-5 h-5 text-[#6B9B5F]" />;
      case 'application':
        return <DocumentTextIcon className="w-5 h-5 text-[#7C3AED]" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'job': return t('typeJob');
      case 'job_post': return t('typeJobPost');
      case 'application': return t('typeApplication');
    }
  };

  if (!isOpen) return null;

  const groupedResults = {
    jobs: results.filter(r => r.type === 'job'),
    job_posts: results.filter(r => r.type === 'job_post'),
    applications: results.filter(r => r.type === 'application'),
  };

  let globalIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label={t('close')}
        tabIndex={-1}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* Input */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700 gap-3">
          {isLoading ? (
            <span className="loading loading-spinner loading-sm text-[#6B9B5F]" />
          ) : (
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base outline-none"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('clear')}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-400 font-mono">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              <MagnifyingGlassIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{t('hint')}</p>
            </div>
          )}

          {query && !isLoading && !hasResults && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              <p>{t('noResults', { query })}</p>
            </div>
          )}

          {hasResults && (
            <div className="py-2">
              {/* Groupe Offres */}
              {groupedResults.jobs.length > 0 && (
                <ResultGroup label={t('typeJob')}>
                  {groupedResults.jobs.map(result => {
                    globalIndex++;
                    const idx = globalIndex;
                    return (
                      <ResultItem
                        key={result.id}
                        index={idx}
                        result={result}
                        icon={getTypeIcon(result.type)}
                        typeLabel={getTypeLabel(result.type)}
                        onNavigate={handleNavigate}
                      />
                    );
                  })}
                </ResultGroup>
              )}

              {/* Groupe Mes offres (employeur) */}
              {groupedResults.job_posts.length > 0 && (
                <ResultGroup label={t('typeJobPost')}>
                  {groupedResults.job_posts.map(result => {
                    globalIndex++;
                    const idx = globalIndex;
                    return (
                      <ResultItem
                        key={result.id}
                        index={idx}
                        result={result}
                        icon={getTypeIcon(result.type)}
                        typeLabel={getTypeLabel(result.type)}
                        onNavigate={handleNavigate}
                      />
                    );
                  })}
                </ResultGroup>
              )}

              {/* Groupe Candidatures */}
              {groupedResults.applications.length > 0 && (
                <ResultGroup label={t('typeApplication')}>
                  {groupedResults.applications.map(result => {
                    globalIndex++;
                    const idx = globalIndex;
                    return (
                      <ResultItem
                        key={result.id}
                        index={idx}
                        result={result}
                        icon={getTypeIcon(result.type)}
                        typeLabel={getTypeLabel(result.type)}
                        onNavigate={handleNavigate}
                      />
                    );
                  })}
                </ResultGroup>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-mono">↑↓</kbd>
            {t('navigate')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-mono">↵</kbd>
            {t('select')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-mono">Esc</kbd>
            {t('close')}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Sous-composants ----

function ResultGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      {children}
    </div>
  );
}

interface ResultItemProps {
  result: SearchResult;
  index: number;
  icon: React.ReactNode;
  typeLabel: string;
  onNavigate: (result: SearchResult) => void;
}

function ResultItem({ result, index, icon, onNavigate }: ResultItemProps) {
  return (
    <button
      id={`search-result-${index}`}
      onClick={() => onNavigate(result)}
      onKeyDown={e => e.key === 'Enter' && onNavigate(result)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:bg-[#6B9B5F]/5 dark:focus:bg-[#6B9B5F]/10 focus:outline-none transition-colors text-left group"
      tabIndex={0}
    >
      <span className="shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-focus:bg-[#6B9B5F]/10">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {result.title}
        </span>
        <span className="block text-xs text-gray-500 truncate">{result.subtitle}</span>
      </span>
      {result.badge && (
        <span className={`badge badge-sm ${result.badgeColor ?? 'badge-ghost'} shrink-0`}>
          {result.badge}
        </span>
      )}
      <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#6B9B5F] transition-colors shrink-0" />
    </button>
  );
}
