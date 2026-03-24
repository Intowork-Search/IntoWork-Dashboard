'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="text-center max-w-md p-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4">Erreur du tableau de bord</h2>
        <p className="text-base-content/70 mb-6">
          Impossible de charger votre profil.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn btn-primary">
            Réessayer
          </button>
          <button onClick={() => router.push('/dashboard')} className="btn btn-ghost">
            Accueil
          </button>
        </div>
      </div>
    </div>
  );
}
