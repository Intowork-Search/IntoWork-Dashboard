'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/hooks/useNextAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { candidatesAPI, authAPI, CV } from '@/lib/api';
import { 
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  CalendarDaysIcon,
  PlusIcon
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
        const token = await getToken();
        if (!token) {
          setError('Token d&apos;authentification manquant');
          return;
        }

        // Synchroniser l'utilisateur avec le backend (non bloquant)
        const syncPromise = authAPI.syncUser({
          clerk_id: user?.id || '',
          email: user?.emailAddresses[0]?.emailAddress || '',
          first_name: user?.firstName || '',
          last_name: user?.lastName || '',
          role: (user?.publicMetadata?.role as 'candidate' | 'employer' | 'admin') || 'candidate',
        }, token).catch(syncError => {
          console.log('Utilisateur déjà synchronisé ou erreur de sync:', syncError);
        });

        // Charger les données en parallèle pour optimiser les performances
        const [profileData, cvsData] = await Promise.all([
          candidatesAPI.getMyProfile(token).then(data => {
            setLoadingStates(prev => ({ ...prev, profile: false }));
            return data;
          }),
          candidatesAPI.listCVs(token).then(data => {
            setLoadingStates(prev => ({ ...prev, cvs: false }));
            return data;
          }),
          syncPromise.then(() => {
            setLoadingStates(prev => ({ ...prev, sync: false }));
          })
        ]);

        // Debug: Afficher les données du profil
        console.log('Profile CV data:', {
          cv_filename: profileData.cv_filename,
          cv_uploaded_at: profileData.cv_uploaded_at,
          cv_url: profileData.cv_url
        });

        // Définir les CV chargés
        setCvs(cvsData);
        console.log('📋 CV chargés depuis l\'API parallèle:', cvsData);
        console.log('📊 Nombre de CV:', cvsData.length);

      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, getToken]);

  // Fonction pour recharger les données
  const reloadData = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const profileData = await candidatesAPI.getMyProfile(token);
      
      // Essayer de charger les CV depuis la nouvelle API
      try {
        const cvsData = await candidatesAPI.listCVs(token);
        setCvs(cvsData);
        console.log('📋 CV rechargés:', cvsData);
      } catch (cvError) {
        console.log('⚠️ Nouvelle API non disponible, utilisation du mode legacy');
        console.debug('Erreur API CV:', cvError);
        // Fallback vers l'ancien système
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
      console.error('❌ Erreur lors du rechargement:', error);
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

  // Fonction pour gérer le téléchargement de CV
  // Fonction pour visualiser le CV
  const handleViewCV = async (cv: CV) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      console.log('🔍 Ouverture du CV:', cv.filename);
      
      let blob: Blob;
      
      // Utiliser la nouvelle API si l'ID est valide (pas legacy)
      if (cv.id > 0) {
        blob = await candidatesAPI.downloadSpecificCV(token, cv.id);
      } else {
        // Mode legacy
        blob = await candidatesAPI.downloadCV(token);
      }
      
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Nettoyer l'URL après un délai
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      
    } catch (error) {
      console.error('❌ Erreur lors de la visualisation:', error);
      alert('Erreur lors de l\'ouverture du CV');
    }
  };

  // Fonction pour télécharger le CV
  const handleDownloadCV = async (cv: CV) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      console.log('📥 Téléchargement du CV:', cv.filename);
      
      let blob: Blob;
      
      // Utiliser la nouvelle API si l'ID est valide (pas legacy)
      if (cv.id > 0) {
        blob = await candidatesAPI.downloadSpecificCV(token, cv.id);
      } else {
        // Mode legacy
        blob = await candidatesAPI.downloadCV(token);
      }
      
      const url = URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = cv.filename;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      link.remove();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du CV');
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (file.type !== 'application/pdf') {
      alert('Veuillez sélectionner un fichier PDF.');
      return;
    }

    // Vérifier la taille (max 5MB)
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

      console.log('📤 Début du téléchargement CV:', file.name);

      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch(`https://intowork-dashboard-production.up.railway.app/api/candidates/cv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📡 Réponse serveur:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Résultat:', result);
        
        alert('CV téléchargé avec succès !');
        
        // Recharger les données sans recharger toute la page
        await reloadData();
        
        // Recharger aussi la liste des CV avec la nouvelle API
        try {
          const cvsData = await candidatesAPI.listCVs(token);
          setCvs(cvsData);
          console.log('🔄 Liste CV rechargée après upload:', cvsData);
        } catch (error) {
          console.log('ℹ️ Rechargement via mode legacy après upload');
          console.debug('Erreur rechargement CV:', error);
          // En cas d'erreur, recharger toutes les données
          await reloadData();
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur serveur:', errorData);
        alert(`Erreur lors du téléchargement: ${errorData.detail || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('💥 Erreur lors du téléchargement du CV:', error);
      alert('Erreur lors du téléchargement du CV');
    } finally {
      setIsUploadingCV(false);
      // Réinitialiser l'input
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

      console.log('🗑️ Suppression du CV:', cv.filename);
      
      if (cv.id > 0) {
        // Utiliser la nouvelle API
        await candidatesAPI.deleteCV(token, cv.id);
        console.log('✅ CV supprimé via nouvelle API');
      } else {
        // Mode legacy - mettre à jour le profil pour "supprimer" le CV
        await candidatesAPI.updateMyProfile(token, {
          cv_filename: undefined,
          cv_uploaded_at: undefined,
          cv_url: undefined
        });
        console.log('✅ CV supprimé via mode legacy');
      }
      
      alert('CV supprimé avec succès');
      
      // Mettre à jour la liste locale
      setCvs(cvs.filter(existingCV => existingCV.id !== cv.id));
      
      // Recharger les données
      await reloadData();
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du CV');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Mes CV" subtitle="Gérez vos CV téléchargés">
        {/* Header avec bouton skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="animate-pulse h-10 bg-blue-200 rounded w-36"></div>
        </div>

        {/* Cards skeleton avec état de chargement granulaire */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="animate-pulse h-10 w-10 bg-gray-300 rounded-lg"></div>
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicateurs de progression pour chaque API */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Chargement en cours...</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${loadingStates.sync ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-gray-600">Synchronisation utilisateur</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${loadingStates.profile ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-gray-600">Chargement du profil</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${loadingStates.cvs ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-gray-600">Récupération des CV</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Mes CV" subtitle="Gérez vos CV téléchargés">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mes CV" subtitle="Gérez vos CV téléchargés">
      {/* Input global pour l'upload de CV */}
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CV téléchargés</p>
                <p className="text-2xl font-semibold text-gray-900">{cvs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <EyeIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vues par les recruteurs</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <CalendarDaysIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dernier téléchargement</p>
                <p className="text-sm font-semibold text-gray-900">
                  {cvs.length > 0 ? formatDate(cvs[0].created_at) : 'Aucun'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des CV */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mes CV</h2>
              <p className="text-sm text-gray-600 mt-1">
                Gérez vos CV téléchargés et suivez leur utilisation
              </p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingCV}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              title="Ajouter un nouveau CV"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Ajouter un CV</span>
            </button>
          </div>

          {cvs.length === 0 ? (
            <div className="p-12 text-center">
              <CloudArrowUpIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun CV téléchargé</h3>
              <p className="text-gray-600 mb-6">
                Téléchargez votre premier CV pour commencer à postuler aux offres d&apos;emploi.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCV}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isUploadingCV ? 'Téléchargement...' : 'Télécharger un CV'}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cvs.map((cv) => (
                <div key={cv.id || cv.filename} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{cv.filename}</h3>
                      <p className="text-sm text-gray-600">
                        Téléchargé le {formatDate(cv.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button 
                      title="Prévisualiser le CV"
                      onClick={() => handleViewCV(cv)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button 
                      title="Télécharger le CV"
                      onClick={() => handleDownloadCV(cv)}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                    <button 
                      title="Supprimer le CV"
                      onClick={() => handleDeleteCV(cv)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">💡 Conseils pour optimiser votre CV</h3>
          <ul className="text-sm text-blue-800 space-y-1">
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
