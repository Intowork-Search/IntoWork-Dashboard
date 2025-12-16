'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      // Rediriger vers onboarding si l'utilisateur n'a pas encore choisi son rôle
      const userRole = user.publicMetadata?.role;
      
      if (!userRole) {
        router.push('/onboarding');
        return;
      }
      
      // Sinon, afficher un dashboard temporaire
      console.log('User role:', userRole);
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const userRole = user.publicMetadata?.role;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tableau de Bord - INTOWORK
            </h1>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-blue-800">
                <strong>Bienvenue {user.firstName} !</strong>
              </p>
              <p className="text-blue-600 mt-2">
                Rôle : {String(userRole || 'Non défini')}
              </p>
            </div>

            {!userRole && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <p className="text-yellow-800">
                  Vous allez être redirigé vers la page d'onboarding pour choisir votre rôle...
                </p>
              </div>
            )}

            {userRole === 'candidate' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Dashboard Candidat
                </h3>
                <p className="text-green-600">
                  Cette fonctionnalité sera disponible dans la Phase 2 du projet.
                </p>
              </div>
            )}

            {userRole === 'employer' && (
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  Dashboard Employeur
                </h3>
                <p className="text-purple-600">
                  Cette fonctionnalité sera disponible dans les phases ultérieures.
                </p>
              </div>
            )}

            <div className="mt-8 space-y-4">
              <button
                onClick={() => router.push('/onboarding')}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 mr-4"
              >
                Modifier mon rôle
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
