'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { authAPI, CompleteRegistration } from '@/lib/api';

export default function OnboardingPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [formData, setFormData] = useState<Partial<CompleteRegistration>>({
    role: 'candidate'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Obtenir le token Clerk
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }

      // Synchroniser avec le backend
      await authAPI.syncUser({
        clerk_id: user.id,
        email: user.emailAddresses[0].emailAddress,
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        role: formData.role as 'candidate' | 'employer' | 'admin'
      }, token);

      // Compléter l'inscription
      await authAPI.completeRegistration(formData as CompleteRegistration, token);

      // Attendre un peu pour que Clerk synchronise les métadonnées
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Forcer le rechargement des données utilisateur
      await user.reload();

      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing registration:', error);
      alert('Erreur lors de la finalisation de votre inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue {user?.firstName} ! 👋
          </h1>
          <p className="text-gray-600">
            Finalisons votre inscription pour personnaliser votre expérience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Choix du rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Vous êtes :
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  role === 'candidate' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setRole('candidate');
                  setFormData({ ...formData, role: 'candidate' });
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-semibold text-lg">Candidat</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Je cherche un emploi ou des opportunités
                  </p>
                </div>
              </div>
              
              <div 
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  role === 'employer' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setRole('employer');
                  setFormData({ ...formData, role: 'employer' });
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🏢</div>
                  <h3 className="font-semibold text-lg">Recruteur</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Je recrute des talents pour mon entreprise
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire spécifique au rôle */}
          {role === 'candidate' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+33 6 12 34 56 78"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paris, France"
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poste recherché
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Développeur Full Stack"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>
          )}

          {role === 'employer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de votre entreprise"
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secteur d'activité
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Technologie, Finance, Santé..."
                  onChange={(e) => setFormData({ ...formData, company_industry: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Votre poste
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="RH, Directeur, Recruteur..."
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-md transition-colors"
          >
            {loading ? 'Finalisation...' : 'Finaliser mon inscription'}
          </button>
        </form>
      </div>
    </div>
  );
}
