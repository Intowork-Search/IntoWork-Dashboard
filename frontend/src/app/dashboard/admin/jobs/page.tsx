"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI, type AdminJob } from '@/lib/api';
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

export default function AdminJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const loadJobs = async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const jobsData = await adminAPI.getJobs(session.accessToken, {
        limit: ITEMS_PER_PAGE,
        skip: (currentPage - 1) * ITEMS_PER_PAGE
      });
      setJobs(jobsData);
    } catch (error) {
      console.error('Erreur chargement offres:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      loadJobs();
    }
  }, [session?.accessToken, search, currentPage]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-[#6B9B5F]/10 text-[#6B9B5F]">
            <CheckCircleIcon className="w-5 h-5" />
            Active
          </span>
        );
      case 'filled':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-blue-100 text-blue-700">
            <CheckCircleIcon className="w-5 h-5" />
            Pourvue
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-[#F7C700]/10 text-[#b39200]">
            <XCircleIcon className="w-5 h-5" />
            Brouillon
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-red-100 text-red-700">
            <XCircleIcon className="w-5 h-5" />
            Expirée
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700">
            <XCircleIcon className="w-5 h-5" />
            Fermée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);

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
      subtitle={`${jobs.length} offre${jobs.length > 1 ? 's' : ''} publiée${jobs.length > 1 ? 's' : ''}`}
    >
      <div className="space-y-6">
        {/* En-tête avec recherche */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une offre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] text-gray-900 placeholder:text-gray-400 transition-all duration-200"
              />
            </div>
            <button
              onClick={loadJobs}
              className="px-6 py-3 bg-gradient-to-r from-[#F7C700] to-[#e0b400] text-white rounded-2xl hover:shadow-lg hover:shadow-[#F7C700]/30 transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Liste des offres */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Icône */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B9B5F] to-[#5a8a4f] flex items-center justify-center text-white font-bold shadow-lg shadow-[#6B9B5F]/20 flex-shrink-0">
                  <BriefcaseIcon className="w-7 h-7" />
                </div>

                {/* Contenu */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="w-5 h-5 text-[#6B9B5F]" />
                          <span className="font-medium">{job.company_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-5 h-5 text-[#6B9B5F]" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>

                  {/* Statistiques */}
                  <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 font-medium">
                          {job.applications_count} candidature{job.applications_count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        Publié le {new Date(job.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-12 text-center border border-gray-100">
            <BriefcaseIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune offre trouvée</p>
          </div>
        )}

        {/* Pagination */}
        {jobs.length > 0 && totalPages > 1 && (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                Précédent
              </button>
              <span className="text-gray-600 font-medium">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                Suivant
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
