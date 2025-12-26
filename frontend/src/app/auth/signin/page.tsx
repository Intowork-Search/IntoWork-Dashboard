'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Email ou mot de passe incorrect');
      } else {
        toast.success('Connexion réussie');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    try {
      await signIn(provider, { redirect: false });
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast.error(`Erreur lors de la connexion avec ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-100" data-theme="light">
      <div className="flex min-h-screen overflow-hidden">
        {/* Left Panel - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
          {/* Background gradient and decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary to-secondary/60"></div>

          {/* Decorative blurred shapes */}
          <div className="absolute top-0 -left-40 w-80 h-80 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-20 w-80 h-80 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

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
                La plateforme de recrutement intelligente pour les professionnels
              </h2>

              <div className="space-y-8">
                {/* Feature 1 */}
                <div className="flex gap-4 animate-fade-in animation-delay-200">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Solutions Entreprises</h3>
                    <p className="text-white/80 leading-relaxed">Gérez vos recrutements avec des outils professionnels de pointe</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-4 animate-fade-in animation-delay-300">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <UserGroupIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Matching IA Avancé</h3>
                    <p className="text-white/80 leading-relaxed">Connectez-vous avec les meilleurs talents grâce à notre algorithme intelligent</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-4 animate-fade-in animation-delay-400">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Analyses & Reporting</h3>
                    <p className="text-white/80 leading-relaxed">Suivez vos KPIs et optimisez votre processus de recrutement</p>
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

        {/* Right Panel - Sign In Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-base-100 via-base-100 to-base-200 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_1px,rgba(0,0,0,0.02)_1px)] bg-[length:4rem_4rem]"></div>
          </div>

          <div className="w-full max-w-md relative z-10">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10 animate-fade-in">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/80 to-primary rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-base-content">INTOWORK</h1>
                <p className="text-sm text-base-content/60">Plateforme de Recrutement</p>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-10 animate-fade-in animation-delay-100">
              <h2 className="text-4xl font-bold text-base-content mb-3">
                Connexion
              </h2>
              <p className="text-base-content/60 text-lg">
                Accédez à votre espace professionnel
              </p>
            </div>

            {/* Sign In Card */}
            <div className="animate-fade-in animation-delay-200">
              <div className="bg-white rounded-2xl shadow-lg border border-base-200 p-8 backdrop-blur-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pl-12 bg-base-100 border border-base-300 rounded-xl text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                        placeholder="••••••••••••"
                      />
                      <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/40" />
                    </div>
                  </div>

                  {/* Remember & Forgot Password */}
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-5 h-5 rounded-lg border-2 border-base-300 text-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300 accent-primary"
                      />
                      <span className="text-sm text-base-content/70 group-hover:text-base-content transition-colors">Se souvenir de moi</span>
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300 no-underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl relative overflow-hidden"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>

                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        <span>Connexion en cours</span>
                      </>
                    ) : (
                      <>
                        <span>Se connecter</span>
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
                {/* Sign up link */}
                <div className="mt-8 pt-6 border-t border-base-300 text-center">
                  <p className="text-sm text-base-content/70">
                    Première visite ?{' '}
                    <Link
                      href="/auth/signup"
                      className="font-semibold text-primary hover:text-primary/80 transition-colors duration-300 no-underline"
                    >
                      Créer un compte professionnel
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 text-center animate-fade-in animation-delay-300">
              <p className="text-xs text-base-content/50">
                En vous connectant, vous acceptez nos{' '}
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
