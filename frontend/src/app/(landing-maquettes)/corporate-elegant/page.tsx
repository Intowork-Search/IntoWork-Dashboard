'use client';

import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-source-sans',
  display: 'swap',
});

export default function CorporateElegantLanding() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-12 h-12 border-4 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`${playfair.variable} ${sourceSans.variable} bg-stone-50 text-stone-900`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-stone-900 flex items-center justify-center">
                <span className="text-xl font-serif font-bold text-white tracking-tight">iW</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-serif text-2xl font-bold text-stone-900 tracking-tight">INTOWORK</span>
                <span className="block text-xs text-stone-500 tracking-[0.3em] uppercase">Excellence en recrutement</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-10">
              {['Solutions', 'Secteurs', 'Expertise', 'Actualites'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-stone-600 hover:text-stone-900 font-medium transition-colors text-sm tracking-wide uppercase"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden sm:flex items-center space-x-6">
              <Link
                href="/signin"
                className="text-stone-700 hover:text-stone-900 font-medium transition-colors text-sm tracking-wide uppercase"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-stone-900 text-white font-medium text-sm tracking-wide uppercase hover:bg-stone-800 transition-colors"
              >
                Nous rejoindre
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="sm:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden pb-6 border-t border-stone-200 mt-2 pt-4">
              <div className="flex flex-col space-y-4">
                {['Solutions', 'Secteurs', 'Expertise', 'Actualites'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-stone-600 font-medium py-2 text-sm tracking-wide uppercase"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="flex flex-col space-y-3 pt-4 border-t border-stone-200">
                  <Link href="/signin" className="text-stone-700 font-medium py-2 text-center text-sm uppercase">
                    Connexion
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-stone-900 text-white font-medium py-3 text-center text-sm uppercase"
                  >
                    Nous rejoindre
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center space-x-3 mb-8">
                <div className="w-12 h-px bg-stone-400"></div>
                <span className="text-sm font-medium text-stone-500 tracking-[0.2em] uppercase">
                  Depuis 2020
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-8 text-stone-900">
                L'excellence au service de vos{' '}
                <span className="italic text-amber-700">talents</span>
              </h1>

              {/* Subheadline */}
              <p className="font-sans text-lg sm:text-xl text-stone-600 mb-10 leading-relaxed max-w-xl">
                INTOWORK accompagne les entreprises d'exception dans leur quete des meilleurs profils.
                Une approche sur-mesure, alliant technologie et expertise humaine.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-stone-900 text-white font-medium text-sm tracking-wide uppercase hover:bg-stone-800 transition-colors"
                >
                  Decouvrir nos solutions
                  <svg className="ml-3 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-stone-300 text-stone-700 font-medium text-sm tracking-wide uppercase hover:border-stone-400 transition-colors"
                >
                  Prendre rendez-vous
                </button>
              </div>

              {/* Trust indicators */}
              <div className="mt-16 pt-8 border-t border-stone-200">
                <p className="text-sm text-stone-500 mb-4 tracking-wide uppercase">Ils nous font confiance</p>
                <div className="flex items-center space-x-8">
                  {['TOTAL', 'ECOBANK', 'MTN', 'ORANGE'].map((company) => (
                    <span key={company} className="text-stone-400 font-semibold tracking-wider">{company}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Image/Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-amber-100/50 -rotate-3"></div>
              <div className="relative bg-stone-200 aspect-[4/5] flex items-center justify-center">
                <div className="text-center p-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-stone-900 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="font-serif text-2xl text-stone-700 italic">"Connecter l'excellence"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10 000+', label: 'Candidats qualifies' },
              { value: '500+', label: 'Entreprises partenaires' },
              { value: '95%', label: 'Taux de satisfaction' },
              { value: '5 ans', label: 'D\'expertise' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-4xl sm:text-5xl font-bold text-amber-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-stone-400 text-sm tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="solutions" className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-px bg-amber-600"></div>
              <span className="text-sm font-medium text-amber-700 tracking-[0.2em] uppercase">
                Nos solutions
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
              Un accompagnement personnalise
            </h2>
            <p className="text-lg text-stone-600">
              Des solutions adaptees a chaque etape de votre strategie RH, de l'identification
              des talents a leur integration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Recrutement Premium',
                description: 'Identification et selection des meilleurs profils pour vos postes strategiques.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                title: 'Conseil RH',
                description: 'Accompagnement strategique pour optimiser votre politique de gestion des talents.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                ),
              },
              {
                title: 'Assessment Center',
                description: 'Evaluation approfondie des competences et du potentiel de vos candidats.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                ),
              },
              {
                title: 'Matching IA',
                description: 'Technologie intelligente pour des correspondances candidat-poste optimales.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                ),
              },
              {
                title: 'Formation',
                description: 'Programmes de developpement sur-mesure pour vos equipes.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                ),
              },
              {
                title: 'Outplacement',
                description: 'Accompagnement des transitions professionnelles avec bienveillance.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                ),
              },
            ].map((service, idx) => (
              <div
                key={idx}
                className="group p-8 border border-stone-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-300"
              >
                <div className="text-stone-400 group-hover:text-amber-700 transition-colors mb-6">
                  {service.icon}
                </div>
                <h3 className="font-serif text-xl font-semibold text-stone-900 mb-3">{service.title}</h3>
                <p className="text-stone-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 sm:py-32 bg-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <svg className="w-16 h-16 text-amber-600/30 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-stone-800 leading-relaxed mb-10 italic">
            INTOWORK a transforme notre approche du recrutement. Leur expertise et leur
            comprehension de nos enjeux nous ont permis d'attirer les meilleurs talents du marche.
          </blockquote>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-stone-300"></div>
            <div className="text-left">
              <div className="font-semibold text-stone-900">Marie-Claire Dupont</div>
              <div className="text-stone-500 text-sm">DRH, Total Energies Afrique</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-amber-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Pret a transformer votre capital humain ?
          </h2>
          <p className="text-lg text-amber-100 mb-10 max-w-2xl mx-auto">
            Nos experts sont a votre disposition pour construire ensemble la strategie
            RH qui correspond a vos ambitions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-stone-900 font-medium text-sm tracking-wide uppercase hover:bg-stone-100 transition-colors"
            >
              Demander une consultation
            </Link>
            <button
              type="button"
              className="px-8 py-4 border-2 border-white text-white font-medium text-sm tracking-wide uppercase hover:bg-white/10 transition-colors"
            >
              Telecharger notre brochure
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white flex items-center justify-center">
                  <span className="text-xl font-serif font-bold text-stone-900">iW</span>
                </div>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed">
                INTOWORK - L'excellence au service de vos talents depuis 2020.
              </p>
            </div>

            {[
              { title: 'Solutions', links: ['Recrutement', 'Conseil RH', 'Formation', 'Assessment'] },
              { title: 'Entreprise', links: ['A propos', 'Notre equipe', 'Carrieres', 'Contact'] },
              { title: 'Ressources', links: ['Blog', 'Etudes', 'Evenements', 'Presse'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-stone-400 hover:text-amber-500 text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-stone-500 text-sm">
              © 2026 INTOWORK. Tous droits reserves.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-stone-400 hover:text-amber-500 transition-colors text-sm">Mentions legales</a>
              <a href="#" className="text-stone-400 hover:text-amber-500 transition-colors text-sm">Confidentialite</a>
              <a href="#" className="text-stone-400 hover:text-amber-500 transition-colors text-sm">CGU</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
