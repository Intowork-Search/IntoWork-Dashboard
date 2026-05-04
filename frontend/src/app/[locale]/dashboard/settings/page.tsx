'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import { signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { useAuthenticatedAPI } from '@/hooks/useAuthenticatedAPI';
import { companiesAPI, authAPI, getUploadUrl, type CandidateProfile } from '@/lib/api';
import { getApiUrl } from '@/lib/getApiUrl';
import ToggleButton from '@/components/ToggleButton';
import DashboardLayout from '@/components/DashboardLayout';
import ChangePasswordModal from '@/components/settings/ChangePasswordModal';
import ChangeEmailModal from '@/components/settings/ChangeEmailModal';
import { logger } from '@/lib/logger';

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
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const { candidateAPI } = useAuthenticatedAPI();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'candidate' | 'employer' | 'admin' | null>(null);
  
  // États pour upload de logo
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const apiProfile = await candidateAPI.getProfile() as unknown as UserProfile;
          setUserRole('candidate');
          setProfile(apiProfile);

          setProfileData({
            first_name: apiProfile.first_name || user?.firstName || '',
            last_name: apiProfile.last_name || user?.lastName || '',
            phone: apiProfile.phone || '',
            location: apiProfile.location || '',
            bio: apiProfile.bio || '',
            website: apiProfile.website || '',
            linkedin_url: apiProfile.linkedin_url || '',
            github_url: apiProfile.github_url || ''
          });

          setNotifications({
            email_notifications: apiProfile.email_notifications ?? true,
            job_alerts: apiProfile.job_alerts ?? true,
            marketing_emails: apiProfile.marketing_emails ?? false,
            push_notifications: true
          });

          setPrivacy({
            is_profile_public: apiProfile.is_profile_public ?? true,
            show_email: false,
            show_phone: false,
            allow_recruiter_contact: true
          });
        } catch {
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
          } catch {
            if (user?.role === 'admin') {
              setUserRole('admin');
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
            } else {
              toast.error(t('loadInfoError'));
            }
          }
        }
      } catch (error) {
        logger.error("Erreur lors du chargement du profil:", error);
        toast.error(t('loadProfileError'));

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

    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (userRole === 'employer' && activeTab === 'profile') {
      setActiveTab('company');
    }
    if (userRole === 'admin' && activeTab === 'company') {
      setActiveTab('profile');
    }
  }, [userRole, activeTab]);

  const updateProfile = async () => {
    try {
      setLoading(true);
      await candidateAPI.updateProfile(profileData as unknown as Partial<CandidateProfile>);
      toast.success(t('profileSuccess'));
    } catch (error) {
      logger.error("Erreur lors de la mise a jour:", error);
      toast.error(t('profileError'));
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
      toast.success(t('companySuccess'));
      
      // Recharger les données pour avoir le logo mis à jour
      const updatedCompany = await companiesAPI.getMyCompany(token);
      setCompanyData({
        name: updatedCompany.name || '',
        description: updatedCompany.description || '',
        industry: updatedCompany.industry || '',
        size: updatedCompany.size || '',
        website_url: updatedCompany.website_url || '',
        linkedin_url: updatedCompany.linkedin_url || '',
        address: updatedCompany.address || '',
        city: updatedCompany.city || '',
        country: updatedCompany.country || '',
        logo_url: updatedCompany.logo_url || ''
      });
    } catch (error) {
      logger.error("Erreur lors de la mise a jour:", error);
      toast.error(t('companyError'));
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'upload du logo
  const handleLogoUpload = async (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(t('logoTypeError'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('logoSizeError'));
      return;
    }

    try {
      setIsUploadingLogo(true);
      const token = await getToken();
      if (!token) {
        toast.error(t('authError'));
        return;
      }

      const formData = new FormData();
      formData.append('logo', file);

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/companies/my-company/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(t('logoSuccess'));
        // Mettre à jour le logo dans le state
        setCompanyData(prev => ({ ...prev, logo_url: data.logo_url }));
        
        // Notifier la Sidebar du changement de logo
        window.dispatchEvent(new CustomEvent('company-logo-updated', { detail: data.logo_url }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || t('logoError'));
      }
    } catch (error) {
      logger.error("Erreur lors du telechargement du logo:", error);
      toast.error(t('logoUploadError'));
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleLogoUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleLogoUpload(files[0]);
    }
  };

  const updateNotifications = async () => {
    try {
      setLoading(true);
      await candidateAPI.updateProfile({
        email_notifications: notifications.email_notifications,
        job_alerts: notifications.job_alerts,
        push_notifications: notifications.push_notifications,
      } as unknown as Partial<CandidateProfile>);
      toast.success(t('notifSuccess'));
    } catch (error) {
      logger.error("Erreur lors de la mise a jour:", error);
      toast.error(t('notifError'));
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacy = async () => {
    try {
      setLoading(true);
      await candidateAPI.updateProfile({ is_profile_public: privacy.is_profile_public } as unknown as Partial<CandidateProfile>);
      toast.success(t('privacySuccess'));
    } catch (error) {
      logger.error("Erreur lors de la mise a jour:", error);
      toast.error(t('privacyError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    const token = await getToken();
    if (!token) throw new Error('Non authentifié');

    await authAPI.changePassword(token, currentPassword, newPassword);
    toast.success(t('passwordSuccess'));
  };

  const handleChangeEmail = async (newEmail: string, password: string) => {
    const token = await getToken();
    if (!token) throw new Error('Non authentifié');

    await authAPI.changeEmail(token, newEmail, password);
    toast.success(t('emailSuccess'));
    globalThis.location?.reload();
  };

  const deleteAccount = async () => {
    if (globalThis.confirm?.('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        setLoading(true);

        const token = await getToken();
        if (!token) {
          toast.error(t('notAuthenticated'));
          return;
        }

        await authAPI.deleteAccount(token);
        toast.success(t('deleteSuccess'));
        await signOut({ redirect: false });
        globalThis.location.href = '/signin';
      } catch (error) {
        logger.error("Erreur lors de la suppression:", error);
        toast.error(t('deleteAccountError'));
      } finally {
        setLoading(false);
      }
    }
  };

  const tabs = userRole === 'admin' ? [
    { id: 'profile', name: t('profile'), icon: UserIcon, color: '#6B9B5F' },
    { id: 'account', name: t('account'), icon: KeyIcon, color: '#6B46C1' }
  ] : userRole === 'employer' ? [
    { id: 'company', name: t('companyTab'), icon: BuildingOfficeIcon, color: '#F7C700' },
    { id: 'notifications', name: t('notifications'), icon: BellIcon, color: '#3B82F6' },
    { id: 'account', name: t('account'), icon: KeyIcon, color: '#6B46C1' }
  ] : [
    { id: 'profile', name: t('profile'), icon: UserIcon, color: '#6B9B5F' },
    { id: 'notifications', name: t('notifications'), icon: BellIcon, color: '#3B82F6' },
    { id: 'privacy', name: t('privacy'), icon: ShieldCheckIcon, color: '#F7C700' },
    { id: 'account', name: t('account'), icon: KeyIcon, color: '#6B46C1' }
  ];

  if (loading && !profile) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('loadingSubtitle')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#6B9B5F]/20 border-t-[#6B9B5F] mx-auto"></div>
              <Cog6ToothIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#6B9B5F]" />
            </div>
            <p className="mt-4 text-gray-600 font-medium">{t('loadingSettings')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#6B9B5F] via-[#5a8a4f] to-[#6B46C1] rounded-b-[3rem] px-6 py-10 mb-8">
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white"></div>
            <div className="absolute bottom-10 right-20 w-48 h-48 rounded-full bg-white"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-white"></div>
          </div>

          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <Cog6ToothIcon className="w-8 h-8 text-white" />
              </div>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium">
                {t('title')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('heroTitle')}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>

        <div className="px-6 pb-10 animate-fadeIn">
          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm shadow-gray-100/80 dark:shadow-black/20 p-2 mb-8 border border-gray-100 dark:border-gray-700">
            <nav className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 font-semibold text-sm flex items-center justify-center gap-2 rounded-2xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#6B9B5F] to-[#6B46C1] text-white shadow-lg shadow-[#6B9B5F]/30'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="hidden sm:block">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm shadow-gray-100/80 dark:shadow-black/20 overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#6B9B5F]/10 p-4 rounded-2xl">
                    <UserIcon className="w-8 h-8 text-[#6B9B5F]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{t('personalInfo')}</h3>
                    <p className="text-gray-600">{t('profileSubtitle')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('firstName')}
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Votre prénom"
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('lastName')}
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('phone')}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Votre numéro de téléphone"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('location')}
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Votre ville ou région"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('bio')}
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                      placeholder="Décrivez votre profil professionnel, vos compétences et vos objectifs..."
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('websitePersonal')}
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="https://monsite.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('linkedinProfile')}
                    </label>
                    <input
                      id="linkedin"
                      type="url"
                      value={profileData.linkedin_url}
                      onChange={(e) => setProfileData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="https://linkedin.com/in/monprofil"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="github" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('githubProfile')}
                    </label>
                    <input
                      id="github"
                      type="url"
                      value={profileData.github_url}
                      onChange={(e) => setProfileData(prev => ({ ...prev, github_url: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="https://github.com/monprofil"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={updateProfile}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white rounded-2xl hover:shadow-lg hover:shadow-[#6B9B5F]/30 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? tc('loading') : tc('save')}
                  </button>
                </div>
              </div>
            )}

            {/* Company Tab */}
            {activeTab === 'company' && userRole === 'employer' && (
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#F7C700]/10 p-4 rounded-2xl">
                    <BuildingOfficeIcon className="w-8 h-8 text-[#F7C700]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{t('companyInfo')}</h3>
                    <p className="text-gray-600">Mettez à jour les informations pour attirer les meilleurs talents</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="company_name" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('companyName')} *
                    </label>
                    <input
                      id="company_name"
                      type="text"
                      value={companyData.name}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7C700]/20 focus:border-[#F7C700] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="company_description" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('description')}
                    </label>
                    <textarea
                      id="company_description"
                      value={companyData.description}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7C700]/20 focus:border-[#F7C700] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Décrivez votre entreprise, votre mission et votre culture..."
                    />
                  </div>

                  <div>
                    <label htmlFor="industry" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('industry')}
                    </label>
                    <input
                      id="industry"
                      type="text"
                      value={companyData.industry}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7C700]/20 focus:border-[#F7C700] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="ex: Technologie, Finance, Santé..."
                    />
                  </div>

                  <div>
                    <label htmlFor="size" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('size')}
                    </label>
                    <select
                      id="size"
                      value={companyData.size}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, size: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7C700]/20 focus:border-[#F7C700] transition-all duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">{t('selectSize')}</option>
                      <option value="1-10">1-10 employés</option>
                      <option value="11-50">11-50 employés</option>
                      <option value="51-200">51-200 employés</option>
                      <option value="201-500">201-500 employés</option>
                      <option value="501-1000">501-1000 employés</option>
                      <option value="1000+">1000+ employés</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="website_url" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('website')}
                    </label>
                    <input
                      id="website_url"
                      type="url"
                      value={companyData.website_url}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, website_url: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7C700]/20 focus:border-[#F7C700] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="https://www.votresite.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company_linkedin" className="block text-sm font-bold text-gray-800 mb-2">
                      LinkedIn
                    </label>
                    <input
                      id="company_linkedin"
                      type="url"
                      value={companyData.linkedin_url}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7C700]/20 focus:border-[#F7C700] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('address')}
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={companyData.address}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7C700]/20 focus:border-[#F7C700] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Adresse complète"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('city')}
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={companyData.city}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7C700]/20 focus:border-[#F7C700] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Ville"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-bold text-gray-800 mb-2">
                      {t('country')}
                    </label>
                    <input
                      id="country"
                      type="text"
                      value={companyData.country}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7C700]/20 focus:border-[#F7C700] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder={t('countryPlaceholder')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      {t('logoLabel')}
                    </label>
                    
                    {/* Logo actuel */}
                    {companyData.logo_url && (
                      <div className="mb-4 flex items-center gap-4">
                        <img
                          src={getUploadUrl(companyData.logo_url)}
                          alt="Logo actuel"
                          className="w-20 h-20 object-contain rounded-lg border-2 border-gray-200"
                        />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{t('logoCurrentLabel')}</p>
                          <p className="text-xs text-gray-500">{t('logoReplaceHint')}</p>
                        </div>
                      </div>
                    )}

                    {/* Zone d'upload avec drag & drop */}
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        isDraggingLogo
                          ? 'border-[#F7C700] bg-[#F7C700]/5'
                          : 'border-gray-300 hover:border-[#F7C700] hover:bg-gray-50'
                      } ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
                    >
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploadingLogo}
                      />
                      
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          isDraggingLogo ? 'bg-[#F7C700]' : 'bg-gray-100'
                        } transition-colors`}>
                          {isUploadingLogo ? (
                            <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <ArrowUpTrayIcon className={`w-7 h-7 ${isDraggingLogo ? 'text-white' : 'text-gray-400'}`} />
                          )}
                        </div>
                        
                        <div>
                          <p className="text-gray-700 font-medium mb-1">
                            {isUploadingLogo ? t('logoUploading') : isDraggingLogo ? t('logoDropHere') : t('logoClickOrDrop')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t('logoFormats')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={updateCompany}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-[#F7C700] to-[#e0b400] text-gray-900 rounded-2xl hover:shadow-lg hover:shadow-[#F7C700]/30 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? tc('loading') : tc('save')}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#3B82F6]/10 p-4 rounded-2xl">
                    <BellIcon className="w-8 h-8 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{t('notifTitle')}</h3>
                    <p className="text-gray-600">{t('notifSubtitle')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#6B9B5F]/10 p-3 rounded-xl">
                        <BellIcon className="w-6 h-6 text-[#6B9B5F]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{t('notifEmail')}</h4>
                        <p className="text-sm text-gray-600 mt-1">{t('notifEmailDesc')}</p>
                      </div>
                    </div>
                    <ToggleButton
                      checked={notifications.email_notifications}
                      onChange={() => setNotifications(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
                      label={`${notifications.email_notifications ? tc('disable') : tc('enable')} ${t('notifEmail').toLowerCase()}`}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#6B46C1]/10 p-3 rounded-xl">
                        <SparklesIcon className="w-6 h-6 text-[#6B46C1]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{t('notifJobAlerts')}</h4>
                        <p className="text-sm text-gray-600 mt-1">{t('notifJobAlertsDesc')}</p>
                      </div>
                    </div>
                    <ToggleButton
                      checked={notifications.job_alerts}
                      onChange={() => setNotifications(prev => ({ ...prev, job_alerts: !prev.job_alerts }))}
                      label={`${notifications.job_alerts ? tc('disable') : tc('enable')} ${t('notifJobAlerts').toLowerCase()}`}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#F7C700]/10 p-3 rounded-xl">
                        <BellIcon className="w-6 h-6 text-[#F7C700]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{t('notifMarketing')}</h4>
                        <p className="text-sm text-gray-600 mt-1">{t('notifMarketingDesc')}</p>
                      </div>
                    </div>
                    <ToggleButton
                      checked={notifications.marketing_emails}
                      onChange={() => setNotifications(prev => ({ ...prev, marketing_emails: !prev.marketing_emails }))}
                      label={`${notifications.marketing_emails ? tc('disable') : tc('enable')} ${t('notifMarketing').toLowerCase()}`}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#3B82F6]/10 p-3 rounded-xl">
                        <BellIcon className="w-6 h-6 text-[#3B82F6]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{t('notifPush')}</h4>
                        <p className="text-sm text-gray-600 mt-1">{t('notifPushDesc')}</p>
                      </div>
                    </div>
                    <ToggleButton
                      checked={notifications.push_notifications}
                      onChange={() => setNotifications(prev => ({ ...prev, push_notifications: !prev.push_notifications }))}
                      label={`${notifications.push_notifications ? tc('disable') : tc('enable')} ${t('notifPush').toLowerCase()}`}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={updateNotifications}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563eb] text-white rounded-2xl hover:shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? tc('loading') : tc('save')}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#F7C700]/10 p-4 rounded-2xl">
                    <ShieldCheckIcon className="w-8 h-8 text-[#F7C700]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{t('privacyTitle')}</h3>
                    <p className="text-gray-600">{t('privacySubtitle')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#6B9B5F]/10 p-3 rounded-xl">
                        <UserIcon className="w-6 h-6 text-[#6B9B5F]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{t('privacyPublicProfile')}</h4>
                        <p className="text-sm text-gray-600 mt-1">{t('privacyPublicProfileDesc')}</p>
                      </div>
                    </div>
                    <ToggleButton
                      checked={privacy.is_profile_public}
                      onChange={() => setPrivacy(prev => ({ ...prev, is_profile_public: !prev.is_profile_public }))}
                      label={`${privacy.is_profile_public ? tc('hide') : tc('show')} ${t('privacyPublicProfile').toLowerCase()}`}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#6B46C1]/10 p-3 rounded-xl">
                        <BellIcon className="w-6 h-6 text-[#6B46C1]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{t('privacyShowEmail')}</h4>
                        <p className="text-sm text-gray-600 mt-1">{t('privacyShowEmailDesc')}</p>
                      </div>
                    </div>
                    <ToggleButton
                      checked={privacy.show_email}
                      onChange={() => setPrivacy(prev => ({ ...prev, show_email: !prev.show_email }))}
                      label={`${privacy.show_email ? tc('hide') : tc('show')} ${t('privacyShowEmail').toLowerCase()}`}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#F7C700]/10 p-3 rounded-xl">
                        <BellIcon className="w-6 h-6 text-[#F7C700]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{t('privacyShowPhone')}</h4>
                        <p className="text-sm text-gray-600 mt-1">{t('privacyShowPhoneDesc')}</p>
                      </div>
                    </div>
                    <ToggleButton
                      checked={privacy.show_phone}
                      onChange={() => setPrivacy(prev => ({ ...prev, show_phone: !prev.show_phone }))}
                      label={`${privacy.show_phone ? tc('hide') : tc('show')} ${t('privacyShowPhone').toLowerCase()}`}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#3B82F6]/10 p-3 rounded-xl">
                        <ShieldCheckIcon className="w-6 h-6 text-[#3B82F6]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{t('privacyRecruiterContact')}</h4>
                        <p className="text-sm text-gray-600 mt-1">{t('privacyRecruiterContactDesc')}</p>
                      </div>
                    </div>
                    <ToggleButton
                      checked={privacy.allow_recruiter_contact}
                      onChange={() => setPrivacy(prev => ({ ...prev, allow_recruiter_contact: !prev.allow_recruiter_contact }))}
                      label={`${privacy.allow_recruiter_contact ? tc('disable') : tc('enable')} ${t('privacyRecruiterContact').toLowerCase()}`}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={updatePrivacy}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-[#F7C700] to-[#e0b400] text-gray-900 rounded-2xl hover:shadow-lg hover:shadow-[#F7C700]/30 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? tc('loading') : tc('save')}
                  </button>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#6B46C1]/10 p-4 rounded-2xl">
                    <KeyIcon className="w-8 h-8 text-[#6B46C1]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{t('accountManagement')}</h3>
                    <p className="text-gray-600">{t('accountManagementDesc')}</p>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-gradient-to-r from-[#6B9B5F]/5 to-[#6B46C1]/5 p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">{t('accountInfo')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">{t('emailAddress')}</p>
                      <p className="text-sm font-bold text-gray-900">{user?.email}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">{t('fullName')}</p>
                      <p className="text-sm font-bold text-gray-900">{user?.fullName || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">{t('role')}</p>
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                        user?.role === 'admin' ? 'bg-[#6B46C1]/10 text-[#6B46C1]' :
                        user?.role === 'candidate' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
                        'bg-[#6B9B5F]/10 text-[#6B9B5F]'
                      }`}>
                        {user?.role === 'candidate' ? t('roleCandidate') : user?.role === 'admin' ? t('roleAdmin') : t('roleEmployer')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-[#6B9B5F]" />
                    {t('security')}
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    {t('securityDesc')}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <div>
                        <h5 className="text-base font-bold text-gray-900">{t('password')}</h5>
                        <p className="text-sm text-gray-500 mt-1">{t('lastModified')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="px-5 py-2.5 text-[#6B46C1] bg-[#6B46C1]/10 hover:bg-[#6B46C1]/20 rounded-xl transition-all duration-200 text-sm font-bold"
                      >
                        {t('changePassword')}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <div>
                        <h5 className="text-base font-bold text-gray-900">{t('emailAddress')}</h5>
                        <p className="text-sm text-gray-500 mt-1">{t('currentlyEmail', { email: user?.email ?? '' })}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(true)}
                        className="px-5 py-2.5 text-[#3B82F6] bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 rounded-xl transition-all duration-200 text-sm font-bold"
                      >
                        {t('editEmail')}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <div>
                        <h5 className="text-base font-bold text-gray-900">{t('twoFactor')}</h5>
                        <p className="text-sm text-gray-500 mt-1">{t('twoFactorDesc')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast(t('comingSoon2fa'))}
                        className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 text-sm font-bold"
                      >
                        {t('enable2fa')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-3 rounded-xl shrink-0">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-red-900 mb-2">{t('dangerZone')}</h4>
                      <p className="text-sm text-red-700 mb-4">
                        {t('dangerZoneDesc')}
                      </p>
                      <button
                        type="button"
                        onClick={deleteAccount}
                        disabled={loading}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? tc('loading') : t('deleteAccount')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
      />

      <ChangeEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleChangeEmail}
        currentEmail={user?.email || ''}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
}
