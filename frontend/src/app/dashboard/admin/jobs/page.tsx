"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI, type AdminJob } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

export default function AdminJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const loadJobs = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const jobsData = await adminAPI.getJobs(session.accessToken, {
          limit: ITEMS_PER_PAGE,
          skip: (currentPage - 1) * ITEMS_PER_PAGE
        });
        setJobs(jobsData);
        // Vous pouvez ajouter un appel pour récupérer le total si l'API le supporte
        setTotalJobs(jobsData.length);
      } catch (error) {
        console.error('Erreur chargement offres:', error);
        toast.error('Erreur lors du chargement des offres');
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      loadJobs();
    }
  }, [session?.accessToken, currentPage]);

  const totalPages = Math.ceil(totalJobs / ITEMS_PER_PAGE);

  const formatSalary = (job: AdminJob) => {
    return 'Salaire non spécifié';
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout title="Offres d'emploi" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#6B9B5F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Gestion des offres d'emploi" 
      subtitle={`${totalJobs} offre${totalJobs > 1 ? 's' : ''} publiée${totalJobs > 1 ? 's' : ''}`}
    >
      {/* Liste des offres */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Contenu principal */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F7C700] to-[#e5b800] flex items-center justify-center flex-shrink-0">
                    <BriefcaseIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span className="font-medium">{job.company_name}</span>
                    </div>
                  </div>
                </div>

                {/* Détails */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                    <span>{job.location || 'Non spécifié'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CurrencyEuroIcon className="w-4 h-4 text-gray-400" />
                    <span>{formatSalary(job)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                    <span>{job.status || 'Statut non spécifié'}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>{job.applications_count || 0} candidatures</span>
                  <span>Publié le {new Date(job.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {/* Statut */}
              <div>
                {job.status === 'active' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-4 h-4" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <XCircleIcon className="w-4 h-4" />
                    {job.status || 'Inactive'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune offre d'emploi trouvée</p>
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
