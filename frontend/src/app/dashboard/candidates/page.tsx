'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useNextAuth';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  UserGroupIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  DocumentTextIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

interface CandidateApplication {
  id: number;
  job_id: number;
  job_title: string;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  status: string;
  applied_at: string;
  cover_letter?: string;
  notes?: string;
  cv_url?: string;
}

interface ApplicationsResponse {
  applications: CandidateApplication[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function CandidatesPage(): React.JSX.Element {
  const { getToken } = useAuth();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingApplication, setViewingApplication] = useState<CandidateApplication | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingNotes, setUpdatingNotes] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  // Polling automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      // Ne pas faire de polling si une mise à jour est en cours
      if (!updatingStatus && !updatingNotes) {
        fetchApplications(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [page, statusFilter, updatingStatus, updatingNotes]);

  const fetchApplications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) {
        setError('Authentification requise');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (statusFilter) params.append('status', statusFilter);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
      const response = await fetch(`${apiUrl}/applications/employer/applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data: ApplicationsResponse = await response.json();
      setApplications(data.applications);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      console.error('Erreur:', err);
      if (!silent) setError('Erreur lors du chargement des candidatures');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Changer le statut d'une candidature
  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const token = await getToken();
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
      const response = await fetch(`${apiUrl}/applications/employer/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Rafraîchir la liste
      await fetchApplications(true);
      
      toast.success('✅ Statut mis à jour avec succès');
      
      // Si la modal est ouverte, mettre à jour l'application affichée
      if (viewingApplication && viewingApplication.id === applicationId) {
        setViewingApplication({ ...viewingApplication, status: newStatus });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('❌ Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Mettre à jour les notes
  const handleNotesUpdate = async (applicationId: number, notes: string) => {
    try {
      setUpdatingNotes(true);
      const token = await getToken();
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
      const response = await fetch(`${apiUrl}/applications/employer/applications/${applicationId}/notes`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des notes');
      }

      // Rafraîchir la liste
      await fetchApplications(true);
      
      toast.success('✅ Notes sauvegardées avec succès');
      
      // Si la modal est ouverte, mettre à jour l'application affichée
      if (viewingApplication && viewingApplication.id === applicationId) {
        setViewingApplication({ ...viewingApplication, notes });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('❌ Erreur lors de la mise à jour des notes');
    } finally {
      setUpdatingNotes(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; className: string; icon: any } } = {
      'applied': { label: 'En attente', className: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      'pending': { label: 'En attente', className: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      'viewed': { label: 'Vue', className: 'bg-blue-100 text-blue-800', icon: EyeIcon },
      'shortlisted': { label: 'Présélectionné', className: 'bg-purple-100 text-purple-800', icon: CheckCircleIcon },
      'interview': { label: 'Entretien', className: 'bg-indigo-100 text-indigo-800', icon: UserGroupIcon },
      'accepted': { label: 'Accepté', className: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      'rejected': { label: 'Rejeté', className: 'bg-red-100 text-red-800', icon: XCircleIcon },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: ClockIcon };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        <Icon className="w-4 h-4" />
        <span>{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredApplications = applications.filter(app =>
    app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="Candidats" subtitle="Gérer les candidatures">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Candidats" subtitle="Gérer les candidatures">
      <div className="space-y-6">
        {/* Header avec stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total candidatures</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'applied' || a.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Entretiens</p>
            <p className="text-2xl font-bold text-indigo-600">
              {applications.filter(a => a.status === 'interview').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Acceptés</p>
            <p className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'accepted').length}
            </p>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Filtre par statut */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                aria-label="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="viewed">Vue</option>
                <option value="shortlisted">Présélectionné</option>
                <option value="interview">Entretien</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>

            {/* Badge En direct */}
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <span className="text-sm font-medium text-green-700">Mise à jour auto</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Liste des candidatures */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune candidature</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter ? 'Aucun résultat pour ces filtres' : 'Les candidatures apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Offre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {application.candidate_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{application.candidate_name}</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <EnvelopeIcon className="w-4 h-4" />
                              <span>{application.candidate_email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{application.job_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.applied_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setViewingApplication(application)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center space-x-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Voir</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-900"
            >
              Précédent
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-900"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Modal de détail */}
      {viewingApplication && (
        <div className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-gray-900">Détails de la candidature</h3>
              <button
                onClick={() => setViewingApplication(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fermer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations candidat */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">👤 Candidat</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-900"><strong>Nom:</strong> {viewingApplication.candidate_name}</p>
                  <p className="text-gray-900 flex items-center space-x-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span><strong>Email:</strong> {viewingApplication.candidate_email}</span>
                  </p>
                  {viewingApplication.candidate_phone && (
                    <p className="text-gray-900 flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4" />
                      <span><strong>Téléphone:</strong> {viewingApplication.candidate_phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Offre */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">💼 Offre</h4>
                <p className="text-gray-900">{viewingApplication.job_title}</p>
              </div>

              {/* Statut et date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📊 Statut</h4>
                  <div className="relative">
                    <select
                      value={viewingApplication.status}
                      onChange={(e) => handleStatusChange(viewingApplication.id, e.target.value)}
                      disabled={updatingStatus}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Changer le statut"
                    >
                      <option value="applied">En attente</option>
                      <option value="viewed">Vue</option>
                      <option value="shortlisted">Présélectionné</option>
                      <option value="interview">Entretien</option>
                      <option value="accepted">Accepté</option>
                      <option value="rejected">Rejeté</option>
                    </select>
                    {updatingStatus && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📅 Date de candidature</h4>
                  <p className="text-gray-900">{formatDate(viewingApplication.applied_at)}</p>
                </div>
              </div>

              {/* Lettre de motivation */}
              {viewingApplication.cover_letter && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">✉️ Lettre de motivation</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{viewingApplication.cover_letter}</p>
                  </div>
                </div>
              )}

              {/* CV */}
              {viewingApplication.cv_url && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📄 CV</h4>
                  <a
                    href={viewingApplication.cv_url.startsWith('http') 
                      ? viewingApplication.cv_url 
                      : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${viewingApplication.cv_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>Télécharger le CV</span>
                  </a>
                </div>
              )}

              {/* Notes */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">📝 Notes internes</h4>
                <div className="relative">
                  <textarea
                    value={viewingApplication.notes || ''}
                    onChange={(e) => {
                      setViewingApplication({ ...viewingApplication, notes: e.target.value });
                    }}
                    onBlur={() => {
                      handleNotesUpdate(viewingApplication.id, viewingApplication.notes || '');
                    }}
                    disabled={updatingNotes}
                    placeholder="Ajouter des notes sur ce candidat..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {updatingNotes && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {updatingNotes ? 'Sauvegarde en cours...' : 'Les notes se sauvegardent automatiquement'}
                </p>
              </div>

              {/* Actions rapides */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">⚡ Actions rapides</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStatusChange(viewingApplication.id, 'interview')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Convoquer en entretien
                  </button>
                  <button
                    onClick={() => handleStatusChange(viewingApplication.id, 'accepted')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleStatusChange(viewingApplication.id, 'shortlisted')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Présélectionner
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir rejeter cette candidature ?')) {
                        handleStatusChange(viewingApplication.id, 'rejected');
                      }
                    }}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Rejeter
                  </button>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setViewingApplication(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
