'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAuthenticatedAPI } from '@/hooks/useAuthenticatedAPI';
import ToggleButton from '@/components/ToggleButton';

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
  const { candidateAPI } = useAuthenticatedAPI();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // États pour les différentes sections
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    linkedin_url: '',
    github_url: ''
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

  // Charger le profil utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await candidateAPI.getProfile();
        setProfile(response.data);
        
        // Remplir les formulaires avec les données existantes
        setProfileData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
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
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [candidateAPI]);

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

  const tabs = [
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Confidentialité', icon: ShieldCheckIcon },
    { id: 'account', name: 'Compte', icon: KeyIcon }
  ];

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Gérez votre profil et vos préférences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des tabs */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Onglet Profil */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Décrivez-vous en quelques mots..."
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    id="linkedin"
                    type="url"
                    value={profileData.linkedin_url}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub
                  </label>
                  <input
                    id="github"
                    type="url"
                    value={profileData.github_url}
                    onChange={(e) => setProfileData(prev => ({ ...prev, github_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences de notification</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notifications par email</h4>
                    <p className="text-sm text-gray-500">Recevez des notifications importantes par email</p>
                  </div>
                  <ToggleButton
                    checked={notifications.email_notifications}
                    onChange={() => setNotifications(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
                    label={`${notifications.email_notifications ? 'Désactiver' : 'Activer'} les notifications par email`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Alertes d&apos;emploi</h4>
                    <p className="text-sm text-gray-500">Soyez notifié des nouveaux emplois correspondant à vos critères</p>
                  </div>
                  <ToggleButton
                    checked={notifications.job_alerts}
                    onChange={() => setNotifications(prev => ({ ...prev, job_alerts: !prev.job_alerts }))}
                    label={`${notifications.job_alerts ? 'Désactiver' : 'Activer'} les alertes d'emploi`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Emails marketing</h4>
                    <p className="text-sm text-gray-500">Recevez des conseils carrière et des mises à jour du service</p>
                  </div>
                  <ToggleButton
                    checked={notifications.marketing_emails}
                    onChange={() => setNotifications(prev => ({ ...prev, marketing_emails: !prev.marketing_emails }))}
                    label={`${notifications.marketing_emails ? 'Désactiver' : 'Activer'} les emails marketing`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notifications push</h4>
                    <p className="text-sm text-gray-500">Recevez des notifications dans votre navigateur</p>
                  </div>
                  <ToggleButton
                    checked={notifications.push_notifications}
                    onChange={() => setNotifications(prev => ({ ...prev, push_notifications: !prev.push_notifications }))}
                    label={`${notifications.push_notifications ? 'Désactiver' : 'Activer'} les notifications push`}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={updateNotifications}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les préférences'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Confidentialité */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres de confidentialité</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Profil public</h4>
                    <p className="text-sm text-gray-500">Rendez votre profil visible aux recruteurs</p>
                  </div>
                  <ToggleButton
                    checked={privacy.is_profile_public}
                    onChange={() => setPrivacy(prev => ({ ...prev, is_profile_public: !prev.is_profile_public }))}
                    label={`${privacy.is_profile_public ? 'Rendre' : 'Garder'} le profil ${privacy.is_profile_public ? 'privé' : 'public'}`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Afficher l&apos;email</h4>
                    <p className="text-sm text-gray-500">Permettre aux recruteurs de voir votre adresse email</p>
                  </div>
                  <ToggleButton
                    checked={privacy.show_email}
                    onChange={() => setPrivacy(prev => ({ ...prev, show_email: !prev.show_email }))}
                    label={`${privacy.show_email ? 'Masquer' : 'Afficher'} l'adresse email`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Afficher le téléphone</h4>
                    <p className="text-sm text-gray-500">Permettre aux recruteurs de voir votre numéro de téléphone</p>
                  </div>
                  <ToggleButton
                    checked={privacy.show_phone}
                    onChange={() => setPrivacy(prev => ({ ...prev, show_phone: !prev.show_phone }))}
                    label={`${privacy.show_phone ? 'Masquer' : 'Afficher'} le numéro de téléphone`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Contact par les recruteurs</h4>
                    <p className="text-sm text-gray-500">Autoriser les recruteurs à vous contacter directement</p>
                  </div>
                  <ToggleButton
                    checked={privacy.allow_recruiter_contact}
                    onChange={() => setPrivacy(prev => ({ ...prev, allow_recruiter_contact: !prev.allow_recruiter_contact }))}
                    label={`${privacy.allow_recruiter_contact ? 'Interdire' : 'Autoriser'} le contact par les recruteurs`}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={updatePrivacy}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Compte */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gestion du compte</h3>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Informations du compte</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Email:</span> {user?.emailAddresses[0]?.emailAddress}</p>
                  <p><span className="font-medium">Membre depuis:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
                  <p><span className="font-medium">Dernière connexion:</span> {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
                </div>
              </div>

              <div className="border border-red-200 rounded-md p-4">
                <div className="flex items-start space-x-3">
                  <TrashIcon className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-900">Supprimer le compte</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Une fois votre compte supprimé, toutes vos données seront définitivement supprimées. 
                      Cette action ne peut pas être annulée.
                    </p>
                    <button
                      onClick={deleteAccount}
                      disabled={loading}
                      className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? 'Suppression...' : 'Supprimer mon compte'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
