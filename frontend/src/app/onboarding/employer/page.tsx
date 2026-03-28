'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { getErrorMessage } from '@/types/api';

import { getApiUrl } from '@/lib/getApiUrl';
import { logger } from '@/lib/logger';

const API_URL = getApiUrl();

const EMPLOYER_POSITIONS = [
  'Recruteur interne (Talent Acquisition)',
  'Chasseur de têtes (Headhunter)',
  'Recruteur agence',
  'Entrepreneur',
  'Chef d\'entreprise',
  'Particulier'
];

export default function EmployerOnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Entreprise
    companyName: '',
    
    // Employeur
    position: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.position) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const token = session?.accessToken;
      
      logger.debug("Session:", session);
      logger.debug("Token:", token);
      
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/signin');
        return;
      }
      
      // Créer l'entreprise avec juste le nom
      const companyResponse = await axios.post(
        `${API_URL}/companies`,
        {
          name: formData.companyName
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const companyId = companyResponse.data.id;

      // Mettre à jour l'employeur avec company_id et infos
      await axios.put(
        `${API_URL}/employers/me`,
        {
          company_id: companyId,
          position: formData.position,
          phone: formData.phone
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('🎉 Profil créé avec succès !');
      router.push('/dashboard');
    } catch (error: unknown) {
      logger.error("Onboarding error:", error);
      toast.error(getErrorMessage(error, 'Erreur lors de la création du profil'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BuildingOfficeIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue sur INTOWORK ! 🎉
          </h1>
          <p className="text-gray-600">
            Complétez ces informations pour accéder à votre espace employeur
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BuildingOfficeIcon className="w-8 h-8 mr-3 text-blue-600" />
              Informations essentielles
            </h2>

            {/* Nom de l'entreprise */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l&apos;entreprise <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Ex: TechCorp Sénégal"
              />
              <p className="text-xs text-gray-500 mt-1">
                Vous pourrez compléter les détails (description, secteur, etc.) plus tard dans "Mon entreprise"
              </p>
            </div>

            {/* Votre poste */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Votre poste <span className="text-red-500">*</span>
              </label>
              <select
                id="position"
                name="position"
                required
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">Sélectionner...</option>
                {EMPLOYER_POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone professionnel
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="+221 XX XXX XX XX"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Astuce :</strong> Vous pourrez compléter le profil de votre entreprise (site web, LinkedIn, localisation, etc.) dans la section "Mon entreprise" de votre dashboard.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Accéder au dashboard 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
