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
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
});

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
    <div className={`${plusJakarta.variable} font-sans min-h-screen bg-white`} data-theme="light">
      <div className="flex min-h-screen overflow-hidden">
        {/* Left Panel - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 xl:p-16">
          {/* Background solid color */}
          <div className="absolute inset-0 bg-[var(--color-brand-green)]"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="mb-16 xl:mb-20 animate-fade-in">
              <Link href="/">
                <img
                  src="/logo-intowork.png"
                  alt="INTOWORK"
                  className="h-24 sm:h-28 md:h-32 xl:h-36 w-auto brightness-0 invert"
                />
              </Link>
            </div>

            {/* Features */}
            <div className="space-y-10">
              <h2 className="text-3xl xl:text-4xl font-bold mb-10 xl:mb-12 text-white leading-tight animate-fade-in animation-delay-100">
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
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_1px,rgba(0,0,0,0.02)_1px)] bg-[length:4rem_4rem]"></div>
          </div>

          <div className="w-full max-w-md relative z-10">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 sm:mb-10 animate-fade-in">
              <Link href="/">
                <img
                  src="/logo-intowork.png"
                  alt="INTOWORK"
                  className="h-20 sm:h-24 w-auto"
                />
              </Link>
            </div>

            {/* Form Header */}
            <div className="mb-8 sm:mb-10 animate-fade-in animation-delay-100">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
                Connexion
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Accédez à votre espace professionnel
              </p>
            </div>

            {/* Sign In Card */}
            <div className="animate-fade-in animation-delay-200">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 backdrop-blur-sm">
                <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-sm sm:text-base"
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
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-sm sm:text-base"
                        placeholder="••••••••••••"
                      />
                      <LockClosedIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                    </div>
                  </div>

                  {/* Remember & Forgot Password */}
                  <div className="flex items-center justify-between pt-1 sm:pt-2">
                    <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-md border-2 border-slate-300 text-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300 accent-primary"
                      />
                      <span className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Se souvenir de moi</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300 no-underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 sm:h-12 mt-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl relative overflow-hidden text-sm sm:text-base"
                  >

                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        <span>Connexion en cours</span>
                      </>
                    ) : (
                      <>
                        <span>Se connecter</span>
                        <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
                {/* Sign up link */}
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-200 text-center">
                  <p className="text-xs sm:text-sm text-slate-600">
                    Première visite ?{' '}
                    <Link
                      href="/signup"
                      className="font-semibold text-primary hover:text-primary/80 transition-colors duration-300 no-underline"
                    >
                      Créer un compte professionnel
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 sm:mt-10 text-center animate-fade-in animation-delay-300">
              <p className="text-xs text-slate-500 leading-relaxed">
                En vous connectant, vous acceptez nos{' '}
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
