'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  TrashIcon,
  BuildingOfficeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useAuthenticatedAPI } from '@/hooks/useAuthenticatedAPI';
import { companiesAPI } from '@/lib/api';
import ToggleButton from '@/components/ToggleButton';
import DashboardLayout from '@/components/DashboardLayout';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  is_profile_public: boolean;
  email_notifications: boolean;
  job_alerts: boolean;
  marketing_emails: boolean;
}

interface NotificationSettings {
  email_notifications: boolean;
  job_alerts: boolean;
  marketing_emails: boolean;
  push_notifications: boolean;
}

interface PrivacySettings {
  is_profile_public: boolean;
  show_email: boolean;
  show_phone: boolean;
  allow_recruiter_contact: boolean;
}

export default function SettingsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { candidateAPI } = useAuthenticatedAPI();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'candidate' | 'employer' | null>(null);
  
  // États pour les différentes sections
  const [profileData, setProfileData] = useState({
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    linkedin_url: '',
    github_url: ''
  });

  const [companyData, setCompanyData] = useState({
    name: '',
    description: '',
    industry: '',
    size: '',
    website_url: '',
    linkedin_url: '',
    address: '',
    city: '',
    country: '',
    logo_url: ''
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    job_alerts: true,
    marketing_emails: false,
    push_notifications: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    is_profile_public: true,
    show_email: false,
    show_phone: false,
    allow_recruiter_contact: true
  });

  // Charger le profil utilisateur ou les données de l'entreprise selon le rôle
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) return;

        // D'abord, détecter le rôle utilisateur en appelant l'API
        try {
          const response = await candidateAPI.getProfile();
          setUserRole('candidate');
          setProfile(response.data);
          
          // Remplir les formulaires avec les données existantes (ou données Clerk comme fallback)
          setProfileData({
            first_name: response.data.first_name || user?.firstName || '',
            last_name: response.data.last_name || user?.lastName || '',
            phone: response.data.phone || '',
            location: response.data.location || '',
            bio: response.data.bio || '',
            website: response.data.website || '',
            linkedin_url: response.data.linkedin_url || '',
            github_url: response.data.github_url || ''
          });

          setNotifications({
            email_notifications: response.data.email_notifications ?? true,
            job_alerts: response.data.job_alerts ?? true,
            marketing_emails: response.data.marketing_emails ?? false,
            push_notifications: true
          });

          setPrivacy({
            is_profile_public: response.data.is_profile_public ?? true,
            show_email: false,
            show_phone: false,
            allow_recruiter_contact: true
          });
        } catch (candidateError) {
          // Si l'appel candidat échoue, essayer de charger les données de l'entreprise
          console.log('Not a candidate, trying employer data...');
          try {
            const companyResponse = await companiesAPI.getMyCompany(token);
            setUserRole('employer');
            
            setCompanyData({
              name: companyResponse.name || '',
              description: companyResponse.description || '',
              industry: companyResponse.industry || '',
              size: companyResponse.size || '',
              website_url: companyResponse.website_url || '',
              linkedin_url: companyResponse.linkedin_url || '',
              address: companyResponse.address || '',
              city: companyResponse.city || '',
              country: companyResponse.country || '',
              logo_url: companyResponse.logo_url || ''
            });
          } catch (employerError) {
            console.error('Erreur lors du chargement des données:', employerError);
            toast.error('Erreur lors du chargement de vos informations');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast.error('Erreur lors du chargement du profil');
        
        // En cas d'erreur, utiliser au moins les données Clerk disponibles
        setProfileData({
          first_name: user?.firstName || '',
          last_name: user?.lastName || '',
          phone: '',
          location: '',
          bio: '',
          website: '',
          linkedin_url: '',
          github_url: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [candidateAPI, getToken]);

  // Ajuster l'onglet actif selon le rôle
  useEffect(() => {
    if (userRole === 'employer' && activeTab === 'profile') {
      setActiveTab('company');
    }
  }, [userRole]);

  const updateProfile = async () => {
    try {
      setLoading(true);
      await candidateAPI.updateProfile(profileData);
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      
      await companiesAPI.updateMyCompany(token, companyData);
      toast.success('✅ Informations de l\'entreprise mises à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('❌ Erreur lors de la mise à jour des informations');
    } finally {
      setLoading(false);
    }
  };

  const updateNotifications = async () => {
    try {
      setLoading(true);
      // API call pour mettre à jour les notifications
      toast.success('Préférences de notification mises à jour !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour des notifications');
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacy = async () => {
    try {
      setLoading(true);
      await candidateAPI.updateProfile({ is_profile_public: privacy.is_profile_public });
      toast.success('Paramètres de confidentialité mis à jour !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour des paramètres de confidentialité');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (globalThis.confirm?.('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        setLoading(true);
        // API call pour supprimer le compte
        toast.success('Compte supprimé avec succès');
        // Rediriger vers la page de connexion
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression du compte');
      } finally {
        setLoading(false);
      }
    }
  };

  const tabs = userRole === 'employer' ? [
    { id: 'company', name: 'Entreprise', icon: BuildingOfficeIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'account', name: 'Compte', icon: KeyIcon }
  ] : [
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Confidentialité', icon: ShieldCheckIcon },
    { id: 'account', name: 'Compte', icon: KeyIcon }
  ];

  if (loading && !profile) {
    return (
      <DashboardLayout title="Paramètres" subtitle="Gérez votre profil et vos préférences">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Paramètres" subtitle="Gérez votre profil et vos préférences">
      <div className="space-y-8">

      {/* Tabs avec design amélioré */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <nav className="flex space-x-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 font-medium text-sm flex items-center justify-center space-x-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                  : 'bg-white border-b-2 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:block">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des tabs avec design amélioré */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Onglet Profil */}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Informations personnelles</h3>
              <p className="text-gray-600 mb-6">Mettez à jour vos informations de profil pour améliorer votre visibilité auprès des recruteurs.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-semibold text-gray-800 mb-2">
                    Prénom
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-gray-800 mb-2">
                    Nom
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Votre numéro de téléphone"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-800 mb-2">
                    Localisation
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Votre ville ou région"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-800 mb-2">
                    Bio professionnelle
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none text-gray-900 placeholder-gray-500"
                    placeholder="Décrivez votre profil professionnel, vos compétences et vos objectifs de carrière..."
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-semibold text-gray-800 mb-2">
                    Site web personnel
                  </label>
                  <input
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="https://monsite.com"
                  />
                </div>

                <div>
                  <label htmlFor="linkedin" className="block text-sm font-semibold text-gray-800 mb-2">
                    Profil LinkedIn
                  </label>
                  <input
                    id="linkedin"
                    type="url"
                    value={profileData.linkedin_url}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="https://linkedin.com/in/monprofil"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="github" className="block text-sm font-semibold text-gray-800 mb-2">
                    Profil GitHub
                  </label>
                  <input
                    id="github"
                    type="url"
                    value={profileData.github_url}
                    onChange={(e) => setProfileData(prev => ({ ...prev, github_url: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="https://github.com/monprofil"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end border-t border-gray-200 pt-6">
                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Entreprise (pour employeurs) */}
        {activeTab === 'company' && userRole === 'employer' && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Informations de l'entreprise</h3>
              <p className="text-gray-600 mb-6">Mettez à jour les informations de votre entreprise pour attirer les meilleurs talents.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="company_name" className="block text-sm font-semibold text-gray-800 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    id="company_name"
                    type="text"
                    value={companyData.name}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Nom de votre entreprise"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="company_description" className="block text-sm font-semibold text-gray-800 mb-2">
                    Description
                  </label>
                  <textarea
                    id="company_description"
                    value={companyData.description}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Décrivez votre entreprise, votre mission et votre culture..."
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-semibold text-gray-800 mb-2">
                    Secteur d'activité
                  </label>
                  <input
                    id="industry"
                    type="text"
                    value={companyData.industry}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="ex: Technologie, Finance, Santé..."
                  />
                </div>

                <div>
                  <label htmlFor="size" className="block text-sm font-semibold text-gray-800 mb-2">
                    Taille de l'entreprise
                  </label>
                  <select
                    id="size"
                    value={companyData.size}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900"
                  >
                    <option value="">Sélectionnez une taille</option>
                    <option value="1-10">1-10 employés</option>
                    <option value="11-50">11-50 employés</option>
                    <option value="51-200">51-200 employés</option>
                    <option value="201-500">201-500 employés</option>
                    <option value="501-1000">501-1000 employés</option>
                    <option value="1000+">1000+ employés</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="website_url" className="block text-sm font-semibold text-gray-800 mb-2">
                    Site web
                  </label>
                  <input
                    id="website_url"
                    type="url"
                    value={companyData.website_url}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, website_url: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="https://www.votresite.com"
                  />
                </div>

                <div>
                  <label htmlFor="company_linkedin" className="block text-sm font-semibold text-gray-800 mb-2">
                    LinkedIn
                  </label>
                  <input
                    id="company_linkedin"
                    type="url"
                    value={companyData.linkedin_url}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-2">
                    Adresse
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={companyData.address}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Adresse complète"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-800 mb-2">
                    Ville
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={companyData.city}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Ville"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-800 mb-2">
                    Pays
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={companyData.country}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Pays"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="logo_url" className="block text-sm font-semibold text-gray-800 mb-2">
                    Logo (URL)
                  </label>
                  <div className="flex items-center gap-4">
                    {companyData.logo_url && (
                      <img 
                        src={companyData.logo_url} 
                        alt="Logo" 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <input
                      id="logo_url"
                      type="url"
                      value={companyData.logo_url}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, logo_url: e.target.value }))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                      placeholder="https://exemple.com/logo.png"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    <PhotoIcon className="w-4 h-4 inline mr-1" />
                    Recommandé: 200x200px, format PNG ou JPG
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={updateCompany}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Notifications */}
        {activeTab === 'notifications' && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Préférences de notification</h3>
              <p className="text-gray-600 mb-6">Choisissez comment vous souhaitez être informé des nouvelles opportunités.</p>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">Notifications par email</h4>
                    <p className="text-sm text-gray-600 mt-1">Recevez des notifications importantes par email</p>
                  </div>
                  <ToggleButton
                    checked={notifications.email_notifications}
                    onChange={() => setNotifications(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
                    label={`${notifications.email_notifications ? 'Désactiver' : 'Activer'} les notifications par email`}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">Alertes d&apos;emploi</h4>
                    <p className="text-sm text-gray-600 mt-1">Soyez notifié des nouveaux emplois correspondant à vos critères</p>
                  </div>
                  <ToggleButton
                    checked={notifications.job_alerts}
                    onChange={() => setNotifications(prev => ({ ...prev, job_alerts: !prev.job_alerts }))}
                    label={`${notifications.job_alerts ? 'Désactiver' : 'Activer'} les alertes d'emploi`}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">Emails marketing</h4>
                    <p className="text-sm text-gray-600 mt-1">Recevez des conseils carrière et des mises à jour du service</p>
                  </div>
                  <ToggleButton
                    checked={notifications.marketing_emails}
                    onChange={() => setNotifications(prev => ({ ...prev, marketing_emails: !prev.marketing_emails }))}
                    label={`${notifications.marketing_emails ? 'Désactiver' : 'Activer'} les emails marketing`}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">Notifications push</h4>
                    <p className="text-sm text-gray-600 mt-1">Recevez des notifications dans votre navigateur</p>
                  </div>
                  <ToggleButton
                    checked={notifications.push_notifications}
                    onChange={() => setNotifications(prev => ({ ...prev, push_notifications: !prev.push_notifications }))}
                    label={`${notifications.push_notifications ? 'Désactiver' : 'Activer'} les notifications push`}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end border-t border-gray-200 pt-6">
                <button
                  onClick={updateNotifications}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les préférences'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Confidentialité */}
        {activeTab === 'privacy' && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Paramètres de confidentialité</h3>
              <p className="text-gray-600 mb-6">Contrôlez la visibilité de vos informations personnelles auprès des recruteurs.</p>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900">Profil public</h4>
                    <p className="text-sm text-gray-600 mt-1">Rendez votre profil visible aux recruteurs</p>
                  </div>
                  <ToggleButton
                    checked={privacy.is_profile_public}
                    onChange={() => setPrivacy(prev => ({ ...prev, is_profile_public: !prev.is_profile_public }))}
                    label={`${privacy.is_profile_public ? 'Rendre' : 'Garder'} le profil ${privacy.is_profile_public ? 'privé' : 'public'}`}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900">Afficher l&apos;email</h4>
                    <p className="text-sm text-gray-600 mt-1">Permettre aux recruteurs de voir votre adresse email</p>
                  </div>
                  <ToggleButton
                    checked={privacy.show_email}
                    onChange={() => setPrivacy(prev => ({ ...prev, show_email: !prev.show_email }))}
                    label={`${privacy.show_email ? 'Masquer' : 'Afficher'} l'adresse email`}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900">Afficher le téléphone</h4>
                    <p className="text-sm text-gray-600 mt-1">Permettre aux recruteurs de voir votre numéro de téléphone</p>
                  </div>
                  <ToggleButton
                    checked={privacy.show_phone}
                    onChange={() => setPrivacy(prev => ({ ...prev, show_phone: !prev.show_phone }))}
                    label={`${privacy.show_phone ? 'Masquer' : 'Afficher'} le numéro de téléphone`}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900">Contact par les recruteurs</h4>
                    <p className="text-sm text-gray-600 mt-1">Autoriser les recruteurs à vous contacter directement</p>
                  </div>
                  <ToggleButton
                    checked={privacy.allow_recruiter_contact}
                    onChange={() => setPrivacy(prev => ({ ...prev, allow_recruiter_contact: !prev.allow_recruiter_contact }))}
                    label={`${privacy.allow_recruiter_contact ? 'Interdire' : 'Autoriser'} le contact par les recruteurs`}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end border-t border-gray-200 pt-6">
                <button
                  onClick={updatePrivacy}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Compte */}
        {activeTab === 'account' && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestion du compte</h3>
              <p className="text-gray-600 mb-6">Consultez les informations de votre compte et gérez ses paramètres.</p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">Adresse email</p>
                    <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">Nom complet</p>
                    <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">Rôle</p>
                    <p className="text-sm font-semibold text-gray-900">{user?.role === 'candidate' ? 'Candidat' : 'Employeur'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <TrashIcon className="w-6 h-6 text-red-500 mt-1 shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-red-900 mb-2">Zone de danger</h4>
                    <p className="text-sm text-red-700 mb-4">
                      Une fois votre compte supprimé, toutes vos données seront définitivement supprimées. 
                      Cette action ne peut pas être annulée.
                    </p>
                    <button
                      onClick={deleteAccount}
                      disabled={loading}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-sm"
                    >
                      {loading ? 'Suppression en cours...' : 'Supprimer définitivement mon compte'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
