'use client';

import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Space_Grotesk, Inter } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

export default function MinimalistePremiumLanding() {
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`${spaceGrotesk.variable} ${inter.variable} bg-white text-black min-h-screen`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              intowork
            </Link>

            <div className="hidden md:flex items-center space-x-12">
              {['Produit', 'Prix', 'Ressources', 'A propos'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-neutral-500 hover:text-black font-medium transition-colors text-sm"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden sm:flex items-center space-x-6">
              <Link
                href="/signin"
                className="text-neutral-600 hover:text-black font-medium transition-colors text-sm"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-black text-white font-medium text-sm rounded-full hover:bg-neutral-800 transition-colors"
              >
                Commencer
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden pb-6 border-t border-neutral-100 pt-6">
              <div className="flex flex-col space-y-4">
                {['Produit', 'Prix', 'Ressources', 'A propos'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-neutral-500 hover:text-black font-medium py-2 text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="flex flex-col space-y-3 pt-4 border-t border-neutral-100">
                  <Link href="/signin" className="text-neutral-600 font-medium py-2 text-center text-sm">
                    Connexion
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-black text-white font-medium py-3 rounded-full text-center text-sm"
                  >
                    Commencer
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 sm:pt-48 sm:pb-32 lg:pt-56 lg:pb-40">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          {/* Headline */}
          <h1 className="font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] tracking-tight mb-8">
            Recrutement
            <br />
            <span className="text-neutral-400">simplifie.</span>
          </h1>

          {/* Subheadline */}
          <p className="font-sans text-lg sm:text-xl text-neutral-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Une plateforme elegante pour connecter talents et entreprises.
            Sans friction. Sans complexite.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              href="/signup"
              className="px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-neutral-800 transition-colors"
            >
              Essayer gratuitement
            </Link>
            <button
              type="button"
              className="px-8 py-4 text-black font-medium rounded-full border border-neutral-200 hover:border-neutral-400 transition-colors"
            >
              En savoir plus
            </button>
          </div>

          {/* Minimal Stats */}
          <div className="flex justify-center space-x-16">
            {[
              { value: '10K', label: 'Candidats' },
              { value: '500', label: 'Entreprises' },
              { value: '95%', label: 'Satisfaction' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold tracking-tight">{stat.value}</div>
                <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="h-px bg-neutral-100"></div>
      </div>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              Tout ce dont vous avez besoin.
              <br />
              <span className="text-neutral-400">Rien de plus.</span>
            </h2>
            <p className="text-neutral-500 text-lg font-light">
              Nous avons elimine le superflu pour ne garder que l'essentiel.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: 'Matching IA',
                description: 'Algorithme intelligent pour des correspondances precises entre candidats et postes.',
              },
              {
                title: 'CV Builder',
                description: 'Creez des CV elegants en quelques minutes avec nos templates professionnels.',
              },
              {
                title: 'Analytics',
                description: 'Visualisez vos performances avec des tableaux de bord clairs et actionables.',
              },
              {
                title: 'Candidatures',
                description: 'Gerez toutes vos candidatures depuis une interface unifiee.',
              },
              {
                title: 'Notifications',
                description: 'Restez informe en temps reel des nouvelles opportunites.',
              },
              {
                title: 'Securite',
                description: 'Vos donnees sont protegees avec un chiffrement de niveau bancaire.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="group">
                <div className="mb-4">
                  <span className="text-xs text-neutral-400 font-mono">0{idx + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-neutral-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="h-px bg-neutral-100"></div>
      </div>

      {/* How It Works */}
      <section className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Processus</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-4 mb-8">
                Trois etapes.
                <br />
                <span className="text-neutral-400">C'est tout.</span>
              </h2>

              <div className="space-y-8">
                {[
                  { step: '01', title: 'Creez', desc: 'Votre profil en quelques minutes' },
                  { step: '02', title: 'Matchez', desc: 'Notre IA trouve les meilleures opportunites' },
                  { step: '03', title: 'Connectez', desc: 'Postulez ou recrutez directement' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-6">
                    <span className="text-xs text-neutral-300 font-mono pt-1">{item.step}</span>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-neutral-500 font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual placeholder */}
            <div className="hidden lg:block">
              <div className="aspect-square bg-neutral-50 rounded-3xl flex items-center justify-center">
                <div className="w-32 h-32 border border-neutral-200 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-black rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 sm:py-32 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-light leading-relaxed text-neutral-700 mb-10">
            "intowork a revolutionne notre facon de recruter. Simple, elegant, efficace."
          </blockquote>
          <div>
            <div className="font-semibold">Sophie Martin</div>
            <div className="text-sm text-neutral-400">DRH, TechCorp Afrique</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Pret a commencer ?
          </h2>
          <p className="text-lg text-neutral-500 mb-10 max-w-xl mx-auto font-light">
            Rejoignez les milliers de professionnels qui ont choisi la simplicite.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-neutral-800 transition-colors"
            >
              Creer un compte gratuit
            </Link>
            <button
              type="button"
              className="px-8 py-4 text-black font-medium rounded-full border border-neutral-200 hover:border-neutral-400 transition-colors"
            >
              Contacter l'equipe
            </button>
          </div>
          <p className="text-sm text-neutral-400 mt-6">
            Gratuit. Sans engagement. Sans carte bancaire.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="text-xl font-bold tracking-tight mb-4">intowork</div>
              <p className="text-sm text-neutral-400 max-w-xs font-light">
                Le recrutement, simplifie.
              </p>
            </div>

            {[
              { title: 'Produit', links: ['Fonctionnalites', 'Prix', 'API', 'Integrations'] },
              { title: 'Ressources', links: ['Documentation', 'Blog', 'Support', 'Statut'] },
              { title: 'Entreprise', links: ['A propos', 'Carrieres', 'Contact', 'Presse'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-medium text-sm mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-neutral-400 hover:text-black text-sm transition-colors font-light">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="h-px bg-neutral-100 mb-8"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-400 font-light">
              © 2026 intowork
            </p>
            <div className="flex items-center space-x-8">
              <a href="#" className="text-neutral-400 hover:text-black text-sm transition-colors font-light">Confidentialite</a>
              <a href="#" className="text-neutral-400 hover:text-black text-sm transition-colors font-light">Conditions</a>
              <a href="#" className="text-neutral-400 hover:text-black text-sm transition-colors font-light">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
