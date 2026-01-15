"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI, type AdminEmployer } from '@/lib/api';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function AdminEmployersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employers, setEmployers] = useState<AdminEmployer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const loadEmployers = async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const employersData = await adminAPI.getEmployers(session.accessToken, {
        limit: 100
      });
      // Filtrer localement par recherche
      const filtered = search 
        ? employersData.filter(emp => 
            emp.company_name?.toLowerCase().includes(search.toLowerCase()) ||
            emp.first_name?.toLowerCase().includes(search.toLowerCase()) ||
            emp.last_name?.toLowerCase().includes(search.toLowerCase()) ||
            emp.email.toLowerCase().includes(search.toLowerCase())
          )
        : employersData;
      setEmployers(filtered);
    } catch (error) {
      console.error('Erreur chargement employeurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      loadEmployers();
    }
  }, [session?.accessToken, search]);

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
      subtitle={`${employers.length} entreprise${employers.length > 1 ? 's' : ''} inscrite${employers.length > 1 ? 's' : ''}`}
    >
      <div className="space-y-6">
        {/* En-tête avec recherche */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une entreprise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B9B5F]/20 focus:border-[#6B9B5F] text-gray-900 placeholder:text-gray-400 transition-all duration-200"
              />
            </div>
            <button
              onClick={loadEmployers}
              className="px-6 py-3 bg-gradient-to-r from-[#6B46C1] to-[#5a3aaa] text-white rounded-2xl hover:shadow-lg hover:shadow-[#6B46C1]/30 transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Grille des entreprises */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {employers.map((employer) => (
            <div 
              key={employer.id} 
              className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-300"
            >
              {/* En-tête */}
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6B9B5F] to-[#5a8a4f] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#6B9B5F]/20">
                  {employer.company_name?.[0] || 'E'}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{employer.company_name}</h3>
                  <p className="text-gray-600 font-medium">
                    {employer.first_name} {employer.last_name}
                  </p>
                </div>
              </div>

              {/* Informations */}
              <div className="space-y-3 mb-6">
                {employer.position && (
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl">
                    <BriefcaseIcon className="w-5 h-5 text-[#6B9B5F]" />
                    <span className="text-sm text-gray-700 font-medium">{employer.position}</span>
                  </div>
                )}
                
                {employer.phone && (
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl">
                    <PhoneIcon className="w-5 h-5 text-[#6B9B5F]" />
                    <span className="text-sm text-gray-700 font-medium">{employer.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl">
                  <EnvelopeIcon className="w-5 h-5 text-[#6B9B5F]" />
                  <span className="text-sm text-gray-700 font-medium truncate">{employer.email}</span>
                </div>
              </div>

              {/* Statut et date */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                {employer.is_active ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#6B9B5F]/10 text-[#6B9B5F]">
                    <CheckCircleIcon className="w-5 h-5" />
                    Actif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-100 text-red-700">
                    <XCircleIcon className="w-5 h-5" />
                    Inactif
                  </span>
                )}
                <span className="text-sm text-gray-500 font-medium">
                  Inscrit le {new Date(employer.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {employers.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-12 text-center border border-gray-100">
            <BuildingOfficeIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune entreprise trouvée</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
