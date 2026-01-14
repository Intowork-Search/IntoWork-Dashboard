'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { usePublicCV, useTrackCVView } from '@/hooks/useCVBuilder';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

// Brand colors
const BRAND = {
  green: '#6B9B5F',
  greenLight: '#E8F0E5',
  greenDark: '#4A7A3F',
  gold: '#F7C700',
  goldLight: '#FFF9E0',
  violet: '#6B46C1',
  violetLight: '#EDE9F7',
};

// Template-specific colors
const TEMPLATE_COLORS: Record<string, { primary: string; secondary: string; bg: string }> = {
  elegance: { primary: '#6B9B5F', secondary: '#4A7A3F', bg: '#E8F0E5' },
  bold: { primary: '#6B46C1', secondary: '#4A2E8F', bg: '#EDE9F7' },
  minimal: { primary: '#1f2937', secondary: '#6b7280', bg: '#f9fafb' },
  creative: { primary: '#F7C700', secondary: '#C49E00', bg: '#FFF9E0' },
  executive: { primary: '#1e3a5f', secondary: '#0f172a', bg: '#f8fafc' },
};

export default function PublicCVPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: cv, isLoading, error } = usePublicCV(slug);
  const trackView = useTrackCVView();

  // Track view on first load
  useEffect(() => {
    if (slug) {
      trackView.mutate(slug);
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className={`${plusJakarta.variable} font-sans min-h-screen bg-slate-50 flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#6B9B5F] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement du CV...</p>
        </div>
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className={`${plusJakarta.variable} font-sans min-h-screen bg-slate-50 flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">CV introuvable</h1>
          <p className="text-slate-600 mb-6">Ce CV n'existe pas ou n'est pas partagé publiquement.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const colors = TEMPLATE_COLORS[cv.template] || TEMPLATE_COLORS.elegance;
  const { personalInfo, experiences, educations, skills, languages } = cv.cv_data;

  return (
    <div className={`${plusJakarta.variable} font-sans min-h-screen bg-slate-100`}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-intowork.png" alt="INTOWORK" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{cv.views_count} vues</span>
            <Link
              href="/cv-builder"
              className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: colors.primary }}
            >
              Créer mon CV
            </Link>
          </div>
        </div>
      </header>

      {/* CV Content */}
      <main className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* CV Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div
              className="px-8 py-10"
              style={{ backgroundColor: colors.primary }}
            >
              <div className="flex items-center gap-6">
                {personalInfo.photo && (
                  <img
                    src={personalInfo.photo}
                    alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                )}
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-1">
                    {personalInfo.firstName} {personalInfo.lastName}
                  </h1>
                  {personalInfo.title && (
                    <p className="text-lg opacity-90">{personalInfo.title}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4">
              {personalInfo.email && (
                <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {personalInfo.email}
                </a>
              )}
              {personalInfo.phone && (
                <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {personalInfo.phone}
                </a>
              )}
              {personalInfo.address && (
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {personalInfo.address}
                </span>
              )}
            </div>

            {/* Main Content */}
            <div className="px-8 py-8">
              {/* Summary */}
              {personalInfo.summary && (
                <div className="mb-8">
                  <div
                    className="p-4 rounded-lg border-l-4"
                    style={{ backgroundColor: colors.bg, borderLeftColor: colors.primary }}
                  >
                    <p className="text-slate-700">{personalInfo.summary}</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column - Experience & Education */}
                <div className="md:col-span-2 space-y-8">
                  {/* Experience */}
                  {experiences.length > 0 && (
                    <section>
                      <h2
                        className="text-xl font-bold mb-4 pb-2 border-b-2"
                        style={{ color: colors.primary, borderBottomColor: colors.primary }}
                      >
                        Experience Professionnelle
                      </h2>
                      <div className="space-y-6">
                        {experiences.map((exp) => (
                          <div key={exp.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full" style={{ '--before-bg': colors.primary } as React.CSSProperties}>
                            <div className="before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full" style={{ backgroundColor: colors.primary }}></div>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                                <p className="text-slate-600">{exp.company}</p>
                              </div>
                              <span className="text-sm font-medium" style={{ color: colors.primary }}>
                                {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                              </span>
                            </div>
                            {exp.description && (
                              <p className="text-sm text-slate-600 mt-2">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Education */}
                  {educations.length > 0 && (
                    <section>
                      <h2
                        className="text-xl font-bold mb-4 pb-2 border-b-2"
                        style={{ color: colors.primary, borderBottomColor: colors.primary }}
                      >
                        Formation
                      </h2>
                      <div className="space-y-6">
                        {educations.map((edu) => (
                          <div key={edu.id}>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-semibold text-slate-900">{edu.degree} - {edu.field}</h3>
                                <p className="text-slate-600">{edu.school}</p>
                              </div>
                              <span className="text-sm font-medium" style={{ color: colors.primary }}>
                                {edu.startDate} - {edu.endDate}
                              </span>
                            </div>
                            {edu.description && (
                              <p className="text-sm text-slate-600 mt-2">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column - Skills & Languages */}
                <div className="space-y-8">
                  {/* Skills */}
                  {skills.length > 0 && (
                    <section>
                      <h2
                        className="text-xl font-bold mb-4 pb-2 border-b-2"
                        style={{ color: colors.primary, borderBottomColor: colors.primary }}
                      >
                        Competences
                      </h2>
                      <div className="space-y-3">
                        {skills.map((skill) => (
                          <div key={skill.id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-700">{skill.name}</span>
                              <span className="text-slate-500">{skill.level}%</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.bg }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${skill.level}%`, backgroundColor: colors.primary }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Languages */}
                  {languages.length > 0 && (
                    <section>
                      <h2
                        className="text-xl font-bold mb-4 pb-2 border-b-2"
                        style={{ color: colors.primary, borderBottomColor: colors.primary }}
                      >
                        Langues
                      </h2>
                      <div className="space-y-2">
                        {languages.map((lang) => (
                          <div key={lang.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                            <span className="text-slate-700">{lang.name}</span>
                            <span
                              className="px-2 py-0.5 text-xs font-medium rounded"
                              style={{ backgroundColor: colors.bg, color: colors.primary }}
                            >
                              {lang.level}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                CV créé avec{' '}
                <Link href="/cv-builder" className="font-medium hover:underline" style={{ color: colors.primary }}>
                  INTOWORK CV Builder
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
