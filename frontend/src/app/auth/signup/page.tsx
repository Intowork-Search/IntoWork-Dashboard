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

import { getApiUrl } from '@/lib/getApiUrl';

const API_URL = getApiUrl();

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
    <div className="min-h-screen bg-base-100" data-theme="light">
      <div className="flex min-h-screen overflow-hidden">
        {/* Left Panel - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
          {/* Background solid color */}
          <div className="absolute inset-0 bg-primary"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-20 animate-fade-in">
              <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">INTOWORK</h1>
                <p className="text-sm text-white/80">Plateforme de Recrutement B2B2C</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-10">
              <h2 className="text-4xl font-bold mb-12 text-white leading-tight animate-fade-in animation-delay-100">
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
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-base-100 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_1px,rgba(0,0,0,0.02)_1px)] bg-[length:4rem_4rem]"></div>
          </div>

          <div className="w-full max-w-md relative z-10">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10 animate-fade-in">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-base-content">INTOWORK</h1>
                <p className="text-sm text-base-content/60">Plateforme de Recrutement</p>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-10 animate-fade-in animation-delay-100">
              <h2 className="text-4xl font-bold text-base-content mb-3">Créer un compte</h2>
              <p className="text-base-content/60 text-lg">Rejoignez notre communauté professionnelle</p>
            </div>

            {/* Sign Up Card */}
            <div className="animate-fade-in animation-delay-200">
              <div className="bg-white rounded-2xl shadow-lg border border-base-200 p-8 backdrop-blur-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label pb-2" htmlFor="firstName">
                        <span className="label-text font-semibold text-base-content text-sm">Prénom</span>
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-xl text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                        placeholder="Jean"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label pb-2" htmlFor="lastName">
                        <span className="label-text font-semibold text-base-content text-sm">Nom</span>
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-xl text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  {/* Role selection with Heroicons */}
                  <div className="form-control">
                    <label className="label pb-3" htmlFor="role">
                      <span className="label-text font-semibold text-base-content text-base">Je suis</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Candidate option */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'candidate' })}
                        className={`relative p-5 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
                          formData.role === 'candidate'
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                            : 'border-base-300 bg-base-100 hover:border-primary/50 hover:shadow-md'
                        }`}
                      >

                        <div className="relative z-10 text-center">
                          <div className="flex justify-center mb-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                                formData.role === 'candidate'
                                  ? 'bg-primary text-white'
                                  : 'bg-base-200 text-base-content/60 group-hover:bg-primary/20'
                              }`}
                            >
                              <UserCircleIcon className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="font-semibold text-base-content mb-1">Candidat</div>
                          <div className={`text-xs transition-colors duration-300 ${formData.role === 'candidate' ? 'text-primary/80' : 'text-base-content/60'}`}>
                            Je cherche un emploi
                          </div>
                        </div>
                      </button>

                      {/* Employer option */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'employer' })}
                        className={`relative p-5 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
                          formData.role === 'employer'
                            ? 'border-secondary bg-secondary/10 shadow-lg shadow-secondary/20'
                            : 'border-base-300 bg-base-100 hover:border-secondary/50 hover:shadow-md'
                        }`}
                      >

                        <div className="relative z-10 text-center">
                          <div className="flex justify-center mb-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                                formData.role === 'employer'
                                  ? 'bg-secondary text-white'
                                  : 'bg-base-200 text-base-content/60 group-hover:bg-secondary/20'
                              }`}
                            >
                              <BuildingOfficeIcon className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="font-semibold text-base-content mb-1">Employeur</div>
                          <div className={`text-xs transition-colors duration-300 ${formData.role === 'employer' ? 'text-secondary/80' : 'text-base-content/60'}`}>
                            Je recrute des talents
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="form-control">
                    <label className="label pb-2" htmlFor="email">
                      <span className="label-text font-semibold text-base-content text-base">Adresse e-mail</span>
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
                        className="w-full px-4 py-3 pl-12 bg-base-100 border border-base-300 rounded-xl text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                        placeholder="nom.prenom@entreprise.com"
                      />
                      <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/40" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="form-control">
                    <label className="label pb-2" htmlFor="password">
                      <span className="label-text font-semibold text-base-content text-base">Mot de passe</span>
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
                        className="w-full px-4 py-3 pl-12 bg-base-100 border border-base-300 rounded-xl text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                        placeholder="••••••••••••"
                      />
                      <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/40" />
                    </div>

                    {/* Password strength indicator with requirements */}
                    <PasswordStrengthIndicator password={formData.password} />
                  </div>

                  {/* Confirm Password */}
                  <div className="form-control">
                    <label className="label pb-2" htmlFor="confirmPassword">
                      <span className="label-text font-semibold text-base-content text-base">Confirmer le mot de passe</span>
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
                        className="w-full px-4 py-3 pl-12 bg-base-100 border border-base-300 rounded-xl text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                        placeholder="••••••••••••"
                      />
                      <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/40" />
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl relative overflow-hidden"
                  >

                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        <span>Inscription en cours</span>
                      </>
                    ) : (
                      <>
                        <span>Créer mon compte</span>
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-8 flex items-center gap-3">
                  <div className="flex-1 h-px bg-base-300"></div>
                  <span className="text-xs text-base-content/50 font-medium">OU</span>
                  <div className="flex-1 h-px bg-base-300"></div>
                </div>

                {/* Sign in link */}
                <div className="text-center">
                  <p className="text-sm text-base-content/70">
                    Vous avez déjà un compte ?{' '}
                    <Link
                      href="/auth/signin"
                      className="font-semibold text-primary hover:text-primary/80 transition-colors duration-300 no-underline"
                    >
                      Se connecter
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 text-center animate-fade-in animation-delay-300">
              <p className="text-xs text-base-content/50">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/terms" className="hover:text-base-content/70 transition-colors">
                  Conditions Générales
                </Link>{' '}
                et notre{' '}
                <Link href="/privacy" className="hover:text-base-content/70 transition-colors">
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
