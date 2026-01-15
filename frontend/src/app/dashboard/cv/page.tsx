'use client';

/**
 * CV Management Page - INTOWORK Brand Design
 *
 * Refonte visuelle avec la charte graphique INTOWORK:
 * - Vert: #6B9B5F (couleur principale)
 * - Or: #F7C700 (accent)
 * - Violet: #6B46C1 (secondaire)
 * - Bleu: #3B82F6 (complémentaire)
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  SparklesIcon,
  DocumentPlusIcon,
  FolderIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { DocumentTextIcon as DocumentTextSolid } from '@heroicons/react/24/solid';

export default function MesCVPage() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user?.id]);

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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Taille inconnue';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  const handleFileUpload = async (file: File) => {
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

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  }, []);

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
          <div className="w-16 h-16 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Mes CV" subtitle="Gérez vos CV téléchargés">
        <div className="rounded-3xl p-8 bg-red-50 border border-red-200">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => globalThis.location.reload()}
            className="mt-4 px-6 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
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

      <div className="space-y-8">
        {/* Hero Section avec Zone d'upload */}
        <div
          className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-300 ${
            isDragging
              ? 'bg-gradient-to-br from-[#6B9B5F] via-[#5a8a4f] to-[#4a7a3f] shadow-2xl shadow-[#6B9B5F]/30 scale-[1.02]'
              : 'bg-gradient-to-br from-[#6B9B5F] via-[#5a8a4f] to-[#4a7a3f] shadow-xl shadow-[#6B9B5F]/20'
          }`}
          style={{ animation: 'fadeIn 0.6s ease-out' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Motifs décoratifs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F7C700]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <FolderIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-3">
                  <SparklesIcon className="w-4 h-4 text-[#F7C700]" />
                  <span className="text-white/90 text-sm font-medium">Gestion des CV</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {cvs.length === 0 ? 'Ajoutez votre premier CV' : `${cvs.length} CV téléchargé${cvs.length > 1 ? 's' : ''}`}
                </h2>
                <p className="text-white/80">
                  {isDragging ? 'Déposez votre fichier ici !' : 'Glissez-déposez ou cliquez pour ajouter un CV'}
                </p>
              </div>
            </div>

            {/* Zone d'upload */}
            <div
              onClick={() => !isUploadingCV && fileInputRef.current?.click()}
              className={`cursor-pointer px-8 py-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                isDragging
                  ? 'bg-white/30 border-white scale-105'
                  : 'bg-white/10 border-white/40 hover:bg-white/20 hover:border-white/60'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                {isUploadingCV ? (
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CloudArrowUpIcon className={`w-12 h-12 text-white transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`} />
                )}
                <span className="text-white font-semibold">
                  {isUploadingCV ? 'Téléchargement...' : isDragging ? 'Déposez ici' : 'Ajouter un CV'}
                </span>
                <span className="text-white/60 text-sm">PDF uniquement, max 5MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CV téléchargés */}
          <div
            className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-[#6B9B5F]/10 transition-all"
            style={{ animation: 'fadeIn 0.6s ease-out 0.1s both' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B9B5F] to-[#5a8a4f] flex items-center justify-center shadow-lg shadow-[#6B9B5F]/30">
                <DocumentTextSolid className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">CV téléchargés</p>
                <p className="text-3xl font-bold text-gray-900">{cvs.length}</p>
              </div>
            </div>
          </div>

          {/* Vues */}
          <div
            className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-[#F7C700]/10 transition-all"
            style={{ animation: 'fadeIn 0.6s ease-out 0.2s both' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F7C700] to-[#e5b800] flex items-center justify-center shadow-lg shadow-[#F7C700]/30">
                <ChartBarIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Vues par recruteurs</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          {/* Dernier téléchargement */}
          <div
            className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-[#6B46C1]/10 transition-all"
            style={{ animation: 'fadeIn 0.6s ease-out 0.3s both' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#5a3ba3] flex items-center justify-center shadow-lg shadow-[#6B46C1]/30">
                <CalendarDaysIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Dernier ajout</p>
                <p className="text-sm font-semibold text-gray-900">
                  {cvs.length > 0 ? formatDate(cvs[0].created_at) : 'Aucun'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des CV */}
        <div
          className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden"
          style={{ animation: 'fadeIn 0.6s ease-out 0.4s both' }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#2563eb] flex items-center justify-center shadow-lg shadow-[#3B82F6]/30">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mes CV</h3>
                  <p className="text-sm text-gray-500">Gérez vos documents et suivez leur utilisation</p>
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCV}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/30 hover:shadow-xl hover:shadow-[#6B9B5F]/40 transition-all disabled:opacity-50"
              >
                <PlusIcon className="w-5 h-5" />
                <span>{isUploadingCV ? 'Upload...' : 'Ajouter un CV'}</span>
              </button>
            </div>
          </div>

          {cvs.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#3B82F6]/10 to-[#3B82F6]/5 flex items-center justify-center">
                <DocumentPlusIcon className="w-12 h-12 text-[#3B82F6]" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Aucun CV téléchargé</h4>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Téléchargez votre premier CV pour commencer à postuler aux offres d'emploi et attirer l'attention des recruteurs.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCV}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white shadow-lg shadow-[#6B9B5F]/30 hover:shadow-xl hover:shadow-[#6B9B5F]/40 transition-all disabled:opacity-50"
              >
                <CloudArrowUpIcon className="w-6 h-6" />
                <span>{isUploadingCV ? 'Téléchargement...' : 'Télécharger mon CV'}</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cvs.map((cv, index) => (
                <div
                  key={cv.id || cv.filename}
                  className="group p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all"
                  style={{ animation: `fadeIn 0.4s ease-out ${0.1 * index}s both` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 flex items-center justify-center border border-red-500/20">
                      <DocumentTextSolid className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-[#6B9B5F] transition-colors">
                        {cv.filename}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {formatDate(cv.created_at)}
                        </span>
                        {cv.file_size && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {formatFileSize(cv.file_size)}
                          </span>
                        )}
                        {cv.is_active && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-[#6B9B5F]/10 text-[#6B9B5F] rounded-full text-xs font-medium">
                            <CheckCircleIcon className="w-3 h-3" />
                            Actif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      title="Prévisualiser le CV"
                      onClick={() => handleViewCV(cv)}
                      className="p-3 rounded-xl text-gray-400 hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      title="Télécharger le CV"
                      onClick={() => handleDownloadCV(cv)}
                      className="p-3 rounded-xl text-gray-400 hover:text-[#6B9B5F] hover:bg-[#6B9B5F]/10 transition-all"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                    <button
                      title="Supprimer le CV"
                      onClick={() => handleDeleteCV(cv)}
                      className="p-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
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
        <div
          className="rounded-3xl p-6 bg-gradient-to-r from-[#F7C700]/10 to-[#F7C700]/5 border border-[#F7C700]/20"
          style={{ animation: 'fadeIn 0.6s ease-out 0.5s both' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F7C700] to-[#e5b800] flex items-center justify-center shadow-lg shadow-[#F7C700]/30 flex-shrink-0">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Conseils pour optimiser votre CV</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { text: 'Utilisez un format PDF pour une meilleure compatibilité', color: '#6B9B5F' },
                  { text: 'Gardez votre CV à jour avec vos dernières expériences', color: '#F7C700' },
                  { text: 'Adaptez votre CV en fonction du poste visé', color: '#6B46C1' },
                  { text: 'Vérifiez régulièrement les statistiques de consultation', color: '#3B82F6' },
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tip.color }} />
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
