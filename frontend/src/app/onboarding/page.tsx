'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import { authAPI, CompleteRegistration } from '@/lib/api';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

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
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12 ${plusJakarta.className}`}>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out; }
        .animate-blob { animation: blob 20s infinite; }
      `}</style>

      <div className="max-w-4xl w-full animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-300/50 overflow-hidden border border-slate-200">
          {/* Header avec gradient INTOWORK */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#6B9B5F] via-[#5a8a4f] to-[#4a7a3f] p-10 text-white">
            {/* Motifs décoratifs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F7C700]/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl" style={{ animationDelay: '2s' }} />
            
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/30">
                <span className="text-4xl">✨</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
                Bienvenue {user?.firstName} ! 👋
              </h1>
              <p className="text-white/90 text-lg lg:text-xl font-medium">
                Finalisons votre inscription pour personnaliser votre expérience
              </p>
            </div>
          </div>
          
          <div className="p-8 lg:p-10">
            {step === 'role' && (
              <div className="space-y-10">
                <div className="text-center animate-fadeIn">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-[#6B9B5F] to-[#6B46C1] bg-clip-text text-transparent mb-4">
                    Choisissez votre profil
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Sélectionnez l'option qui correspond le mieux à votre situation
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Carte Candidat */}
                  <div
                    className={`group relative p-8 border-2 rounded-2xl cursor-pointer transition-all duration-300 animate-slideInLeft ${
                      role === 'candidate'
                        ? 'border-[#3B82F6] bg-blue-50 shadow-xl shadow-blue-200/50 transform scale-105'
                        : 'border-gray-200 hover:border-[#3B82F6] hover:bg-blue-50/30 hover:shadow-lg'
                    }`}
                    onClick={() => {
                      setRole('candidate');
                      setFormData({ ...formData, role: 'candidate' });
                      setStep('form');
                    }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/10 rounded-full blur-2xl -z-10" />
                    <div className="text-center relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <span className="text-4xl">🎯</span>
                      </div>
                      <h3 className="font-bold text-2xl text-gray-800 mb-3">Candidat</h3>
                      <p className="text-gray-600 leading-relaxed text-base">
                        Je cherche un emploi ou des opportunités de carrière
                      </p>
                    </div>
                  </div>
                  
                  {/* Carte Recruteur */}
                  <div 
                    className={`group relative p-8 border-2 rounded-2xl cursor-pointer transition-all duration-300 animate-slideInRight ${
                      role === 'employer'
                        ? 'border-[#6B46C1] bg-purple-50 shadow-xl shadow-purple-200/50 transform scale-105'
                        : 'border-gray-200 hover:border-[#6B46C1] hover:bg-purple-50/30 hover:shadow-lg'
                    }`}
                    onClick={() => {
                      setRole('employer');
                      setFormData({ ...formData, role: 'employer' });
                      setStep('form');
                    }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#6B46C1]/10 rounded-full blur-2xl -z-10" />
                    <div className="text-center relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#6B46C1] to-[#5B36B1] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <span className="text-4xl">🏢</span>
                      </div>
                      <h3 className="font-bold text-2xl text-gray-800 mb-3">Recruteur</h3>
                      <p className="text-gray-600 leading-relaxed text-base">
                        Je recrute des talents pour mon organisation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
                {/* Bouton retour */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setStep('role')}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#6B9B5F] transition-colors font-medium"
                  >
                    <span className="text-xl">←</span>
                    Retour
                  </button>
                </div>

                <div className="text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-[#6B9B5F] to-[#6B46C1] bg-clip-text text-transparent mb-3">
                    {role === 'candidate' ? 'Profil Candidat' : 'Profil Recruteur'}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Complétez vos informations pour finaliser votre inscription
                  </p>
                </div>

                {/* Formulaire spécifique au rôle */}
                {role === 'candidate' && (
                  <div className="space-y-6 bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-100 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      Informations candidat
                    </h3>
                    
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="candidate-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                          Téléphone <span className="text-gray-400 font-normal">(optionnel)</span>
                        </label>
                        <input
                          id="candidate-phone"
                          type="tel"
                          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-white shadow-sm text-gray-900 placeholder-gray-400 transition-all"
                          placeholder="+33 6 12 34 56 78"
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="candidate-location" className="block text-sm font-semibold text-gray-700 mb-2">
                          Localisation
                        </label>
                        <input
                          id="candidate-location"
                          type="text"
                          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-white shadow-sm text-gray-900 placeholder-gray-400 transition-all"
                          placeholder="Paris, France"
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="candidate-title" className="block text-sm font-semibold text-gray-700 mb-2">
                          Poste recherché
                        </label>
                        <input
                          id="candidate-title"
                          type="text"
                          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-white shadow-sm text-gray-900 placeholder-gray-400 transition-all"
                          placeholder="Développeur Full Stack"
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {role === 'employer' && (
                  <div className="space-y-6 bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-100 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#6B46C1] to-[#5B36B1] rounded-xl flex items-center justify-center">
                        <span className="text-xl">🏢</span>
                      </div>
                      Informations recruteur
                    </h3>
                    
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="employer-company" className="block text-sm font-semibold text-gray-700 mb-2">
                          Nom de l'entreprise <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="employer-company"
                          type="text"
                          required
                          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-[#6B46C1] bg-white shadow-sm text-gray-900 placeholder-gray-400 transition-all"
                          placeholder="Nom de votre entreprise"
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="employer-industry" className="block text-sm font-semibold text-gray-700 mb-2">
                          Secteur d'activité
                        </label>
                        <input
                          id="employer-industry"
                          type="text"
                          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-[#6B46C1] bg-white shadow-sm text-gray-900 placeholder-gray-400 transition-all"
                          placeholder="Technologie, Finance, Santé..."
                          onChange={(e) => setFormData({ ...formData, company_industry: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="employer-type" className="block text-sm font-semibold text-gray-700 mb-2">
                          Type de recruteur
                        </label>
                        <select
                          id="employer-type"
                          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-[#6B46C1] bg-white shadow-sm text-gray-900 transition-all"
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
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] hover:from-[#5a8a4f] hover:to-[#4a7a3f] disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Finalisation en cours...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Finaliser mon inscription 
                      <span className="text-2xl">✨</span>
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
