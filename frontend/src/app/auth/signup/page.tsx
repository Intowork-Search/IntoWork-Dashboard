'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { validatePassword } from '@/lib/passwordValidation';
import { Plus_Jakarta_Sans } from 'next/font/google';

import { getApiUrl } from '@/lib/getApiUrl';

const API_URL = getApiUrl();

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'candidate', // candidate ou employer
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation du mot de passe avec les nouvelles exigences de sécurité
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      // Afficher la première erreur rencontrée
      toast.error(passwordValidation.errors[0]);
      return;
    }

    // Vérifier que les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      // Inscription
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
      });

      if (response.data.access_token) {
        toast.success('Inscription réussie ! Connexion en cours...');

        // Connexion automatique après inscription
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error('Erreur lors de la connexion automatique');
          router.push('/auth/signin');
        } else {
          // Rediriger selon le rôle
          if (formData.role === 'employer') {
            router.push('/onboarding/employer');
          } else {
            router.push('/dashboard');
          }
          router.refresh();
        }
      }
    } catch (error: any) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Une erreur est survenue lors de l\'inscription');
      }
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={`${plusJakarta.variable} font-sans min-h-screen bg-white`} data-theme="light">
      <div className="flex min-h-screen overflow-hidden">
        {/* Left Panel - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 xl:p-16">
          {/* Background solid color */}
          <div className="absolute inset-0 bg-[var(--color-brand-green)]"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-16 xl:mb-20 animate-fade-in">
              <div className="w-12 h-12 xl:w-14 xl:h-14 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
                <SparklesIcon className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl xl:text-2xl font-bold text-white">INTOWORK</h1>
                <p className="text-xs xl:text-sm text-white/80">Plateforme de Recrutement B2B2C</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-10">
              <h2 className="text-3xl xl:text-4xl font-bold mb-10 xl:mb-12 text-white leading-tight animate-fade-in animation-delay-100">
                Rejoignez notre communauté de professionnels
              </h2>

              <div className="space-y-8">
                {/* Feature 1 - Candidates */}
                <div className="flex gap-4 animate-fade-in animation-delay-200">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <UserCircleIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Profils Candidats</h3>
                    <p className="text-white/80 leading-relaxed">Créez votre profil et accédez à des offres d'emploi adaptées à vos compétences</p>
                  </div>
                </div>

                {/* Feature 2 - Employers */}
                <div className="flex gap-4 animate-fade-in animation-delay-300">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Solutions Entreprises</h3>
                    <p className="text-white/80 leading-relaxed">Publiez vos offres et trouvez les meilleurs talents en quelques clics</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-4 animate-fade-in animation-delay-400">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <ShieldCheckIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Plateforme Sécurisée</h3>
                    <p className="text-white/80 leading-relaxed">Vos données sont protégées et conformes à la réglementation RGPD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="relative z-10 border-t border-white/20 pt-8 animate-fade-in animation-delay-500">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" />
              <span>Plateforme sécurisée et conforme RGPD</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Sign Up Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_1px,rgba(0,0,0,0.02)_1px)] bg-[length:4rem_4rem]"></div>
          </div>

          <div className="w-full max-w-md relative z-10">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10 animate-fade-in">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">INTOWORK</h1>
                <p className="text-xs sm:text-sm text-slate-600">Plateforme de Recrutement</p>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-8 sm:mb-10 animate-fade-in animation-delay-100">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">Créer un compte</h2>
              <p className="text-slate-600 text-base sm:text-lg">Rejoignez notre communauté professionnelle</p>
            </div>

            {/* Sign Up Card */}
            <div className="animate-fade-in animation-delay-200">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 backdrop-blur-sm">
                <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="form-control">
                      <label className="label pb-1 sm:pb-2" htmlFor="firstName">
                        <span className="label-text font-semibold text-slate-900 text-xs sm:text-sm">Prénom</span>
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/50 focus:border-[var(--color-brand-green)] transition-all duration-300 text-sm sm:text-base"
                        placeholder="Jean"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label pb-1 sm:pb-2" htmlFor="lastName">
                        <span className="label-text font-semibold text-slate-900 text-xs sm:text-sm">Nom</span>
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/50 focus:border-[var(--color-brand-green)] transition-all duration-300 text-sm sm:text-base"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  {/* Role selection with Heroicons */}
                  <div className="form-control">
                    <label className="label pb-2 sm:pb-3" htmlFor="role">
                      <span className="label-text font-semibold text-slate-900 text-sm sm:text-base">Je suis</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {/* Candidate option */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'candidate' })}
                        className={`relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
                          formData.role === 'candidate'
                            ? 'border-[var(--color-brand-green)] bg-[var(--green-100)] shadow-lg shadow-green-500/20'
                            : 'border-slate-300 bg-slate-50 hover:border-[var(--color-brand-green)]/50 hover:shadow-md'
                        }`}
                      >

                        <div className="relative z-10 text-center">
                          <div className="flex justify-center mb-2 sm:mb-3">
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                                formData.role === 'candidate'
                                  ? 'bg-[var(--color-brand-green)] text-white'
                                  : 'bg-slate-200 text-slate-600 group-hover:bg-[var(--green-100)]'
                              }`}
                            >
                              <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                          </div>
                          <div className="font-semibold text-slate-900 mb-0.5 sm:mb-1 text-sm sm:text-base">Candidat</div>
                          <div className={`text-xs transition-colors duration-300 ${formData.role === 'candidate' ? 'text-[var(--color-brand-green)]/80' : 'text-slate-600'}`}>
                            Je cherche un emploi
                          </div>
                        </div>
                      </button>

                      {/* Employer option */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'employer' })}
                        className={`relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
                          formData.role === 'employer'
                            ? 'border-[var(--color-brand-gold)] bg-[var(--gold-100)] shadow-lg shadow-amber-500/20'
                            : 'border-slate-300 bg-slate-50 hover:border-[var(--color-brand-gold)]/50 hover:shadow-md'
                        }`}
                      >

                        <div className="relative z-10 text-center">
                          <div className="flex justify-center mb-2 sm:mb-3">
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                                formData.role === 'employer'
                                  ? 'bg-[var(--color-brand-gold)] text-slate-900'
                                  : 'bg-slate-200 text-slate-600 group-hover:bg-[var(--gold-100)]'
                              }`}
                            >
                              <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                          </div>
                          <div className="font-semibold text-slate-900 mb-0.5 sm:mb-1 text-sm sm:text-base">Employeur</div>
                          <div className={`text-xs transition-colors duration-300 ${formData.role === 'employer' ? 'text-[var(--color-brand-gold)]/80' : 'text-slate-600'}`}>
                            Je recrute des talents
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="form-control">
                    <label className="label pb-1 sm:pb-2" htmlFor="email">
                      <span className="label-text font-semibold text-slate-900 text-sm sm:text-base">Adresse e-mail</span>
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/50 focus:border-[var(--color-brand-green)] transition-all duration-300 text-sm sm:text-base"
                        placeholder="nom.prenom@entreprise.com"
                      />
                      <EnvelopeIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="form-control">
                    <label className="label pb-1 sm:pb-2" htmlFor="password">
                      <span className="label-text font-semibold text-slate-900 text-sm sm:text-base">Mot de passe</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/50 focus:border-[var(--color-brand-green)] transition-all duration-300 text-sm sm:text-base"
                        placeholder="••••••••••••"
                      />
                      <LockClosedIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                    </div>

                    {/* Password strength indicator with requirements */}
                    <PasswordStrengthIndicator password={formData.password} />
                  </div>

                  {/* Confirm Password */}
                  <div className="form-control">
                    <label className="label pb-1 sm:pb-2" htmlFor="confirmPassword">
                      <span className="label-text font-semibold text-slate-900 text-sm sm:text-base">Confirmer le mot de passe</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/50 focus:border-[var(--color-brand-green)] transition-all duration-300 text-sm sm:text-base"
                        placeholder="••••••••••••"
                      />
                      <LockClosedIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 sm:h-12 mt-4 sm:mt-6 bg-[var(--color-brand-green)] hover:bg-[var(--green-600)] text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl relative overflow-hidden text-sm sm:text-base"
                  >

                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        <span>Inscription en cours</span>
                      </>
                    ) : (
                      <>
                        <span>Créer mon compte</span>
                        <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 sm:my-8 flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-xs text-slate-500 font-medium">OU</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* Sign in link */}
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-slate-600">
                    Vous avez déjà un compte ?{' '}
                    <Link
                      href="/auth/signin"
                      className="font-semibold text-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]/80 transition-colors duration-300 no-underline"
                    >
                      Se connecter
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 sm:mt-10 text-center animate-fade-in animation-delay-300">
              <p className="text-xs text-slate-500 leading-relaxed">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/terms" className="hover:text-slate-700 transition-colors underline underline-offset-2">
                  Conditions Générales
                </Link>{' '}
                et notre{' '}
                <Link href="/privacy" className="hover:text-slate-700 transition-colors underline underline-offset-2">
                  Politique de Confidentialité
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
