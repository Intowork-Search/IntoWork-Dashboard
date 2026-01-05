'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  KeyIcon,
  ShieldCheckIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setEmailSent(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (error: any) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Une erreur est survenue');
      }
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100" data-theme="light">
      <div className="flex min-h-screen overflow-hidden">
        {/* Left Panel - Branding & Features (Identical to signin/signup) */}
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

            {/* Features - Adapted for Password Reset Context */}
            <div className="space-y-10">
              <h2 className="text-4xl font-bold mb-12 text-white leading-tight animate-fade-in animation-delay-100">
                Récupérez l'accès à votre compte en toute sécurité
              </h2>

              <div className="space-y-8">
                {/* Feature 1 - Secure Recovery */}
                <div className="flex gap-4 animate-fade-in animation-delay-200">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <KeyIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Récupération Sécurisée</h3>
                    <p className="text-white/80 leading-relaxed">Processus de réinitialisation validé et sécurisé</p>
                  </div>
                </div>

                {/* Feature 2 - Quick Reset */}
                <div className="flex gap-4 animate-fade-in animation-delay-300">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <BoltIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Réinitialisation Rapide</h3>
                    <p className="text-white/80 leading-relaxed">Récupérez l'accès à votre compte en quelques minutes</p>
                  </div>
                </div>

                {/* Feature 3 - Support 24/7 */}
                <div className="flex gap-4 animate-fade-in animation-delay-400">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">Support 24/7</h3>
                    <p className="text-white/80 leading-relaxed">Notre équipe est toujours disponible pour vous aider</p>
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

        {/* Right Panel - Password Reset Form */}
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

            {!emailSent ? (
              <>
                {/* Form Header */}
                <div className="mb-10 animate-fade-in animation-delay-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <KeyIcon className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-4xl font-bold text-base-content">
                      Mot de passe oublié ?
                    </h2>
                  </div>
                  <p className="text-base-content/60 text-lg">
                    Nous vous aiderons à récupérer l'accès à votre compte
                  </p>
                </div>

                {/* Password Reset Card */}
                <div className="animate-fade-in animation-delay-200">
                  <div className="bg-white rounded-2xl shadow-lg border border-base-200 p-8 backdrop-blur-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      {/* Email Input */}
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

                      {/* Info text */}
                      <p className="text-sm text-base-content/60 bg-base-100 rounded-lg p-4 border border-base-300/50">
                        Nous vous enverrons un lien de réinitialisation sécurisé à cette adresse e-mail.
                      </p>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl relative overflow-hidden"
                      >

                        {loading ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            <span>Envoi en cours</span>
                          </>
                        ) : (
                          <>
                            <span>Envoyer le lien</span>
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Back to sign in */}
                    <div className="mt-8 pt-6 border-t border-base-300 text-center">
                      <Link
                        href="/auth/signin"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300 no-underline"
                      >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Retour à la connexion
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-10 text-center animate-fade-in animation-delay-300">
                  <p className="text-xs text-base-content/50">
                    Besoin d'aide ?{' '}
                    <Link href="/support" className="hover:text-base-content/70 transition-colors">
                      Contactez le support
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="mb-10 animate-fade-in animation-delay-100">
                  <h2 className="text-4xl font-bold text-base-content">
                    Vérifiez votre e-mail
                  </h2>
                  <p className="text-base-content/60 text-lg mt-3">
                    Nous avons envoyé les instructions de réinitialisation
                  </p>
                </div>

                {/* Success Card */}
                <div className="animate-fade-in animation-delay-200">
                  <div className="bg-white rounded-2xl shadow-lg border border-base-200 p-8 backdrop-blur-sm">
                    {/* Success Icon with animation */}
                    <div className="flex justify-center mb-8 animate-fade-in animation-delay-300">
                      <div className="relative w-24 h-24">
                        {/* Background glow */}
                        <div className="absolute inset-0 bg-success rounded-full blur-xl opacity-80"></div>

                        {/* Icon container */}
                        <div className="absolute inset-0 flex items-center justify-center bg-success rounded-full border border-success/30">
                          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircleIcon className="w-10 h-10 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Success message */}
                    <div className="text-center space-y-6">
                      <div>
                        <p className="text-base-content text-lg font-semibold mb-2">
                          Lien envoyé avec succès !
                        </p>
                        <p className="text-base-content/70">
                          Nous avons envoyé les instructions de réinitialisation à :
                        </p>
                        <p className="text-lg font-semibold text-primary mt-3 break-all">
                          {email}
                        </p>
                      </div>

                      {/* Instructions */}
                      <div className="bg-base-100 rounded-lg p-4 border border-base-300/50 text-left">
                        <p className="text-sm text-base-content/70 mb-3">
                          <span className="font-semibold">Vérifiez votre boîte e-mail :</span>
                        </p>
                        <ul className="text-sm text-base-content/60 space-y-2 list-disc list-inside">
                          <li>Vérifiez votre dossier Inbox en priorité</li>
                          <li>Si vous ne le trouvez pas, regardez dans Spam ou Promotions</li>
                          <li>Le lien expire dans 24 heures</li>
                        </ul>
                      </div>

                      {/* Additional help */}
                      <p className="text-sm text-base-content/60">
                        Vous ne recevez pas l'e-mail ?{' '}
                        <button
                          onClick={() => {
                            setEmailSent(false);
                            setEmail('');
                          }}
                          className="text-primary font-semibold hover:text-primary/80 transition-colors no-underline cursor-pointer"
                        >
                          Essayez une autre adresse
                        </button>
                      </p>
                    </div>

                    {/* Back to sign in */}
                    <div className="mt-8 pt-6 border-t border-base-300 text-center">
                      <Link
                        href="/auth/signin"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300 no-underline"
                      >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Retour à la connexion
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-10 text-center animate-fade-in animation-delay-400">
                  <p className="text-xs text-base-content/50">
                    Besoin d'aide ?{' '}
                    <Link href="/support" className="hover:text-base-content/70 transition-colors">
                      Contactez le support
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
