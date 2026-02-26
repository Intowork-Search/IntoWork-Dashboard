'use client';

import React, { useState, useEffect } from 'react';
import { integrationsAPI, IntegrationStatus } from '@/lib/api';
import toast from 'react-hot-toast';
import { XMarkIcon, CalendarIcon, VideoCameraIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  getToken: () => Promise<string | null>;
}

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  candidateName,
  candidateEmail,
  jobTitle,
  getToken
}: ScheduleInterviewModalProps) {
  const [provider, setProvider] = useState<'google' | 'outlook'>('google');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [attendees, setAttendees] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);

  // Charger le statut des intégrations
  useEffect(() => {
    if (isOpen) {
      loadIntegrations();
      // Pré-remplir les champs
      setSubject(`Entretien - ${jobTitle}`);
      setDescription(`Entretien avec ${candidateName} pour le poste de ${jobTitle}.`);
      setAttendees(candidateEmail);
      
      // Date par défaut : demain à 10h
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setStartDate(tomorrow.toISOString().split('T')[0]);
      setStartTime('10:00');
    }
  }, [isOpen, candidateName, candidateEmail, jobTitle]);

  const loadIntegrations = async () => {
    try {
      setLoadingIntegrations(true);
      const token = await getToken();
      if (!token) return;

      const status = await integrationsAPI.getStatus(token);
      setIntegrations(status);

      // Sélectionner le premier calendrier connecté par défaut
      if (status.google_calendar.is_connected) {
        setProvider('google');
      } else if (status.outlook_calendar.is_connected) {
        setProvider('outlook');
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const handleSchedule = async () => {
    // Validation
    if (!subject || !startDate || !startTime) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!integrations?.google_calendar.is_connected && !integrations?.outlook_calendar.is_connected) {
      toast.error('Aucun calendrier connecté. Veuillez configurer vos intégrations.');
      return;
    }

    try {
      setIsCreating(true);
      const token = await getToken();
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      // Construire les dates ISO
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      const attendeesList = attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      let result;
      if (provider === 'google') {
        result = await integrationsAPI.createGoogleCalendarEvent(token, {
          summary: subject,
          description,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          attendees: attendeesList,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        toast.success('✅ Entretien planifié avec Google Calendar + Meet !');
      } else {
        result = await integrationsAPI.createOutlookEvent(token, {
          subject,
          body: description,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          attendees: attendeesList,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        toast.success('✅ Entretien planifié avec Outlook + Teams !');
      }

      // Ouvrir l'événement dans un nouvel onglet
      if (result.event_url) {
        window.open(result.event_url, '_blank');
      }

      // Réinitialiser et fermer
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error scheduling interview:', error);
      
      if (error.response?.status === 403) {
        toast.error(`${provider === 'google' ? 'Google Calendar' : 'Outlook'} non connecté. Veuillez vous connecter dans Intégrations.`);
      } else {
        toast.error(error.response?.data?.detail || 'Erreur lors de la planification de l\'entretien');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setStartDate('');
    setStartTime('');
    setDuration(60);
    setAttendees('');
  };

  if (!isOpen) return null;

  const isGoogleConnected = integrations?.google_calendar.is_connected || false;
  const isOutlookConnected = integrations?.outlook_calendar.is_connected || false;
  const noCalendarConnected = !isGoogleConnected && !isOutlookConnected;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B9B5F]/10 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-[#6B9B5F]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Planifier un entretien</h2>
              <p className="text-sm text-gray-500">{candidateName} • {jobTitle}</p>
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
          {/* Alerte si aucun calendrier connecté */}
          {noCalendarConnected && !loadingIntegrations && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Aucun calendrier connecté</h3>
              <p className="text-sm text-red-600 mb-3">
                Vous devez d'abord connecter Google Calendar ou Outlook dans vos intégrations.
              </p>
              <a
                href="/dashboard/integrations"
                className="inline-block px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all"
              >
                Configurer les intégrations →
              </a>
            </div>
          )}

          {/* Sélection du calendrier */}
          {!noCalendarConnected && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Calendrier à utiliser
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProvider('google')}
                    disabled={!isGoogleConnected}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      provider === 'google'
                        ? 'border-[#4285F4] bg-[#4285F4]/10'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${!isGoogleConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        provider === 'google' ? 'bg-[#4285F4]' : 'bg-gray-100'
                      }`}>
                        <CalendarIcon className={`w-5 h-5 ${provider === 'google' ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Google Calendar</p>
                        <p className="text-xs text-gray-500">
                          {isGoogleConnected ? 'Avec lien Meet' : 'Non connecté'}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('outlook')}
                    disabled={!isOutlookConnected}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      provider === 'outlook'
                        ? 'border-[#0078D4] bg-[#0078D4]/10'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${!isOutlookConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        provider === 'outlook' ? 'bg-[#0078D4]' : 'bg-gray-100'
                      }`}>
                        <VideoCameraIcon className={`w-5 h-5 ${provider === 'outlook' ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Outlook / Teams</p>
                        <p className="text-xs text-gray-500">
                          {isOutlookConnected ? 'Avec lien Teams' : 'Non connecté'}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sujet */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Sujet de l'entretien *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Entretien technique - Développeur Full Stack"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F] focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ordre du jour, informations complémentaires..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F] focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Date et heure */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F] focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Durée */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Durée
                </label>
                <div className="flex gap-2">
                  {[30, 45, 60, 90].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setDuration(min)}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                        duration === min
                          ? 'border-[#6B9B5F] bg-[#6B9B5F]/10 text-[#6B9B5F]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <ClockIcon className="w-4 h-4 mx-auto mb-1" />
                      {min} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Participants (emails séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  placeholder="candidat@example.com, recruteur@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Le candidat ({candidateEmail}) est pré-rempli. Ajoutez d'autres participants si nécessaire.
                </p>
              </div>

              {/* Info lien vidéo */}
              <div className="bg-gradient-to-r from-[#6B9B5F]/10 to-[#3B82F6]/10 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <VideoCameraIcon className="w-5 h-5 text-[#6B9B5F]" />
                  Lien de visioconférence automatique
                </h3>
                <p className="text-sm text-gray-600">
                  Un lien {provider === 'google' ? 'Google Meet' : 'Microsoft Teams'} sera automatiquement créé et envoyé à tous les participants.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          {!noCalendarConnected && (
            <button
              onClick={handleSchedule}
              disabled={isCreating || !subject || !startDate || !startTime}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/30 hover:shadow-xl hover:shadow-[#6B9B5F]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Planification...
                </>
              ) : (
                <>
                  <CalendarIcon className="w-5 h-5" />
                  Planifier l'entretien
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
