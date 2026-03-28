'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="text-center max-w-md p-8">
        <h2 className="text-2xl font-bold text-error mb-4">Une erreur est survenue</h2>
        <p className="text-base-content/70 mb-6">
          {error.message || "Quelque chose s'est mal passé."}
        </p>
        <button
          onClick={reset}
          className="btn btn-primary"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
