'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import {
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  EyeIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { getApiUrl } from '@/lib/getApiUrl';
import { formatCurrency, getCountryLabel } from '@/constants/geo';
import { logger } from '@/lib/logger';

const API_URL = getApiUrl();

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
});

interface JobDetail {
  id: number;
  title: string;
  company_name: string;
  company_logo_url: string | null;
  company_description?: string;
  company_industry?: string;
  company_size?: string;
  location: string;
  location_type: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  country?: string;
  zone?: string;
  language?: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  // Champs enrichis
  context?: string;
  mission_principale?: string;
  profil_formation?: string;
  profil_experience?: string;
  profil_competences?: string;
  profil_posture?: string;
  profil_autre?: string;
  posted_at: string;
  is_featured: boolean;
  views_count: number;
  applications_count: number;
  has_applied: boolean;
  status: string;
}

const formatJobType = (jobType: string) => {
  const types: Record<string, string> = {
    full_time: 'Temps plein',
    part_time: 'Temps partiel',
    contract: 'Contrat',
    temporary: 'Temporaire',
    internship: 'Stage',
    freelance: 'Freelance',
  };
  return types[jobType] || jobType;
};

const formatLocationType = (locationType: string) => {
  const types: Record<string, string> = {
    on_site: 'Présentiel',
    remote: 'Télétravail',
    hybrid: 'Hybride',
  };
  return types[locationType] || locationType;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function OffreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/jobs/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setJob(data);
        } else {
          logger.error('Offre introuvable', { jobId });
        }
      } catch (error) {
        logger.error('Erreur chargement offre:', error);
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  const formatSalary = (j: JobDetail) => {
    const cur = j.currency || 'XAF';
    if (j.salary_min && j.salary_max) {
      return `${formatCurrency(j.salary_min, cur)} – ${formatCurrency(j.salary_max, cur)}`;
    } else if (j.salary_min) {
      return `À partir de ${formatCurrency(j.salary_min, cur)}`;
    } else if (j.salary_max) {
      return `Jusqu'à ${formatCurrency(j.salary_max, cur)}`;
    }
    return 'Salaire non spécifié';
  };

  return (
    <div className={`${plusJakarta.variable} font-sans min-h-screen bg-slate-50`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center">
              <img src="/logo-intowork.png" alt="INTOWORK" className="h-32 sm:h-40 md:h-48 lg:h-56 w-auto" />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-600 hover:text-green-600 font-medium transition-colors text-sm">Accueil</Link>
              <Link href="/offres" className="text-green-600 font-semibold transition-colors text-sm">Offres</Link>
              <Link href="/entreprises" className="text-slate-600 hover:text-green-600 font-medium transition-colors text-sm">Entreprises</Link>
            </div>

            <div className="hidden sm:flex items-center space-x-3 sm:space-x-4">
              <Link href="/signin" className="text-slate-700 hover:text-green-600 font-semibold transition-colors text-sm">Connexion</Link>
              <Link href="/signup" className="btn btn-primary btn-sm rounded-full px-4 sm:px-6 normal-case font-semibold text-sm h-9 sm:h-10">Inscription</Link>
            </div>

            <button
              type="button"
              className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="sm:hidden pb-4">
              <div className="flex flex-col space-y-3">
                <Link href="/" className="text-slate-600 hover:text-green-600 font-medium transition-colors py-2">Accueil</Link>
                <Link href="/offres" className="text-green-600 font-semibold transition-colors py-2">Offres</Link>
                <Link href="/entreprises" className="text-slate-600 hover:text-green-600 font-medium transition-colors py-2">Entreprises</Link>
                <div className="border-t border-slate-200 pt-3 flex flex-col space-y-2">
                  <Link href="/signin" className="text-slate-700 hover:text-green-600 font-semibold transition-colors py-2 text-center">Connexion</Link>
                  <Link href="/signup" className="btn btn-primary rounded-full normal-case font-semibold w-full">Inscription</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="pt-24 sm:pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Retour */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-green-600 font-medium mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour aux offres
          </button>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Chargement de l'offre…</p>
            </div>
          ) : !job ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <BriefcaseIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Offre introuvable</h2>
              <p className="text-slate-500 mb-6">Cette offre n'existe pas ou a été supprimée.</p>
              <Link href="/offres" className="btn btn-primary rounded-full normal-case">Voir toutes les offres</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header carte */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
                      {job.company_logo_url ? (
                        <img src={job.company_logo_url} alt={job.company_name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <BuildingOfficeIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{job.title}</h1>
                      <p className="text-lg text-slate-700 font-medium">{job.company_name}</p>
                    </div>
                  </div>
                  <Link
                    href={`/signin?redirect=/dashboard/jobs/${job.id}`}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg shrink-0 self-start"
                  >
                    <span>Postuler</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700">{formatJobType(job.job_type)}</span>
                  <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700">{formatLocationType(job.location_type)}</span>
                  {job.location && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700">
                      <MapPinIcon className="w-4 h-4" />{job.location}
                    </span>
                  )}
                  {job.country && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700">
                      <GlobeAltIcon className="w-4 h-4" />{getCountryLabel(job.country)}
                    </span>
                  )}
                </div>

                {/* Méta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(job.salary_min || job.salary_max) && (
                    <div className="col-span-2 flex items-center gap-2 text-sm text-slate-700 bg-green-50 rounded-xl px-4 py-3">
                      <CurrencyEuroIcon className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="font-semibold">{formatSalary(job)}</span>
                    </div>
                  )}
                  {job.posted_at && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">
                      <CalendarDaysIcon className="w-4 h-4 shrink-0" />
                      <span>Publié le {formatDate(job.posted_at)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">
                    <EyeIcon className="w-4 h-4 shrink-0" />
                    <span>{job.views_count} vue{job.views_count > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">
                    <UserGroupIcon className="w-4 h-4 shrink-0" />
                    <span>{job.applications_count} candidature{job.applications_count > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Description du poste</h2>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </div>

              {/* Contexte */}
              {job.context && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Contexte</h2>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{job.context}</p>
                </div>
              )}

              {/* Mission principale */}
              {job.mission_principale && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Mission principale</h2>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{job.mission_principale}</p>
                </div>
              )}

              {/* Profil recherché */}
              {(job.profil_formation || job.profil_experience || job.profil_competences || job.profil_posture || job.profil_autre) && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Profil recherché</h2>
                  <div className="space-y-5">
                    {job.profil_formation && (
                      <div className="border-l-4 border-green-400 pl-4">
                        <h3 className="text-base font-bold text-slate-800 mb-2">Formation</h3>
                        <p className="text-slate-700 whitespace-pre-wrap">{job.profil_formation}</p>
                      </div>
                    )}
                    {job.profil_experience && (
                      <div className="border-l-4 border-blue-400 pl-4">
                        <h3 className="text-base font-bold text-slate-800 mb-2">Profil &amp; Expérience</h3>
                        <p className="text-slate-700 whitespace-pre-wrap">{job.profil_experience}</p>
                      </div>
                    )}
                    {job.profil_competences && (
                      <div className="border-l-4 border-purple-400 pl-4">
                        <h3 className="text-base font-bold text-slate-800 mb-2">Compétences</h3>
                        <p className="text-slate-700 whitespace-pre-wrap">{job.profil_competences}</p>
                      </div>
                    )}
                    {job.profil_posture && (
                      <div className="border-l-4 border-orange-400 pl-4">
                        <h3 className="text-base font-bold text-slate-800 mb-2">Posture comportementale</h3>
                        <p className="text-slate-700 whitespace-pre-wrap">{job.profil_posture}</p>
                      </div>
                    )}
                    {job.profil_autre && (
                      <div className="border-l-4 border-slate-300 pl-4">
                        <h3 className="text-base font-bold text-slate-800 mb-2">Autre</h3>
                        <p className="text-slate-700 whitespace-pre-wrap">{job.profil_autre}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Exigences (ancien champ) */}
              {job.requirements && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Exigences</h2>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
                </div>
              )}

              {/* Responsabilités (ancien champ) */}
              {job.responsibilities && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Responsabilités</h2>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{job.responsibilities}</p>
                </div>
              )}

              {/* Avantages */}
              {job.benefits && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Avantages</h2>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{job.benefits}</p>
                </div>
              )}

              {/* Entreprise */}
              {(job.company_description || job.company_industry || job.company_size) && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">À propos de {job.company_name}</h2>
                  {job.company_description && (
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mb-4">{job.company_description}</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {job.company_industry && (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm">{job.company_industry}</span>
                    )}
                    {job.company_size && (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm">{job.company_size}</span>
                    )}
                  </div>
                </div>
              )}

              {/* CTA postuler */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-3">Ce poste vous correspond ?</h2>
                <p className="text-white/90 mb-6">Créez votre compte ou connectez-vous pour postuler</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={`/signin?redirect=/dashboard/jobs/${job.id}`}
                    className="btn bg-white text-green-700 hover:bg-slate-50 btn-lg rounded-full px-8 normal-case font-bold"
                  >
                    Postuler maintenant
                  </Link>
                  <Link
                    href="/signup"
                    className="btn btn-outline border-2 border-white text-white hover:bg-white hover:text-green-700 btn-lg rounded-full px-8 normal-case font-semibold"
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/">
            <img src="/logo-intowork.png" alt="INTOWORK" className="h-24 w-auto" />
          </Link>
          <p className="text-sm text-slate-400">© 2026 INTOWORK. Tous droits réservés.</p>
          <div className="flex gap-4 text-sm text-slate-400">
            <Link href="/offres" className="hover:text-green-400 transition-colors">Offres</Link>
            <Link href="/entreprises" className="hover:text-green-400 transition-colors">Entreprises</Link>
            <Link href="/signup" className="hover:text-green-400 transition-colors">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
