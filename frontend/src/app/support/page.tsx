'use client';

import Link from 'next/link';
import {
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export default function SupportPage() {
  return (
    <div className={`${plusJakarta.variable} font-sans min-h-screen bg-white`}>
      {/* Header with logo */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-brand-green)] rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">INTOWORK</h1>
                <p className="text-xs sm:text-sm text-slate-600">Support & Aide</p>
              </div>
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]/80 transition-colors no-underline"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Retour à la connexion</span>
              <span className="sm:hidden">Retour</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--green-50)] to-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[var(--green-100)] mb-6 sm:mb-8">
            <span className="w-2 h-2 bg-[var(--color-brand-green)] rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-[var(--color-brand-green)]">Support 24/7</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans votre expérience INTOWORK.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Email Support */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-slate-200 hover:border-[var(--color-brand-green)] transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[var(--green-100)] flex items-center justify-center mb-6">
                <EnvelopeIcon className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--color-brand-green)]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Email</h3>
              <p className="text-slate-600 mb-6 text-sm sm:text-base">
                Envoyez-nous un email et nous vous répondrons dans les 24 heures.
              </p>
              <a
                href="mailto:support@intowork.co"
                className="inline-flex items-center gap-2 text-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]/80 font-semibold transition-colors no-underline text-sm sm:text-base"
              >
                support@intowork.co
                <EnvelopeIcon className="w-4 h-4" />
              </a>
            </div>

            {/* Phone Support */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-slate-200 hover:border-[var(--color-brand-gold)] transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[var(--gold-100)] flex items-center justify-center mb-6">
                <PhoneIcon className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--color-brand-gold)]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Téléphone</h3>
              <p className="text-slate-600 mb-6 text-sm sm:text-base">
                Appelez-nous du lundi au vendredi, de 9h à 18h.
              </p>
              <a
                href="tel:+33123456789"
                className="inline-flex items-center gap-2 text-[var(--color-brand-gold)] hover:text-[var(--color-brand-gold)]/80 font-semibold transition-colors no-underline text-sm sm:text-base"
              >
                +33 1 23 45 67 89
                <PhoneIcon className="w-4 h-4" />
              </a>
            </div>

            {/* Chat Support */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-slate-200 hover:border-[var(--color-brand-violet)] transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[var(--violet-100)] flex items-center justify-center mb-6">
                <ChatBubbleLeftRightIcon className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--color-brand-violet)]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Chat en direct</h3>
              <p className="text-slate-600 mb-6 text-sm sm:text-base">
                Discutez avec notre équipe en temps réel pour une assistance immédiate.
              </p>
              <button className="inline-flex items-center gap-2 text-[var(--color-brand-violet)] hover:text-[var(--color-brand-violet)]/80 font-semibold transition-colors text-sm sm:text-base">
                Démarrer le chat
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--green-100)] mb-6">
              <QuestionMarkCircleIcon className="w-8 h-8 text-[var(--color-brand-green)]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Trouvez rapidement des réponses aux questions les plus courantes
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <details className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[var(--color-brand-green)] transition-colors group">
              <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between text-sm sm:text-base">
                Comment créer un compte sur INTOWORK ?
                <span className="text-[var(--color-brand-green)] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-slate-600 mt-4 text-sm sm:text-base">
                Pour créer un compte, cliquez sur "S'inscrire" en haut de la page, choisissez votre type de compte (Candidat ou Employeur), puis remplissez le formulaire d'inscription avec vos informations.
              </p>
            </details>

            {/* FAQ Item 2 */}
            <details className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[var(--color-brand-green)] transition-colors group">
              <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between text-sm sm:text-base">
                Comment réinitialiser mon mot de passe ?
                <span className="text-[var(--color-brand-green)] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-slate-600 mt-4 text-sm sm:text-base">
                Cliquez sur "Mot de passe oublié" sur la page de connexion, entrez votre adresse email, et suivez les instructions envoyées par email pour réinitialiser votre mot de passe.
              </p>
            </details>

            {/* FAQ Item 3 */}
            <details className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[var(--color-brand-green)] transition-colors group">
              <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between text-sm sm:text-base">
                Comment puis-je postuler à une offre d'emploi ?
                <span className="text-[var(--color-brand-green)] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-slate-600 mt-4 text-sm sm:text-base">
                Connectez-vous à votre compte candidat, parcourez les offres d'emploi, cliquez sur une offre qui vous intéresse, puis cliquez sur "Postuler". Assurez-vous d'avoir complété votre profil et téléchargé votre CV.
              </p>
            </details>

            {/* FAQ Item 4 */}
            <details className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[var(--color-brand-green)] transition-colors group">
              <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between text-sm sm:text-base">
                Mes données sont-elles protégées ?
                <span className="text-[var(--color-brand-green)] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-slate-600 mt-4 text-sm sm:text-base">
                Oui, nous prenons la sécurité de vos données très au sérieux. Notre plateforme est conforme au RGPD et utilise des protocoles de sécurité avancés pour protéger vos informations personnelles.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[var(--color-brand-green)]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-base sm:text-lg text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Notre équipe de support est là pour vous aider. Contactez-nous et nous vous répondrons rapidement.
          </p>
          <a
            href="mailto:support@intowork.co"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[var(--color-brand-green)] font-semibold rounded-xl hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl no-underline text-sm sm:text-base"
          >
            <EnvelopeIcon className="w-5 h-5" />
            Envoyer un email
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-600">
            <Link href="/terms" className="hover:text-[var(--color-brand-green)] transition-colors">
              Conditions Générales
            </Link>
            {' • '}
            <Link href="/privacy" className="hover:text-[var(--color-brand-green)] transition-colors">
              Politique de Confidentialité
            </Link>
          </p>
          <p className="text-xs text-slate-500 mt-4">
            © {new Date().getFullYear()} INTOWORK. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
