"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI, type AdminCompany } from '@/lib/api';
import { logger } from '@/lib/logger';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  TrashIcon,
  BriefcaseIcon,
  UsersIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function AdminEmployersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const tc = useTranslations('common');
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; companyId: number | null; companyName: string }>({
    open: false, companyId: null, companyName: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin');
    if (status === 'authenticated' && session?.user?.role !== 'admin') router.replace('/dashboard');
  }, [status, session, router]);

  const loadCompanies = async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      const data = await adminAPI.getCompanies(session.accessToken, search || undefined);
      setCompanies(data);
    } catch (error) {
      logger.error("Erreur chargement entreprises:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) loadCompanies();
  }, [session?.accessToken, search]);

  const confirmDelete = async () => {
    if (!deleteConfirm.companyId || !session?.accessToken) return;
    setDeleting(true);
    try {
      await adminAPI.deleteCompany(session.accessToken, deleteConfirm.companyId);
      toast.success(`Entreprise "${deleteConfirm.companyName}" supprimée`);
      setDeleteConfirm({ open: false, companyId: null, companyName: '' });
      loadCompanies();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout title="Entreprises" subtitle={tc('loading')}>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Entreprises"
      subtitle={`${companies.length} entreprise${companies.length > 1 ? 's' : ''}`}
    >
      <div className="space-y-6">
        {/* Barre de recherche */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une entreprise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
              />
            </div>
            <button
              onClick={loadCompanies}
              className="px-6 py-3 bg-gradient-to-r from-[#6B9B5F] to-[#5a8a4f] text-white rounded-2xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <ArrowPathIcon className="w-5 h-5" />
              {tc('refresh')}
            </button>
          </div>
        </div>

        {/* Grille des entreprises */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              {/* En-tête */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B9B5F] to-[#5a8a4f] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#6B9B5F]/20 shrink-0">
                  {company.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{company.name}</h3>
                    {company.is_verified && (
                      <CheckBadgeIcon className="w-5 h-5 text-[#6B9B5F] shrink-0" title="Vérifiée" />
                    )}
                  </div>
                  {company.industry && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{company.industry}</p>}
                  {(company.city || company.country) && (
                    <p className="text-xs text-gray-400 mt-0.5">{[company.city, company.country].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </div>

              {/* Compteurs */}
              <div className="flex gap-3 mb-5">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl flex-1">
                  <BriefcaseIcon className="w-4 h-4 text-[#6B9B5F]" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{company.jobs_count} offre{company.jobs_count > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl flex-1">
                  <UsersIcon className="w-4 h-4 text-[#6B46C1]" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{company.employers_count} recruteur{company.employers_count > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400">{new Date(company.created_at).toLocaleDateString('fr-FR')}</span>
                <button
                  onClick={() => setDeleteConfirm({ open: true, companyId: company.id, companyName: company.name })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 rounded-xl transition-all"
                >
                  <TrashIcon className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center border border-gray-100 dark:border-gray-700">
            <BuildingOfficeIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucune entreprise trouvée</p>
          </div>
        )}
      </div>

      {/* Modal confirmation suppression */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Supprimer l&apos;entreprise</h2>
              </div>
              <button onClick={() => setDeleteConfirm({ open: false, companyId: null, companyName: '' })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Vous allez supprimer <span className="font-bold text-gray-900 dark:text-white">{deleteConfirm.companyName}</span>.
            </p>
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 mb-6">
              Toutes les offres d&apos;emploi, candidatures et notifications associées seront supprimées définitivement.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ open: false, companyId: null, companyName: '' })}
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
