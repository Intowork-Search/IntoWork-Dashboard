'use client';

import React, { useState } from 'react';
import { integrationsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';

interface PublishToLinkedInModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
  getToken: () => Promise<string | null>;
}

export default function PublishToLinkedInModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  getToken
}: PublishToLinkedInModalProps) {
  const [message, setMessage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const token = await getToken();
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const result = await integrationsAPI.publishJobToLinkedIn(token, jobId, message || undefined);
      
      toast.success('✅ Offre publiée sur LinkedIn avec succès !');
      onClose();
      setMessage('');
      
      // Ouvrir le post LinkedIn dans un nouvel onglet
      if (result.post_url) {
        window.open(result.post_url, '_blank');
      }
    } catch (error: any) {
      console.error('Error publishing to LinkedIn:', error);
      
      if (error.response?.status === 403) {
        toast.error('LinkedIn non connecté. Veuillez vous connecter dans Intégrations.');
      } else {
        toast.error(error.response?.data?.detail || 'Erreur lors de la publication sur LinkedIn');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Publier sur LinkedIn</h2>
              <p className="text-sm text-gray-500">{jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Alerte */}
          <div className="bg-[#0A66C2]/10 border border-[#0A66C2]/20 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📢 Publication sur votre page LinkedIn</h3>
            <p className="text-sm text-gray-600">
              Cette offre sera publiée sur votre page entreprise LinkedIn. Vous pouvez personnaliser le message d'accompagnement.
            </p>
          </div>

          {/* Message personnalisé */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Message d'accompagnement (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Exemple:\n\n🎯 Nouvelle opportunité chez [Votre Entreprise] !\n\nNous recherchons un(e) ${jobTitle}.\n\nPostulez dès maintenant ! 👇`}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent resize-none"
              rows={6}
              maxLength={1300}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Le titre et le lien vers l'offre seront automatiquement ajoutés
              </p>
              <p className="text-xs text-gray-400">
                {message.length} / 1300 caractères
              </p>
            </div>
          </div>

          {/* Aperçu */}
          {message && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Aperçu du message</h4>
              <div className="whitespace-pre-wrap text-sm text-gray-900">
                {message}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-sm font-semibold text-gray-900">{jobTitle}</p>
                <p className="text-xs text-[#0A66C2] mt-1">🔗 Postuler maintenant</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[#0A66C2] text-white hover:bg-[#084E94] transition-all disabled:opacity-50 shadow-lg shadow-[#0A66C2]/30"
          >
            {isPublishing ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Publication...
              </>
            ) : (
              <>
                <LinkIcon className="w-5 h-5" />
                Publier sur LinkedIn
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
