'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LockClosedIcon,
  ArrowLeftIcon,
  KeyIcon,
  ShieldCheckIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
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

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Token de réinitialisation manquant');
      setTimeout(() => router.push('/forgot-password'), 2000);
    }
  }, [token, router]);

  const validatePasswordInput = (): boolean => {
    // Valider avec les nouvelles exigences de sécurité
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]);
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordInput()) return;
    if (!token) return;

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        new_password: newPassword,
      });

      setResetSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (error: any) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Une erreur est survenue');
      }
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={`${plusJakarta.variable} font-sans min-h-screen bg-white flex items-center justify-center`}>
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-[var(--color-brand-green)]"></div>
          <p className="mt-4 text-slate-600">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${plusJakarta.variable} font-sans min-h-screen bg-white`} data-theme="light">
      <div className="flex min-h-screen overflow-hidden">
        {/* Left Panel - Branding & Features (Identical to forgot-password) */}
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
                Créez un nouveau mot de passe sécurisé
              </h2>

              <div className="space-y-8">
                {/* Feature 1 - Secure */}
                <div className="flex gap-4 animate-fade-in animation-delay-200">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <ShieldCheckIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Sécurité Maximale</h3>
                    <p className="text-white/80 leading-relaxed">Protection avancée de vos données personnelles</p>
                  </div>
                </div>

                {/* Feature 2 - Quick */}
                <div className="flex gap-4 animate-fade-in animation-delay-300">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <BoltIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Accès Instantané</h3>
                    <p className="text-white/80 leading-relaxed">Reconnectez-vous immédiatement après réinitialisation</p>
                  </div>
                </div>

                {/* Feature 3 - Support */}
                <div className="flex gap-4 animate-fade-in animation-delay-400">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Support Dédié</h3>
                    <p className="text-white/80 leading-relaxed">Assistance disponible à tout moment</p>
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

        {/* Right Panel - Reset Password Form */}
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

            {!resetSuccess ? (
              <>
                {/* Form Header */}
                <div className="mb-8 sm:mb-10 animate-fade-in animation-delay-100">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
                    Nouveau mot de passe
                  </h2>
                  <p className="text-slate-600 text-base sm:text-lg">
                    Choisissez un mot de passe fort et sécurisé
                  </p>
                </div>

                {/* Reset Password Card */}
                <div className="animate-fade-in animation-delay-200">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 backdrop-blur-sm">
                    <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
                      {/* New Password Input */}
                      <div className="form-control">
                        <label className="label pb-1 sm:pb-2" htmlFor="newPassword">
                          <span className="label-text font-semibold text-slate-900 text-sm sm:text-base">
                            Nouveau mot de passe
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            id="newPassword"
                            name="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/50 focus:border-[var(--color-brand-green)] transition-all duration-300 text-sm sm:text-base"
                            placeholder="Minimum 8 caractères"
                          />
                          <LockClosedIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </button>
                        </div>
                        {/* Password strength indicator with full requirements */}
                        <PasswordStrengthIndicator password={newPassword} />
                      </div>

                      {/* Confirm Password Input */}
                      <div className="form-control">
                        <label className="label pb-1 sm:pb-2" htmlFor="confirmPassword">
                          <span className="label-text font-semibold text-slate-900 text-sm sm:text-base">
                            Confirmer le mot de passe
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/50 focus:border-[var(--color-brand-green)] transition-all duration-300 text-sm sm:text-base"
                            placeholder="Retapez votre mot de passe"
                          />
                          <LockClosedIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </button>
                        </div>
                        {confirmPassword && (
                          <p className={`text-xs mt-2 ${newPassword === confirmPassword ? 'text-success' : 'text-error'}`}>
                            {newPassword === confirmPassword ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                          </p>
                        )}
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={loading || !newPassword || !confirmPassword}
                        className="w-full h-11 sm:h-12 mt-2 bg-[var(--color-brand-green)] hover:bg-[var(--green-600)] text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl relative overflow-hidden text-sm sm:text-base"
                      >
                        {loading ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            <span>Réinitialisation...</span>
                          </>
                        ) : (
                          <>
                            <span>Réinitialiser le mot de passe</span>
                            <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Back to sign in */}
                    <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-200 text-center">
                      <Link
                        href="/signin"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]/80 transition-colors duration-300 no-underline"
                      >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Retour à la connexion
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="mb-8 sm:mb-10 animate-fade-in animation-delay-100">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
                    Réinitialisation réussie !
                  </h2>
                  <p className="text-slate-600 text-base sm:text-lg">
                    Votre mot de passe a été mis à jour avec succès
                  </p>
                </div>

                {/* Success Card */}
                <div className="animate-fade-in animation-delay-200">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 backdrop-blur-sm">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-8 animate-fade-in animation-delay-300">
                      <div className="relative w-24 h-24">
                        <div className="absolute inset-0 bg-success rounded-full blur-xl opacity-80"></div>
                        <div className="absolute inset-0 flex items-center justify-center bg-success rounded-full border border-success/30">
                          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircleIcon className="w-10 h-10 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Success message */}
                    <div className="text-center space-y-5 sm:space-y-6">
                      <div>
                        <p className="text-slate-900 text-base sm:text-lg font-semibold mb-2">
                          Mot de passe réinitialisé !
                        </p>
                        <p className="text-slate-700 text-sm sm:text-base">
                          Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-200">
                        <p className="text-xs sm:text-sm text-slate-600">
                          Vous allez être redirigé vers la page de connexion dans quelques secondes...
                        </p>
                      </div>

                      {/* Sign in button */}
                      <Link
                        href="/signin"
                        className="btn btn-primary w-full h-11 sm:h-12 mt-4 flex items-center justify-center gap-2 no-underline text-sm sm:text-base"
                      >
                        <span>Se connecter maintenant</span>
                        <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="mt-8 sm:mt-10 text-center animate-fade-in animation-delay-300">
              <p className="text-xs text-slate-500 leading-relaxed">
                Besoin d'aide ?{' '}
                <Link href="/support" className="hover:text-slate-700 transition-colors underline underline-offset-2">
                  Contactez le support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className={`${plusJakarta.variable} font-sans min-h-screen bg-white flex items-center justify-center`}>
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-[var(--color-brand-green)]"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
