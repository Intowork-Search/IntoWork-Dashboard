'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { integrationsAPI, Integration, IntegrationStatus } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  LinkIcon,
  CalendarIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

export default function IntegrationsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  // Charger le statut des intégrations
  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const status = await integrationsAPI.getStatus(token);
      setIntegrations(status);
    } catch (error: any) {
      console.error('Error loading integrations:', error);
      toast.error('Erreur lors du chargement des intégrations');
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
      toast.success(`✅ ${provider} connecté avec succès !`);
      // Recharger les intégrations
      loadIntegrations();
      // Nettoyer l'URL
      router.replace('/dashboard/integrations');
    } else if (provider && success === 'false') {
      const error = searchParams.get('error') || 'Erreur inconnue';
      toast.error(`❌ Échec de connexion à ${provider}: ${error}`);
      router.replace('/dashboard/integrations');
    }
  }, []);

  // Connecter une intégration (redirection OAuth)
  const handleConnect = async (provider: 'linkedin' | 'google-calendar' | 'outlook') => {
    try {
      setConnectingProvider(provider);
      const token = await getToken();
      if (!token) {
        router.push('/auth/signin');
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
    } catch (error: any) {
      console.error(`Error connecting ${provider}:`, error);
      toast.error(`Erreur lors de la connexion à ${provider}`);
      setConnectingProvider(null);
    }
  };

  // Déconnecter une intégration
  const handleDisconnect = async (provider: 'linkedin' | 'google-calendar' | 'outlook') => {
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter ${provider} ?`)) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      await integrationsAPI.disconnect(token, provider);
      toast.success(`${provider} déconnecté avec succès`);
      await loadIntegrations();
    } catch (error: any) {
      console.error(`Error disconnecting ${provider}:`, error);
      toast.error(`Erreur lors de la déconnexion de ${provider}`);
    }
  };

  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Intégrations</h1>
            <p className="mt-1 text-base-content/60">
              Connectez vos outils pour automatiser vos workflows
            </p>
          </div>
          <button
            onClick={loadIntegrations}
            className="btn btn-ghost btn-circle"
            title="Rafraîchir"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Alerte informative */}
        <div className="alert bg-info/10 border-info/20">
          <InformationCircleIcon className="h-6 w-6 text-info shrink-0" />
          <div>
            <h3 className="font-semibold text-base-content">Pourquoi connecter vos intégrations ?</h3>
            <p className="text-sm text-base-content/60 mt-1">
              Publiez automatiquement vos offres d'emploi sur LinkedIn, planifiez des entretiens avec Google Calendar ou Microsoft Teams, et gagnez du temps.
            </p>
          </div>
        </div>

        {/* Cartes des intégrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* LinkedIn */}
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

          {/* Google Calendar */}
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

          {/* Microsoft Outlook / Teams */}
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

        {/* Section d'aide */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg">Besoin d'aide ?</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-base-content/70">
                Les intégrations utilisent OAuth 2.0 pour sécuriser la connexion à vos comptes.
                Vous pouvez révoquer l'accès à tout moment depuis cette page.
              </p>
              <ul className="text-base-content/70">
                <li><strong>LinkedIn :</strong> Assurez-vous d'avoir les permissions administrateur sur votre page entreprise</li>
                <li><strong>Google Calendar :</strong> Vous aurez besoin d'un compte Google avec accès à Calendar</li>
                <li><strong>Outlook / Teams :</strong> Nécessite un compte Microsoft 365 avec Teams activé</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Composant de carte d'intégration
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
  const isConnected = integration?.is_connected || false;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body">
        {/* Icône et titre */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
          {isConnected && (
            <div className="badge badge-success gap-1">
              <CheckCircleSolid className="h-3 w-3" />
              Connecté
            </div>
          )}
        </div>

        {/* Informations */}
        <h3 className="card-title text-xl mb-2">{title}</h3>
        <p className="text-base-content/60 text-sm mb-4">{description}</p>

        {/* Fonctionnalités */}
        <div className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-base-content/70">
              <CheckCircleIcon className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Statut et dates */}
        {isConnected && (
          <div className="space-y-1 mb-4 text-xs text-base-content/50">
            <div>Connecté le : {formatDate(integration?.connected_at)}</div>
            <div>Dernière utilisation : {formatDate(integration?.last_used_at)}</div>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions justify-end mt-auto pt-4 border-t border-base-300">
          {isConnected ? (
            <button
              onClick={onDisconnect}
              className="btn btn-ghost btn-sm text-error hover:bg-error/10"
            >
              <XCircleIcon className="h-4 w-4" />
              Déconnecter
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="btn btn-primary btn-sm"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Connexion...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Connecter
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
