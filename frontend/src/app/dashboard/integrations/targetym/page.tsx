'use client';

/**
 * Page Intégration Targetym - INTOWORK
 * Permet à un employeur de lier son compte IntoWork à son tenant Targetym.
 */

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { integrationsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/api';
import {
  LinkIcon,
  KeyIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

export default function TargetymIntegrationPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState<{ linked: boolean; targetym_tenant_id?: number; linked_at?: string } | null>(null);
  const [apiKeyData, setApiKeyData] = useState<{ has_key: boolean; api_key_preview: string | null; api_key_full: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Formulaire de liaison
  const [tenantId, setTenantId] = useState('');
  const [targetymApiKey, setTargetymApiKey] = useState('');
  const [myCompanyId, setMyCompanyId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) { router.push('/signin'); return; }

      const [statusData, keyData, employerData] = await Promise.all([
        integrationsAPI.getTargetymStatus(token),
        integrationsAPI.getApiKey(token),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/employers/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : null),
      ]);
      setStatus(statusData);
      setApiKeyData(keyData);
      if (employerData?.company_id) setMyCompanyId(employerData.company_id);
    } catch (err) {
      logger.error("Erreur chargement targetym:", err);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleGenerateKey = async () => {
    try {
      setIsGenerating(true);
      const token = await getToken();
      if (!token) return;
      const data = await integrationsAPI.generateApiKey(token);
      setGeneratedKey(data.api_key);
      setApiKeyData({ has_key: true, api_key_preview: data.api_key.slice(0, 8) + '••••••••', api_key_full: data.api_key });
      toast.success('Clé API générée avec succès !');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erreur lors de la génération'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKey = async () => {
    const keyToCopy = generatedKey || apiKeyData?.api_key_full;
    if (!keyToCopy) return;
    await navigator.clipboard.writeText(keyToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLink = async () => {
    if (!tenantId || !targetymApiKey) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    try {
      setIsLinking(true);
      const token = await getToken();
      if (!token) return;
      const data = await integrationsAPI.linkTargetym(token, parseInt(tenantId), targetymApiKey);
      setStatus({ linked: true, targetym_tenant_id: data.targetym_tenant_id, linked_at: data.linked_at });
      toast.success(`✅ Lié au tenant Targetym "${data.targetym_tenant_name}" !`);
      setTenantId('');
      setTargetymApiKey('');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erreur de liaison'));
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Confirmer la suppression de la liaison avec Targetym ?')) return;
    try {
      setIsUnlinking(true);
      const token = await getToken();
      if (!token) return;
      await integrationsAPI.unlinkTargetym(token);
      setStatus({ linked: false });
      toast.success('Liaison Targetym supprimée');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erreur'));
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/dashboard/integrations')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Intégration Targetym</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Connectez votre compte IntoWork à votre plateforme RH Targetym
            </p>
            {myCompanyId && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Votre Company ID IntoWork :</span>
                <span className="font-mono font-bold text-[#6B9B5F] bg-green-50 px-2 py-0.5 rounded text-sm select-all">#{myCompanyId}</span>
                <span className="text-xs text-gray-400">(à donner au RH Targetym)</span>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <ArrowPathIcon className="h-8 w-8 text-[#6B9B5F] animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* Statut de la liaison */}
            <div className={`rounded-2xl p-6 border-2 ${status?.linked
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {status?.linked ? (
                    <CheckCircleSolid className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-8 w-8 text-gray-400" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {status?.linked ? 'Comptes liés' : 'Comptes non liés'}
                    </p>
                    {status?.linked ? (
                      <p className="text-sm text-gray-600">
                        Tenant Targetym #{status.targetym_tenant_id} · Lié le{' '}
                        {status.linked_at ? new Date(status.linked_at).toLocaleDateString('fr-FR') : '—'}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Suivez les étapes ci-dessous pour lier les deux plateformes
                      </p>
                    )}
                  </div>
                </div>
                {status?.linked && (
                  <button
                    onClick={handleUnlink}
                    disabled={isUnlinking}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm border border-red-200 transition-colors disabled:opacity-50"
                  >
                    {isUnlinking ? 'Suppression...' : 'Délier'}
                  </button>
                )}
              </div>
            </div>

            {/* Étape 1 : Générer la clé API */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#6B9B5F] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Générez votre clé API IntoWork</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Cette clé permet à Targetym de s'authentifier auprès d'IntoWork. Partagez-la avec votre admin Targetym.
                  </p>
                </div>
              </div>

              <div className="ml-12">
                {apiKeyData?.has_key && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <KeyIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="font-mono text-sm text-gray-700 flex-1 break-all">
                      {generatedKey || apiKeyData.api_key_full || apiKeyData.api_key_preview}
                    </span>
                    <button
                      onClick={handleCopyKey}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6B9B5F] text-white rounded-lg text-xs font-medium hover:bg-[#5a8450] transition-colors flex-shrink-0"
                    >
                      {copied ? (
                        <><CheckCircleIcon className="h-3.5 w-3.5" />Copié !</>
                      ) : (
                        <><ClipboardDocumentIcon className="h-3.5 w-3.5" />Copier</>
                      )}
                    </button>
                  </div>
                )}

                <button
                  onClick={handleGenerateKey}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6B9B5F] to-[#5a8450] text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <><ArrowPathIcon className="h-4 w-4 animate-spin" />Génération...</>
                  ) : (
                    <><KeyIcon className="h-4 w-4" />{apiKeyData?.has_key ? 'Régénérer la clé' : 'Générer la clé API'}</>
                  )}
                </button>

                {(generatedKey) && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-700">
                      Nouvelle clé générée. Copiez-la et entrez-la dans Targetym → Paramètres → Intégration IntoWork.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Étape 2 : Lier le compte Targetym */}
            {!status?.linked && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-8 h-8 rounded-full bg-[#6B9B5F] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Liez votre tenant Targetym</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Entrez l'ID de votre tenant Targetym et la clé API Targetym (fournie par votre admin Targetym).
                    </p>
                  </div>
                </div>

                <div className="ml-12 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      ID Tenant Targetym
                    </label>
                    <input
                      type="number"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      placeholder="ex: 42"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#6B9B5F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Clé API Targetym
                    </label>
                    <input
                      type="text"
                      value={targetymApiKey}
                      onChange={(e) => setTargetymApiKey(e.target.value)}
                      placeholder="Votre clé API Targetym"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#6B9B5F] focus:border-transparent outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="ml-12 mt-4">
                  <button
                    onClick={handleLink}
                    disabled={isLinking || !tenantId || !targetymApiKey}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6B9B5F] to-[#5a8450] text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLinking ? (
                      <><ArrowPathIcon className="h-4 w-4 animate-spin" />Liaison en cours...</>
                    ) : (
                      <><LinkIcon className="h-4 w-4" />Lier les comptes</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Info fonctionnalités activées */}
            {status?.linked && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Fonctionnalités activées</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Candidat embauché → Employé créé automatiquement dans Targetym', active: true },
                    { label: 'Offres internes Targetym synchronisées sur IntoWork', active: true },
                    { label: 'Tableau de bord unifié recrutement + RH', active: true },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-[#6B9B5F] flex-shrink-0" />
                      {f.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
