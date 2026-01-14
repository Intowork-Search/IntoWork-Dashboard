'use client';

/**
 * CV Management Page - Executive Elegance Design
 *
 * Refonte visuelle avec:
 * - Palette Executive Elegance (Navy, Gold, Sage)
 * - Cartes statistiques sophistiquées
 * - Liste CV avec actions élégantes
 * - Upload drag-and-drop style
 * - Animations douces
 */

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { candidatesAPI, CV } from '@/lib/api';
import { getApiUrl } from '@/lib/getApiUrl';
import {
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  CalendarDaysIcon,
  PlusIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function MesCVPage() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    profile: true,
    cvs: true,
    sync: true
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Charger le profil et les CV
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) {
          setError('Token d\'authentification manquant');
          setIsLoading(false);
          return;
        }

        const [profileData, cvsData] = await Promise.all([
          candidatesAPI.getMyProfile(token),
          candidatesAPI.listCVs(token)
        ]);

        setCvs(cvsData);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
        setLoadingStates({ profile: false, cvs: false, sync: false });
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user?.id, getToken]);

  // Recharger les données
  const reloadData = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const profileData = await candidatesAPI.getMyProfile(token);

      try {
        const cvsData = await candidatesAPI.listCVs(token);
        setCvs(cvsData);
      } catch (cvError) {
        const legacyCVs: CV[] = [];
        if (profileData.cv_filename) {
          legacyCVs.push({
            id: 0,
            filename: profileData.cv_filename,
            created_at: profileData.cv_uploaded_at || new Date().toISOString(),
            is_active: true,
            file_size: undefined
          });
        }
        setCvs(legacyCVs);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date inconnue';
    }
  };

  // Visualiser le CV
  const handleViewCV = async (cv: CV) => {
    try {
      const token = await getToken();
      if (!token) return;

      let blob: Blob;

      if (cv.id > 0) {
        blob = await candidatesAPI.downloadSpecificCV(token, cv.id);
      } else {
        blob = await candidatesAPI.downloadCV(token);
      }

      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

      setTimeout(() => URL.revokeObjectURL(url), 10000);

    } catch (error) {
      console.error('Erreur lors de la visualisation:', error);
      alert('Erreur lors de l\'ouverture du CV');
    }
  };

  // Télécharger le CV
  const handleDownloadCV = async (cv: CV) => {
    try {
      const token = await getToken();
      if (!token) return;

      let blob: Blob;

      if (cv.id > 0) {
        blob = await candidatesAPI.downloadSpecificCV(token, cv.id);
      } else {
        blob = await candidatesAPI.downloadCV(token);
      }

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = cv.filename;
      document.body.appendChild(link);
      link.click();

      link.remove();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du CV');
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Veuillez sélectionner un fichier PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier ne peut pas dépasser 5MB.');
      return;
    }

    try {
      setIsUploadingCV(true);
      const token = await getToken();
      if (!token) {
        alert('Erreur d\'authentification');
        return;
      }

      const formData = new FormData();
      formData.append('cv', file);

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/candidates/cv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('CV téléchargé avec succès !');

        await reloadData();

        try {
          const cvsData = await candidatesAPI.listCVs(token);
          setCvs(cvsData);
        } catch (error) {
          await reloadData();
        }
      } else {
        const errorData = await response.json();
        alert(`Erreur lors du téléchargement: ${errorData.detail || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
      alert('Erreur lors du téléchargement du CV');
    } finally {
      setIsUploadingCV(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteCV = async (cv: CV) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le CV "${cv.filename}" ?`)) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      if (cv.id > 0) {
        await candidatesAPI.deleteCV(token, cv.id);
      } else {
        await candidatesAPI.updateMyProfile(token, {
          cv_filename: undefined,
          cv_uploaded_at: undefined,
          cv_url: undefined
        });
      }

      alert('CV supprimé avec succès');

      setCvs(cvs.filter(existingCV => existingCV.id !== cv.id));

      await reloadData();

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du CV');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Mes CV" subtitle="Gérez vos CV téléchargés">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{
            borderColor: '#D97706',
            borderTopColor: 'transparent',
          }}></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Mes CV" subtitle="Gérez vos CV téléchargés">
        <div className="rounded-xl p-4" style={{
          background: '#FEE2E2',
          border: '1px solid #FCA5A5',
        }}>
          <p style={{ color: '#991B1B' }}>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mes CV" subtitle="Gérez vos CV téléchargés">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCVUpload}
        accept=".pdf"
        className="hidden"
        aria-label="Sélectionner un fichier CV"
      />

      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 animate-elegant-fade-in" style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: '#F1F5F9',
              }}>
                <DocumentTextIcon className="w-6 h-6" style={{ color: '#475569' }} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#475569' }}>CV téléchargés</p>
                <p className="text-2xl font-bold" style={{
                  color: '#0F172A',
                  fontFamily: 'var(--font-display)',
                }}>{cvs.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 animate-elegant-fade-in" style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            animationDelay: '100ms',
          }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: '#DCFCE7',
              }}>
                <EyeIcon className="w-6 h-6" style={{ color: '#16A34A' }} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#16A34A' }}>Vues par les recruteurs</p>
                <p className="text-2xl font-bold" style={{
                  color: '#14532D',
                  fontFamily: 'var(--font-display)',
                }}>0</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 animate-elegant-fade-in" style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            animationDelay: '200ms',
          }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: '#EDE9FE',
              }}>
                <CalendarDaysIcon className="w-6 h-6" style={{ color: '#7C3AED' }} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#7C3AED' }}>Dernier téléchargement</p>
                <p className="text-sm font-semibold" style={{ color: '#6B21A8' }}>
                  {cvs.length > 0 ? formatDate(cvs[0].created_at) : 'Aucun'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des CV */}
        <div className="rounded-2xl animate-elegant-fade-in" style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          animationDelay: '300ms',
        }}>
          <div className="p-6 flex justify-between items-center" style={{
            borderBottom: '1px solid #E2E8F0',
          }}>
            <div>
              <h2 className="text-lg font-bold mb-1" style={{
                color: '#0F172A',
                fontFamily: 'var(--font-display)',
              }}>Mes CV</h2>
              <p className="text-sm" style={{ color: '#475569' }}>
                Gérez vos CV téléchargés et suivez leur utilisation
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingCV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
              style={{
                background: '#D97706',
                color: 'white',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              }}
              onMouseEnter={(e) => !isUploadingCV && (e.currentTarget.style.background = '#B45309')}
              onMouseLeave={(e) => e.currentTarget.style.background = '#D97706'}
              title="Ajouter un nouveau CV"
            >
              <PlusIcon className="w-5 h-5" />
              <span>{isUploadingCV ? 'Upload...' : 'Ajouter un CV'}</span>
            </button>
          </div>

          {cvs.length === 0 ? (
            <div className="p-12 text-center">
              <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-4" style={{ color: '#CBD5E1' }} />
              <h3 className="text-lg font-bold mb-2" style={{
                color: '#0F172A',
                fontFamily: 'var(--font-display)',
              }}>Aucun CV téléchargé</h3>
              <p className="mb-6" style={{ color: '#475569' }}>
                Téléchargez votre premier CV pour commencer à postuler aux offres d'emploi.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCV}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
                style={{
                  background: '#D97706',
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                }}
                onMouseEnter={(e) => !isUploadingCV && (e.currentTarget.style.background = '#B45309')}
                onMouseLeave={(e) => e.currentTarget.style.background = '#D97706'}
              >
                {isUploadingCV ? 'Téléchargement...' : 'Télécharger un CV'}
              </button>
            </div>
          ) : (
            <div>
              {cvs.map((cv, index) => (
                <div
                  key={cv.id || cv.filename}
                  className="p-6 flex items-center justify-between animate-elegant-fade-in"
                  style={{
                    borderBottom: index < cvs.length - 1 ? '1px solid #E2E8F0' : 'none',
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                      background: '#F1F5F9',
                    }}>
                      <DocumentTextIcon className="w-6 h-6" style={{ color: '#475569' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: '#0F172A' }}>
                        {cv.filename}
                      </h3>
                      <p className="text-sm" style={{ color: '#475569' }}>
                        Téléchargé le {formatDate(cv.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      title="Prévisualiser le CV"
                      onClick={() => handleViewCV(cv)}
                      className="p-2 rounded-lg transition-all duration-300"
                      style={{ color: '#64748B' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F1F5F9';
                        e.currentTarget.style.color = '#334155';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#64748B';
                      }}
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      title="Télécharger le CV"
                      onClick={() => handleDownloadCV(cv)}
                      className="p-2 rounded-lg transition-all duration-300"
                      style={{ color: '#22C55E' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#DCFCE7';
                        e.currentTarget.style.color = '#15803D';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#22C55E';
                      }}
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                    <button
                      title="Supprimer le CV"
                      onClick={() => handleDeleteCV(cv)}
                      className="p-2 rounded-lg transition-all duration-300"
                      style={{ color: '#64748B' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.color = '#DC2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#64748B';
                      }}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conseils */}
        <div className="rounded-2xl p-6 animate-elegant-fade-in" style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          animationDelay: '400ms',
        }}>
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#78350F' }}>
            <CheckCircleIcon className="w-5 h-5" />
            Conseils pour optimiser votre CV
          </h3>
          <ul className="text-sm space-y-2" style={{ color: '#92400E' }}>
            <li>• Utilisez un format PDF pour une meilleure compatibilité</li>
            <li>• Gardez votre CV à jour avec vos dernières expériences</li>
            <li>• Adaptez votre CV en fonction du poste visé</li>
            <li>• Vérifiez régulièrement les statistiques de consultation</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
