'use client';

import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Rediriger vers le dashboard si l'utilisateur est connecté
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="px-6 py-4">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-2xl font-bold text-blue-600">
            INTOWORK
          </div>
          <div className="space-x-4">
            <Link 
              href="/auth/signin"
              className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md transition-colors"
            >
              Connexion
            </Link>
            <Link 
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Inscription
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            La plateforme de recrutement 
            <span className="text-blue-600"> nouvelle génération</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connectez-vous avec les meilleures opportunités grâce à notre système de matching IA. 
            Que vous soyez candidat ou recruteur, trouvez votre match parfait.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Commencer gratuitement
            </Link>
            <Link 
              href="/about"
              className="text-blue-600 hover:text-blue-700 px-8 py-3 rounded-lg text-lg font-semibold border border-blue-600 hover:border-blue-700 transition-colors"
            >
              En savoir plus
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-4">Pour les candidats</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Créez votre profil professionnel</li>
              <li>• Recevez des recommandations personnalisées</li>
              <li>• Postulez en un clic</li>
              <li>• Suivez vos candidatures</li>
              <li>• <strong>Connexion Microsoft intégrée</strong></li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold mb-4">Pour les recruteurs</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Publiez vos offres d'emploi</li>
              <li>• Gérez vos candidatures avec l'ATS</li>
              <li>• Planifiez vos entretiens</li>
              <li>• Matching IA des profils</li>
              <li>• <strong>Intégration Azure AD/Office 365</strong></li>
            </ul>
          </div>
        </div>

        {/* Microsoft Integration Highlight */}
        <div className="bg-white p-8 rounded-xl shadow-lg mt-8 text-center">
          <h3 className="text-2xl font-semibold mb-4">🔗 Intégration Microsoft</h3>
          <p className="text-gray-600 mb-4">
            Connectez-vous facilement avec vos comptes Microsoft Office 365, Azure AD, ou Outlook. 
            Une expérience fluide pour les professionnels déjà dans l'écosystème Microsoft.
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
            <span>✓ Azure Active Directory</span>
            <span>✓ Office 365</span>
            <span>✓ Outlook</span>
            <span>✓ Teams</span>
          </div>
        </div>
      </main>
    </div>
  );
}
