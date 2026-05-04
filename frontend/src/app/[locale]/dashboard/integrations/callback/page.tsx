'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function IntegrationsCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Récupérer les paramètres OAuth
    const provider = searchParams.get('provider');
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    // Rediriger vers la page intégrations avec les paramètres
    setTimeout(() => {
      const params = new URLSearchParams();
      if (provider) params.append('provider', provider);
      if (success) params.append('success', success);
      if (error) params.append('error', error);

      router.push(`/dashboard/integrations?${params.toString()}`);
    }, 1500);
  }, [searchParams, router]);

  const success = searchParams.get('success') === 'true';
  const provider = searchParams.get('provider') || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          {success ? (
            <>
              <CheckCircleIcon className="h-16 w-16 text-success mb-4" />
              <h2 className="card-title text-2xl mb-2">Connexion réussie !</h2>
              <p className="text-base-content/60">
                {provider} a été connecté avec succès.
              </p>
            </>
          ) : (
            <>
              <XCircleIcon className="h-16 w-16 text-error mb-4" />
              <h2 className="card-title text-2xl mb-2">Échec de connexion</h2>
              <p className="text-base-content/60">
                Une erreur s'est produite lors de la connexion à {provider}.
              </p>
            </>
          )}
          <div className="flex items-center gap-2 mt-4">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="text-sm text-base-content/60">Redirection...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
