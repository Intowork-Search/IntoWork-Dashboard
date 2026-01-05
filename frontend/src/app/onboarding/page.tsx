'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import { authAPI, CompleteRegistration } from '@/lib/api';

export default function OnboardingPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<'candidate' | 'employer' | null>(null);
  const [formData, setFormData] = useState<Partial<CompleteRegistration>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Obtenir le token
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }

      // Compléter l'inscription avec les informations de l'onboarding
      await authAPI.completeRegistration(formData as CompleteRegistration, token);

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
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header solid color */}
        <div className="bg-blue-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue {user?.firstName} ! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Finalisons votre inscription pour personnaliser votre expérience
          </p>
        </div>
        
        <div className="p-8">
        {step === 'role' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Choisissez votre profil
              </h2>
              <p className="text-gray-600">
                Sélectionnez l'option qui correspond le mieux à votre situation
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`group p-8 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  role === 'candidate'
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
                onClick={() => {
                  setRole('candidate');
                  setFormData({ ...formData, role: 'candidate' });
                  setStep('form');
                }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2">Candidat</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Je cherche un emploi ou des opportunités de carrière
                  </p>
                </div>
              </div>
              
              <div 
                className="group p-8 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                onClick={() => {
                  setRole('employer');
                  setFormData({ ...formData, role: 'employer' });
                  setStep('form');
                }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                    <span className="text-3xl">🏢</span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2">Recruteur</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Je recrute des talents pour mon organisation
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bouton retour */}
            <div className="flex items-center mb-6">
              <button
                type="button"
                onClick={() => setStep('role')}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className="mr-2">←</span>
                Retour
              </button>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {role === 'candidate' ? 'Profil Candidat' : 'Profil Recruteur'}
              </h2>
              <p className="text-gray-600">
                Complétez vos informations pour finaliser votre inscription
              </p>
            </div>

          {/* Formulaire spécifique au rôle */}
          {role === 'candidate' && (
            <div className="space-y-6 bg-blue-50/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-blue-500 mr-2">👤</span>
                Informations candidat
              </h3>
              <div>
                <label htmlFor="candidate-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  id="candidate-phone"
                  type="tel"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-gray-900 placeholder-gray-500"
                  placeholder="+33 6 12 34 56 78"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="candidate-location" className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <input
                  id="candidate-location"
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-gray-900 placeholder-gray-500"
                  placeholder="Paris, France"
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="candidate-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Poste recherché
                </label>
                <input
                  id="candidate-title"
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-gray-900 placeholder-gray-500"
                  placeholder="Développeur Full Stack"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>
          )}

          {role === 'employer' && (
            <div className="space-y-6 bg-indigo-50/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-indigo-500 mr-2">🏢</span>
                Informations recruteur
              </h3>
              <div>
                <label htmlFor="employer-company" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  id="employer-company"
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-gray-900 placeholder-gray-500"
                  placeholder="Nom de votre entreprise"
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="employer-industry" className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité
                </label>
                <input
                  id="employer-industry"
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-gray-900 placeholder-gray-500"
                  placeholder="Technologie, Finance, Santé..."
                  onChange={(e) => setFormData({ ...formData, company_industry: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="employer-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de recruteur
                </label>
                <select
                  id="employer-type"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-gray-900"
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  defaultValue=""
                  title="Sélectionnez votre type de recruteur"
                >
                  <option value="" disabled>
                    Sélectionnez votre profil
                  </option>
                  <option value="Recruteur interne (Talent Acquisition)">
                    Recruteur interne (Talent Acquisition)
                  </option>
                  <option value="Chasseur de têtes (Headhunter)">
                    Chasseur de têtes (Headhunter)
                  </option>
                  <option value="Recruteur agence">
                    Recruteur agence
                  </option>
                  <option value="Entrepreneur">
                    Entrepreneur
                  </option>
                  <option value="Chef d'entreprise">
                    Chef d'entreprise
                  </option>
                  <option value="Particulier">
                    Particulier
                  </option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Finalisation...
              </div>
            ) : (
              'Finaliser mon inscription ✨'
            )}
          </button>
        </form>
        )}
        </div>
      </div>
    </div>
  );
}
