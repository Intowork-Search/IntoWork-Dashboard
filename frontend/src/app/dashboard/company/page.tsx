'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useNextAuth';
import { companiesAPI, Company, CompanyStats } from '@/lib/api';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';

export default function CompanyPage(): React.JSX.Element {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});

  // Charger les données de l'entreprise
  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const [companyData, statsData] = await Promise.all([
        companiesAPI.getMyCompany(token).catch(() => null), // Ne pas échouer si pas d'entreprise
        companiesAPI.getCompanyStats(token).catch(() => ({ active_jobs: 0, total_jobs: 0, total_employers: 0, total_applications: 0 }))
      ]);

      setCompany(companyData);
      setStats(statsData);
      if (companyData) {
        setFormData(companyData);
      } else {
        // Pas d'entreprise, activer le mode édition pour créer une entreprise
        setIsEditing(true);
        toast('Créez votre profil d\'entreprise pour commencer', { icon: 'ℹ️' });
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        // L'utilisateur n'a pas de profil employeur ou d'entreprise
        setIsEditing(true);
        toast('Créez votre profil d\'entreprise pour commencer', { icon: 'ℹ️' });
      } else {
        toast.error(error.response?.data?.detail || 'Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await getToken();
      if (!token) return;

      const updatedCompany = await companiesAPI.updateMyCompany(token, formData);
      setCompany(updatedCompany);
      setIsEditing(false);
      toast.success('Informations mises à jour avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(company || {});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <DashboardLayout title="Mon Entreprise" subtitle="Chargement...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mon Entreprise" subtitle="Gérez les informations de votre entreprise">
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                {company?.logo_url ? (
                  <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{company?.name}</h1>
                <p className="text-gray-600">{company?.industry || 'Industrie non spécifiée'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                isEditing
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              }`}
            >
              {isEditing ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.active_jobs}</p>
              <p className="text-blue-100">Offres actives</p>
            </div>

            <div className="bg-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.total_jobs}</p>
              <p className="text-indigo-100">Total d'offres</p>
            </div>

            <div className="bg-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.total_employers}</p>
              <p className="text-purple-100">Recruteurs</p>
            </div>

            <div className="bg-green-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.total_applications}</p>
              <p className="text-green-100">Candidatures reçues</p>
            </div>
          </div>
        )}

        {/* Informations de l'entreprise */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Informations générales
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nom de l'entreprise */}
            <div>
              <label htmlFor="company-name" className="block text-sm font-semibold text-gray-700 mb-2">
                Nom de l'entreprise *
              </label>
              {isEditing ? (
                <input
                  id="company-name"
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="Nom de votre entreprise"
                />
              ) : (
                <p className="text-gray-900 text-lg font-medium">{company?.name || '-'}</p>
              )}
            </div>

            {/* Industrie */}
            <div>
              <label htmlFor="company-industry" className="block text-sm font-semibold text-gray-700 mb-2">
                Industrie
              </label>
              {isEditing ? (
                <input
                  id="company-industry"
                  type="text"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Ex: Technologie, Finance, Santé..."
                />
              ) : (
                <p className="text-gray-900 text-lg">{company?.industry || '-'}</p>
              )}
            </div>

            {/* Taille */}
            <div>
              <label htmlFor="company-size" className="block text-sm font-semibold text-gray-700 mb-2">
                Taille de l'entreprise
              </label>
              {isEditing ? (
                <select
                  id="company-size"
                  title="Taille de l'entreprise"
                  value={formData.size || ''}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                >
                  <option value="">Sélectionner...</option>
                  <option value="1-10">1-10 employés</option>
                  <option value="11-50">11-50 employés</option>
                  <option value="51-200">51-200 employés</option>
                  <option value="201-500">201-500 employés</option>
                  <option value="500+">500+ employés</option>
                </select>
              ) : (
                <p className="text-gray-900 text-lg">{company?.size || '-'}</p>
              )}
            </div>

            {/* Site web */}
            <div>
              <label htmlFor="company-website" className="block text-sm font-semibold text-gray-700 mb-2">
                Site web
              </label>
              {isEditing ? (
                <input
                  id="company-website"
                  type="url"
                  value={formData.website_url || ''}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="https://www.exemple.com"
                />
              ) : (
                <a href={company?.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-lg">
                  {company?.website_url || '-'}
                </a>
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label htmlFor="company-linkedin" className="block text-sm font-semibold text-gray-700 mb-2">
                LinkedIn
              </label>
              {isEditing ? (
                <input
                  id="company-linkedin"
                  type="url"
                  value={formData.linkedin_url || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="https://linkedin.com/company/..."
                />
              ) : (
                <a href={company?.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-lg">
                  {company?.linkedin_url || '-'}
                </a>
              )}
            </div>

            {/* Logo URL */}
            <div>
              <label htmlFor="company-logo" className="block text-sm font-semibold text-gray-700 mb-2">
                URL du logo
              </label>
              {isEditing ? (
                <input
                  id="company-logo"
                  type="url"
                  value={formData.logo_url || ''}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="https://exemple.com/logo.png"
                />
              ) : (
                <p className="text-gray-900 text-lg">{company?.logo_url || '-'}</p>
              )}
            </div>

            {/* Description (pleine largeur) */}
            <div className="lg:col-span-2">
              <label htmlFor="company-description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description de l'entreprise
              </label>
              {isEditing ? (
                <textarea
                  id="company-description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none"
                  placeholder="Décrivez votre entreprise, votre mission, votre culture..."
                />
              ) : (
                <p className="text-gray-900 text-lg whitespace-pre-wrap">{company?.description || '-'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            Localisation
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Adresse */}
            <div className="lg:col-span-3">
              <label htmlFor="company-address" className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse
              </label>
              {isEditing ? (
                <input
                  id="company-address"
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Adresse complète"
                />
              ) : (
                <p className="text-gray-900 text-lg">{company?.address || '-'}</p>
              )}
            </div>

            {/* Ville */}
            <div>
              <label htmlFor="company-city" className="block text-sm font-semibold text-gray-700 mb-2">
                Ville
              </label>
              {isEditing ? (
                <input
                  id="company-city"
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Ville"
                />
              ) : (
                <p className="text-gray-900 text-lg">{company?.city || '-'}</p>
              )}
            </div>

            {/* Pays */}
            <div>
              <label htmlFor="company-country" className="block text-sm font-semibold text-gray-700 mb-2">
                Pays
              </label>
              {isEditing ? (
                <input
                  id="company-country"
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Pays"
                />
              ) : (
                <p className="text-gray-900 text-lg">{company?.country || '-'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        {isEditing && (
          <div className="bg-white rounded-2xl shadow-lg p-6 flex justify-end gap-4">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.name}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enregistrer
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}
