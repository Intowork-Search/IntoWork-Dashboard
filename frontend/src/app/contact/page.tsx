'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Message envoye ! Nous vous repondrons sous 48h.');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Erreur lors de l\'envoi. Contactez-nous par email.');
      }
    } catch {
      // Fallback mailto si le backend n'a pas l'endpoint
      window.location.href = `mailto:contact@intowork.co?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(form.message)}`;
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-gray-900 no-underline">
            INTOWORK
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Retour a l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Contactez-nous</h1>
        <p className="text-gray-500 mb-10">
          Une question, un partenariat ou besoin d&apos;aide ? Notre equipe vous repond sous 48h.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 mb-1">Nom complet</label>
              <input
                id="contact-name"
                type="text"
                required
                maxLength={100}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#6B9B5F] focus:ring-2 focus:ring-[#6B9B5F]/20 outline-none transition-all"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                id="contact-email"
                type="email"
                required
                maxLength={254}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#6B9B5F] focus:ring-2 focus:ring-[#6B9B5F]/20 outline-none transition-all"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label htmlFor="contact-subject" className="block text-sm font-semibold text-gray-700 mb-1">Sujet</label>
              <select
                id="contact-subject"
                required
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#6B9B5F] focus:ring-2 focus:ring-[#6B9B5F]/20 outline-none transition-all"
                title="Sujet du message"
              >
                <option value="">Selectionnez un sujet</option>
                <option value="general">Question generale</option>
                <option value="partenariat">Partenariat</option>
                <option value="technique">Support technique</option>
                <option value="facturation">Facturation</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
              <textarea
                id="contact-message"
                required
                maxLength={2000}
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#6B9B5F] focus:ring-2 focus:ring-[#6B9B5F]/20 outline-none transition-all resize-none"
                placeholder="Decrivez votre demande..."
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full px-6 py-3 rounded-xl font-semibold bg-[#6B9B5F] text-white hover:bg-[#5a8a4f] disabled:opacity-50 transition-colors"
            >
              {sending ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>

          {/* Coordonnees */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Coordonnees</h3>
              <div className="space-y-3 text-gray-600">
                <p>AGILITYM — Editeur d&apos;IntoWork</p>
                <p>Email : <a href="mailto:contact@intowork.co" className="text-[#6B9B5F] hover:underline">contact@intowork.co</a></p>
                <p>Support : <a href="mailto:support@intowork.co" className="text-[#6B9B5F] hover:underline">support@intowork.co</a></p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Bureaux</h3>
              <div className="space-y-2 text-gray-600 text-sm">
                <p><strong>Libreville, Gabon</strong> — Siege social</p>
                <p><strong>Douala, Cameroun</strong></p>
                <p><strong>Dakar, Senegal</strong></p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Horaires</h3>
              <p className="text-gray-600 text-sm">
                Lundi au vendredi, 8h00 — 18h00 (GMT+1)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#6B9B5F]/5 border border-[#6B9B5F]/20">
              <p className="text-sm text-gray-700">
                <strong>Besoin d&apos;aide rapide ?</strong> Consultez notre{' '}
                <Link href="/support" className="text-[#6B9B5F] font-semibold hover:underline">
                  page support
                </Link>{' '}
                ou la <a href="/#faq" className="text-[#6B9B5F] font-semibold hover:underline">FAQ</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
