'use client';

/**
 * Page des Intégrations (Employeur) - INTOWORK Brand Design
 *
 * Design conforme à la charte graphique INTOWORK:
 * - Vert: #6B9B5F (couleur principale)
 * - Or: #F7C700 (accent)
 * - Violet: #6B46C1 (secondaire)
 * - Bleu: #3B82F6 (complémentaire)
 */

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logger';
import DashboardLayout from '@/components/DashboardLayout';
import OnboardingTour from '@/components/OnboardingTour';
import { integrationsTour } from '@/config/onboardingTours';
import { integrationsAPI, Integration, IntegrationStatus } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  LinkIcon,
  CalendarIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

export default function IntegrationsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('integrations');
  const tc = useTranslations('common');

  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const { confirm, isOpen: isConfirmOpen, options: confirmOptions, handleConfirm, handleCancel } = useConfirmModal();

  // Charger le statut des intégrations
  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        router.push('/signin');
        return;
      }

      const status = await integrationsAPI.getStatus(token);
      setIntegrations(status);
    } catch (error: unknown) {
      logger.error("Error loading integrations:", error);
      toast.error(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();

    // Vérifier si on revient d'un callback OAuth
    const provider = searchParams.get('provider');
    const success = searchParams.get('success');
    
    if (provider && success === 'true') {
      const providerLabel = provider === 'google-calendar' ? 'Google Calendar' : provider === 'linkedin' ? 'LinkedIn' : 'Outlook';
      toast.success(`✅ ${providerLabel} ${t('connectSuccess')} !`);
      // Recharger les intégrations
      loadIntegrations();
      // Nettoyer l'URL
      router.replace('/dashboard/integrations');
    } else if (provider && success === 'false') {
      const error = searchParams.get('error') || tc('error');
      toast.error(`❌ ${t('connectError')} ${provider}: ${error}`);
      router.replace('/dashboard/integrations');
    }
  }, []);

  // Connecter une intégration (redirection OAuth)
  const handleConnect = async (provider: 'linkedin' | 'google-calendar' | 'outlook') => {
    try {
      setConnectingProvider(provider);
      const token = await getToken();
      if (!token) {
        router.push('/signin');
        return;
      }

      let authUrlData;
      if (provider === 'linkedin') {
        authUrlData = await integrationsAPI.getLinkedInAuthUrl(token);
      } else if (provider === 'google-calendar') {
        authUrlData = await integrationsAPI.getGoogleCalendarAuthUrl(token);
      } else {
        authUrlData = await integrationsAPI.getOutlookAuthUrl(token);
      }

      // Rediriger vers l'URL d'autorisation OAuth
      window.location.href = authUrlData.auth_url;
    } catch (error: unknown) {
      logger.error(`Error connecting ${provider}:`, error);
      toast.error(`${t('connectProviderError')} ${provider}`);
    }
  };

  // Déconnecter une intégration
  const handleDisconnect = async (provider: 'linkedin' | 'google-calendar' | 'outlook') => {
    const providerLabel = provider === 'google-calendar' ? 'Google Calendar' : provider === 'linkedin' ? 'LinkedIn' : 'Outlook';
    const ok = await confirm({
      title: `${t('disconnectTitle').replace('?', '')} ${providerLabel} ?`,
      message: `${t('disconnectMsg').replace('{provider}', providerLabel)}`,
      confirmLabel: t('disconnectButton'),
      variant: 'warning',
    });
    if (!ok) return;

    try {
      const token = await getToken();
      if (!token) {
        router.push('/signin');
        return;
      }

      await integrationsAPI.disconnect(token, provider);
      toast.success(`${providerLabel} ${t('connectSuccess')}`);
      await loadIntegrations();
    } catch (error: unknown) {
      logger.error(`Error disconnecting ${provider}:`, error);
      toast.error(`${t('connectProviderError')} ${provider}`);
    }
  };

  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return t('never');
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title={t('loadingTitle')} subtitle={tc('loading')}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#F7C700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
      <div className="space-y-8">
        {/* Hero Section */}
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6B46C1] via-[#5732a8] to-[#4a2890] p-8 shadow-xl shadow-[#6B46C1]/20"
          style={{ animation: 'fadeIn 0.6s ease-out' }}
        >
          {/* Motifs décoratifs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Icône et titre */}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                  <BoltIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-2">
                    <SparklesIcon className="w-4 h-4 text-white" />
                    <span className="text-white/90 text-sm font-medium">{t('badge')}</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">
                    {t('heroTitle')}
                  </h2>
                  <p className="text-white/80 mt-1">
                    {t('heroSubtitle')}
                  </p>
                </div>
              </div>

              {/* Bouton rafraîchir */}
              <button
                onClick={loadIntegrations}
                className="btn bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm shadow-lg"
                title={tc('refresh')}
              >
                <ArrowPathIcon className="h-5 w-5" />
                {tc('refresh')}
              </button>
            </div>

            {/* Barre de stats */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">LinkedIn</p>
                    <p className="text-white font-semibold">
                      {integrations?.linkedin?.is_connected ? t('connected') : t('notConnected')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Google Calendar</p>
                    <p className="text-white font-semibold">
                      {integrations?.google_calendar?.is_connected ? t('connected') : t('notConnected')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <VideoCameraIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Microsoft Teams</p>
                    <p className="text-white font-semibold">
                      {integrations?.outlook_calendar?.is_connected ? t('connected') : t('notConnected')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerte informative */}
        <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#6B46C1]/10 rounded-2xl p-6 border border-[#3B82F6]/20">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <RocketLaunchIcon className="h-5 w-5 text-[#3B82F6]" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{t('infoTitle')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('infoDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Cartes des intégrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Targetym - Plateforme RH */}
          <div
            className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-[#6B9B5F]/30 cursor-pointer"
            onClick={() => router.push('/dashboard/integrations/targetym')}
            style={{ animation: 'fadeIn 0.4s ease-out' }}
          >
            <div className="absolute inset-0 bg-[#6B9B5F] opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="p-4 rounded-2xl bg-[#6B9B5F]/10 shadow-md">
                  <span className="text-3xl">🎯</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#F7C700] to-[#e6b800] text-gray-900 dark:text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                  ✨ Natif
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('targetymTitle')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
  {t('targetymDescription')}
              </p>
              <div className="space-y-2.5 mb-5">
                {[
                  t('targetymFeature1'),
                  t('targetymFeature2'),
                  t('targetymFeature3'),
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-[#6B9B5F] flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={(e) => { e.stopPropagation(); router.push('/dashboard/integrations/targetym'); }}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-[#6B9B5F] to-[#5a8450] text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <LinkIcon className="h-4 w-4" />
                  {t('configureButton')}
                </button>
              </div>
            </div>
          </div>
          {/* LinkedIn */}
          <div data-tour="connect-linkedin">
            <IntegrationCard
            title="LinkedIn"
            description="Publiez automatiquement vos offres d'emploi sur votre page LinkedIn"
            icon={<LinkIcon className="h-8 w-8" />}
            iconColor="text-[#0A66C2]"
            bgColor="bg-[#0A66C2]/10"
            integration={integrations?.linkedin}
            provider="linkedin"
            onConnect={() => handleConnect('linkedin')}
            onDisconnect={() => handleDisconnect('linkedin')}
            isConnecting={connectingProvider === 'linkedin'}
            formatDate={formatDate}
            features={[
              'Publication automatique d\'offres',
              'Partage sur votre page entreprise',
              'Engagement et statistiques'
            ]}
          />
          </div>

          {/* Google Calendar */}
          <div data-tour="connect-google">
            <IntegrationCard
            title="Google Calendar"
            description="Planifiez des entretiens avec des liens Google Meet automatiques"
            icon={<CalendarIcon className="h-8 w-8" />}
            iconColor="text-[#4285F4]"
            bgColor="bg-[#4285F4]/10"
            integration={integrations?.google_calendar}
            provider="google-calendar"
            onConnect={() => handleConnect('google-calendar')}
            onDisconnect={() => handleDisconnect('google-calendar')}
            isConnecting={connectingProvider === 'google-calendar'}
            formatDate={formatDate}
            features={[
              'Création d\'événements',
              'Liens Google Meet automatiques',
              'Invitations par email'
            ]}
          />
          </div>

          {/* Microsoft Outlook / Teams */}
          <div data-tour="connect-outlook">
            <IntegrationCard
            title="Outlook / Teams"
            description="Planifiez des entretiens avec des réunions Microsoft Teams"
            icon={<VideoCameraIcon className="h-8 w-8" />}
            iconColor="text-[#0078D4]"
            bgColor="bg-[#0078D4]/10"
            integration={integrations?.outlook_calendar}
            provider="outlook"
            onConnect={() => handleConnect('outlook')}
            onDisconnect={() => handleDisconnect('outlook')}
            isConnecting={connectingProvider === 'outlook'}
            formatDate={formatDate}
            features={[
              'Création d\'événements Outlook',
              'Réunions Microsoft Teams',
              'Synchronisation calendrier'
            ]}
          />
          </div>
        </div>

        {/* Section d'aide */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-[#6B9B5F]/10 to-[#F7C700]/10 p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5 text-[#6B9B5F]" />
              {t('helpTitle')}
            </h3>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('helpDescription')}
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-[#0A66C2]/5 rounded-xl border border-[#0A66C2]/10">
                <LinkIcon className="w-5 h-5 text-[#0A66C2] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">LinkedIn</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('linkedinHelp')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-[#4285F4]/5 rounded-xl border border-[#4285F4]/10">
                <CalendarIcon className="w-5 h-5 text-[#4285F4] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Google Calendar</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('googleHelp')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-[#0078D4]/5 rounded-xl border border-[#0078D4]/10">
                <VideoCameraIcon className="w-5 h-5 text-[#0078D4] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Outlook / Teams</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('outlookHelp')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Système d'onboarding */}
      <OnboardingTour
        tourId="integrations"
        steps={integrationsTour}
      />
      <ConfirmDialog
        isOpen={isConfirmOpen}
        options={confirmOptions}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}

// Composant de carte d'intégration - Design moderne INTOWORK
interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  integration?: Integration;
  provider: string;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
  formatDate: (date?: string) => string;
  features: string[];
}

function IntegrationCard({
  title,
  description,
  icon,
  iconColor,
  bgColor,
  integration,
  provider,
  onConnect,
  onDisconnect,
  isConnecting,
  formatDate,
  features
}: IntegrationCardProps) {
  const t = useTranslations('integrations');
  const isConnected = integration?.is_connected || false;

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
      style={{ animation: 'fadeIn 0.6s ease-out' }}
    >
      {/* Gradient de fond subtil */}
      <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative p-6">
        {/* En-tête avec icône et badge */}
        <div className="flex items-start justify-between mb-5">
          <div className={`p-4 rounded-2xl ${bgColor} shadow-md`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
          {isConnected && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#6B9B5F] to-[#5a8450] text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
              <CheckCircleSolid className="h-4 w-4" />
              {t('connected')}
            </div>
          )}
        </div>

        {/* Titre et description */}
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">{description}</p>

        {/* Fonctionnalités */}
        <div className="space-y-2.5 mb-5">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircleIcon className="h-4 w-4 text-[#6B9B5F]" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Statut et dates */}
        {isConnected && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-5 border border-gray-200 dark:border-gray-600">
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircleSolid className="h-3.5 w-3.5 text-[#6B9B5F]" />
                <span className="font-medium">{t('connectedOn')}</span>
                <span>{formatDate(integration?.connected_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                <span className="font-medium">{t('lastUsed')}</span>
                <span>{formatDate(integration?.last_used_at)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          {isConnected ? (
            <button
              onClick={onDisconnect}
              className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2 border border-red-200"
            >
              <XCircleIcon className="h-5 w-5" />
              {t('disconnectButton')}
            </button>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-[#6B9B5F] to-[#5a8450] hover:from-[#5a8450] hover:to-[#4a6e42] text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('connecting')}
                </>
              ) : (
                <>
                  <LinkIcon className="h-5 w-5" />
                  {t('connectButton')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
