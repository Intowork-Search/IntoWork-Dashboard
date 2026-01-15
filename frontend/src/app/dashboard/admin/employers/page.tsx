"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI, type AdminEmployer } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

export default function AdminEmployersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employers, setEmployers] = useState<AdminEmployer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmployers, setTotalEmployers] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const loadEmployers = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const employersData = await adminAPI.getEmployers(session.accessToken, {
          limit: ITEMS_PER_PAGE,
          skip: (currentPage - 1) * ITEMS_PER_PAGE
        });
        setEmployers(employersData);
        // Vous pouvez ajouter un appel pour récupérer le total si l'API le supporte
        setTotalEmployers(employersData.length); 
      } catch (error) {
        console.error('Erreur chargement entreprises:', error);
        toast.error('Erreur lors du chargement des entreprises');
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      loadEmployers();
    }
  }, [session?.accessToken, currentPage]);

  const totalPages = Math.ceil(totalEmployers / ITEMS_PER_PAGE);

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout title="Entreprises" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Gestion des entreprises" 
      subtitle={`${totalEmployers} entreprise${totalEmployers > 1 ? 's' : ''} inscrite${totalEmployers > 1 ? 's' : ''}`}
    >
      {/* Liste des entreprises */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employers.map((employer) => (
          <div
            key={employer.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#6B9B5F] to-[#5a8a4f] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {employer.company_name?.[0] || 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                  {employer.company_name || 'Sans nom'}
                </h3>
                <p className="text-sm text-gray-500">
                  ID: {employer.id}
                </p>
              </div>
            </div>

            {/* Informations */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                <span>{employer.position || 'Poste non spécifié'}</span>
              </div>

              {employer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <span>{employer.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UsersIcon className="w-4 h-4 text-gray-400" />
                <span>{employer.email}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Inscrit le {new Date(employer.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {employers.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune entreprise trouvée</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} sur {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
