'use client';

/**
 * Page de gestion de l'entreprise (Employeur) - INTOWORK Brand Design
 *
 * Refonte visuelle avec la charte graphique INTOWORK:
 * - Vert: #6B9B5F (couleur principale)
 * - Or: #F7C700 (accent)
 * - Violet: #6B46C1 (secondaire)
 * - Bleu: #3B82F6 (complémentaire)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useNextAuth';
import { companiesAPI, Company, CompanyStats, getUploadUrl } from '@/lib/api';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import {
  BuildingOffice2Icon,
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  SparklesIcon,
  LinkIcon,
  PhotoIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

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
        companiesAPI.getMyCompany(token).catch(() => null),
        companiesAPI.getCompanyStats(token).catch(() => ({ active_jobs: 0, total_jobs: 0, total_employers: 0, total_applications: 0 }))
      ]);

      setCompany(companyData);
      setStats(statsData);
      if (companyData) {
        setFormData(companyData);
      } else {
        setIsEditing(true);
        toast("Créez votre profil d'entreprise pour commencer", { icon: '🏢' });
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        setIsEditing(true);
        toast("Créez votre profil d'entreprise pour commencer", { icon: '🏢' });
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

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Mon Entreprise" subtitle="Chargement...">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#F7C700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des informations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mon Entreprise" subtitle="Gérez les informations de votre entreprise">
      <div className="space-y-8">
        {/* Hero Section */}
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F7C700] via-[#e5b800] to-[#d4a900] p-8 shadow-xl shadow-[#F7C700]/20"
          style={{ animation: 'fadeIn 0.6s ease-out' }}
        >
          {/* Motifs décoratifs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Logo et infos */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30 overflow-hidden">
                  {company?.logo_url ? (
                    <img
                      src={getUploadUrl(company.logo_url)}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BuildingOffice2Icon className="w-10 h-10 text-white" />
                  )}
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-2">
                    <SparklesIcon className="w-4 h-4 text-white" />
                    <span className="text-white/90 text-sm font-medium">Profil Entreprise</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">
                    {company?.name || 'Nouvelle Entreprise'}
                  </h2>
                  <p className="text-white/80 mt-1">{company?.industry || 'Industrie non définie'}</p>
                </div>
              </div>

              {/* Bouton modifier */}
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  isEditing
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-white text-[#d4a900] hover:bg-white/90 shadow-lg'
                }`}
              >
                {isEditing ? (
                  <>
                    <XMarkIcon className="w-5 h-5" />
                    <span>Annuler</span>
                  </>
                ) : (
                  <>
                    <PencilIcon className="w-5 h-5" />
                    <span>Modifier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            style={{ animation: 'fadeIn 0.6s ease-out 0.1s both' }}
          >
            {[
              { label: 'Offres actives', value: stats.active_jobs, icon: BriefcaseIcon, color: '#6B9B5F' },
              { label: 'Total offres', value: stats.total_jobs, icon: DocumentTextIcon, color: '#3B82F6' },
              { label: 'Recruteurs', value: stats.total_employers, icon: UserGroupIcon, color: '#6B46C1' },
              { label: 'Candidatures', value: stats.total_applications, icon: ArrowTrendingUpIcon, color: '#F7C700' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-5 hover:shadow-xl transition-all"
                style={{ animation: `fadeIn 0.4s ease-out ${0.05 * index}s both` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Informations générales */}
        <div
          className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden"
          style={{ animation: 'fadeIn 0.6s ease-out 0.2s both' }}
        >
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#6B9B5F]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6B9B5F]/10 flex items-center justify-center">
                <InformationCircleIcon className="w-6 h-6 text-[#6B9B5F]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Informations générales</h3>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nom */}
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
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                    placeholder="Nom de votre entreprise"
                  />
                ) : (
                  <p className="text-gray-900 text-lg font-medium py-3">{company?.name || '-'}</p>
                )}
              </div>

              {/* Industrie */}
              <div>
                <label htmlFor="company-industry" className="block text-sm font-semibold text-gray-700 mb-2">
                  Secteur d'activité
                </label>
                {isEditing ? (
                  <input
                    id="company-industry"
                    type="text"
                    value={formData.industry || ''}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                    placeholder="Ex: Technologie, Finance, Santé..."
                  />
                ) : (
                  <p className="text-gray-900 text-lg py-3">{company?.industry || '-'}</p>
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
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="1-10">1-10 employés</option>
                    <option value="11-50">11-50 employés</option>
                    <option value="51-200">51-200 employés</option>
                    <option value="201-500">201-500 employés</option>
                    <option value="500+">500+ employés</option>
                  </select>
                ) : (
                  <p className="text-gray-900 text-lg py-3">{company?.size || '-'}</p>
                )}
              </div>

              {/* Site web */}
              <div>
                <label htmlFor="company-website" className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="inline-flex items-center gap-2">
                    <GlobeAltIcon className="w-4 h-4" />
                    Site web
                  </span>
                </label>
                {isEditing ? (
                  <input
                    id="company-website"
                    type="url"
                    value={formData.website_url || ''}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                    placeholder="https://www.exemple.com"
                  />
                ) : (
                  company?.website_url ? (
                    <a
                      href={company.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#3B82F6] hover:text-[#2563EB] text-lg py-3 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {company.website_url}
                    </a>
                  ) : (
                    <p className="text-gray-400 text-lg py-3">-</p>
                  )
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
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all"
                    placeholder="https://linkedin.com/company/..."
                  />
                ) : (
                  company?.linkedin_url ? (
                    <a
                      href={company.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#0077B5] hover:text-[#005582] text-lg py-3 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      LinkedIn
                    </a>
                  ) : (
                    <p className="text-gray-400 text-lg py-3">-</p>
                  )
                )}
              </div>

              {/* Logo de l'entreprise */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="inline-flex items-center gap-2">
                    <PhotoIcon className="w-4 h-4" />
                    Logo de l'entreprise
                  </span>
                </label>
                
                {company?.logo_url ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={getUploadUrl(company.logo_url)}
                      alt={company.name}
                      className="w-32 h-32 object-contain rounded-xl border-2 border-gray-200 bg-white p-2"
                    />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900 mb-1">{company.name}</p>
                      <p className="text-xs text-gray-500">Pour modifier le logo, allez dans Paramètres → Entreprise</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="w-32 h-32 rounded-xl bg-gray-200 flex items-center justify-center">
                      <PhotoIcon className="w-16 h-16 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900 mb-1">Aucun logo</p>
                      <p className="text-xs text-gray-500">Ajoutez votre logo dans Paramètres → Entreprise</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
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
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B9B5F] focus:ring-4 focus:ring-[#6B9B5F]/10 transition-all resize-none"
                    placeholder="Décrivez votre entreprise, votre mission, votre culture..."
                  />
                ) : (
                  <p className="text-gray-900 text-lg py-3 whitespace-pre-wrap">{company?.description || '-'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div
          className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden"
          style={{ animation: 'fadeIn 0.6s ease-out 0.3s both' }}
        >
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#6B46C1]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6B46C1]/10 flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-[#6B46C1]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Localisation</h3>
            </div>
          </div>

          <div className="p-6">
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
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B46C1] focus:ring-4 focus:ring-[#6B46C1]/10 transition-all"
                    placeholder="Adresse complète"
                  />
                ) : (
                  <p className="text-gray-900 text-lg py-3">{company?.address || '-'}</p>
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
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B46C1] focus:ring-4 focus:ring-[#6B46C1]/10 transition-all"
                    placeholder="Ville"
                  />
                ) : (
                  <p className="text-gray-900 text-lg py-3">{company?.city || '-'}</p>
                )}
              </div>

              {/* Pays */}
              <div className="lg:col-span-2">
                <label htmlFor="company-country" className="block text-sm font-semibold text-gray-700 mb-2">
                  Pays
                </label>
                {isEditing ? (
                  <input
                    id="company-country"
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#6B46C1] focus:ring-4 focus:ring-[#6B46C1]/10 transition-all"
                    placeholder="Pays"
                  />
                ) : (
                  <p className="text-gray-900 text-lg py-3">{company?.country || '-'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        {isEditing && (
          <div
            className="flex justify-end gap-4"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-8 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !formData.name}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/30 hover:shadow-xl hover:shadow-[#6B9B5F]/40 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
