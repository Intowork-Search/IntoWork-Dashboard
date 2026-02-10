'use client';

import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Poppins, DM_Sans } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export default function AfroVibrantLanding() {
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
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`${poppins.variable} ${dmSans.variable} font-sans bg-amber-50 text-slate-900 overflow-x-hidden`}>
      {/* Decorative Pattern Background */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="kente" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="10" height="10" fill="#F59E0B"/>
            <rect x="10" y="10" width="10" height="10" fill="#F59E0B"/>
            <rect x="10" width="10" height="10" fill="#DC2626"/>
            <rect y="10" width="10" height="10" fill="#15803D"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#kente)"/>
        </svg>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-amber-50/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-green-600 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                  <span className="text-xl font-black text-white">iW</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-400"></div>
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                INTO<span className="text-orange-500">WORK</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {['Opportunites', 'Entreprises', 'Communaute', 'Blog'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-700 hover:text-orange-500 font-semibold transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden sm:flex items-center space-x-4">
              <Link
                href="/signin"
                className="text-slate-700 hover:text-orange-500 font-semibold transition-colors px-4 py-2"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="relative px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Rejoindre la communaute
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="sm:hidden p-2 rounded-full hover:bg-orange-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden pb-6 border-t border-orange-200 mt-2 pt-4">
              <div className="flex flex-col space-y-4">
                {['Opportunites', 'Entreprises', 'Communaute', 'Blog'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-slate-700 hover:text-orange-500 font-semibold py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="flex flex-col space-y-3 pt-4 border-t border-orange-200">
                  <Link href="/signin" className="text-slate-700 font-semibold py-2 text-center">
                    Connexion
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-full text-center"
                  >
                    Rejoindre la communaute
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-100 border-2 border-green-200 mb-6">
                <span className="text-2xl">🌍</span>
                <span className="text-sm font-bold text-green-700">Le futur du travail en Afrique</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] mb-6">
                <span className="text-slate-900">Ton talent.</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-green-600">
                  Ton avenir.
                </span>
                <br />
                <span className="text-slate-900">Ta reussite.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
                La premiere plateforme de recrutement 100% africaine qui celebre nos talents
                et connecte les etoiles montantes avec les entreprises qui font bouger le continent.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/signup"
                  className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-2xl hover:shadow-xl hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Decouvrir les opportunites</span>
                    <span className="text-2xl group-hover:animate-bounce">🚀</span>
                  </span>
                </Link>
                <button
                  type="button"
                  className="px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-2xl border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  Je recrute
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                {[
                  { value: '10K+', label: 'Talents', emoji: '👨‍💼' },
                  { value: '500+', label: 'Entreprises', emoji: '🏢' },
                  { value: '15+', label: 'Pays', emoji: '🌍' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center space-x-3">
                    <span className="text-3xl">{stat.emoji}</span>
                    <div>
                      <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                      <div className="text-sm text-slate-500">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="relative hidden lg:block">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400/20 rounded-full blur-3xl"></div>

              {/* Main visual */}
              <div className="relative">
                {/* Geometric pattern */}
                <div className="absolute inset-0 grid grid-cols-4 gap-2 p-4">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-xl ${
                        ['bg-orange-500', 'bg-red-500', 'bg-green-600', 'bg-yellow-400'][i % 4]
                      } opacity-${[10, 20, 30, 40][i % 4]}`}
                    ></div>
                  ))}
                </div>

                {/* Content card */}
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-4 border-orange-200">
                  <div className="space-y-6">
                    {/* Profile cards */}
                    {[
                      { name: 'Aisha M.', role: 'Dev Full Stack', location: 'Lagos', color: 'orange' },
                      { name: 'Kofi A.', role: 'Product Manager', location: 'Accra', color: 'green' },
                      { name: 'Fatou D.', role: 'UX Designer', location: 'Dakar', color: 'red' },
                    ].map((profile, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center space-x-4 p-4 rounded-2xl bg-${profile.color}-50 border-2 border-${profile.color}-100`}
                      >
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-${profile.color}-400 to-${profile.color}-600`}></div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900">{profile.name}</div>
                          <div className="text-sm text-slate-600">{profile.role}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-white px-3 py-1 rounded-full text-slate-600 border">
                            📍 {profile.location}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 sm:py-32 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-6 py-2 rounded-full bg-orange-100 text-orange-600 font-bold text-sm mb-6">
              POURQUOI NOUS CHOISIR ✨
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-6">
              Le recrutement nouvelle generation
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Une plateforme pensee pour et par les Africains
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                emoji: '🤖',
                title: 'IA Matching',
                description: 'Notre algorithme comprend les realites du marche africain.',
                color: 'orange',
              },
              {
                emoji: '📱',
                title: 'Mobile First',
                description: 'Optimise pour les smartphones, la ou l\'Afrique connecte.',
                color: 'green',
              },
              {
                emoji: '🌐',
                title: 'Multi-langues',
                description: 'Francais, Anglais, Portugais et langues locales.',
                color: 'red',
              },
              {
                emoji: '💰',
                title: 'Paiement Local',
                description: 'Mobile Money, Wave, Orange Money - tous acceptes!',
                color: 'yellow',
              },
              {
                emoji: '🎓',
                title: 'Formation',
                description: 'Acces a des ressources pour booster ta carriere.',
                color: 'purple',
              },
              {
                emoji: '🤝',
                title: 'Communaute',
                description: 'Un reseau de professionnels africains qui s\'entraident.',
                color: 'blue',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`group p-8 rounded-3xl bg-${feature.color}-50 border-2 border-${feature.color}-100 hover:border-${feature.color}-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="text-5xl mb-6 group-hover:animate-bounce">{feature.emoji}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-br from-orange-500 via-red-500 to-red-600 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-6 py-2 rounded-full bg-white/20 text-white font-bold text-sm mb-6">
              TEMOIGNAGES 💬
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
              Ce qu'ils disent de nous
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "J'ai trouve mon emploi de reve en 2 semaines! L'equipe comprend vraiment nos realites.",
                name: 'Aminata K.',
                role: 'Marketing Manager',
                location: 'Abidjan',
              },
              {
                quote: "INTOWORK nous a permis de recruter les meilleurs talents du continent. Game changer!",
                name: 'Jean-Paul M.',
                role: 'CEO, TechStart',
                location: 'Kinshasa',
              },
              {
                quote: "Enfin une plateforme qui celebre nos talents africains. Fier d'en faire partie!",
                name: 'Oluwaseun A.',
                role: 'Software Engineer',
                location: 'Lagos',
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 shadow-xl transform hover:-translate-y-2 transition-all"
              >
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-2xl">⭐</span>
                  ))}
                </div>
                <p className="text-lg text-slate-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500"></div>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role} • {testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32 bg-slate-900 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-8">🌟</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
            Pret a briller ?
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Rejoins la communaute des talents africains qui changent le monde.
            Ton avenir commence ici.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-2xl hover:shadow-xl hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1"
            >
              Creer mon compte gratuit ✨
            </Link>
            <button
              type="button"
              className="px-10 py-5 bg-white/10 text-white font-bold text-lg rounded-2xl border-2 border-white/20 hover:bg-white/20 transition-all"
            >
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-slate-950 text-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-green-600 flex items-center justify-center">
                  <span className="text-xl font-black text-white">iW</span>
                </div>
                <span className="text-xl font-black">INTOWORK</span>
              </div>
              <p className="text-slate-400 text-sm">
                Le futur du travail en Afrique 🌍
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-3xl hover:scale-125 transition-transform">🐦</a>
                <a href="#" className="text-3xl hover:scale-125 transition-transform">📸</a>
                <a href="#" className="text-3xl hover:scale-125 transition-transform">💼</a>
              </div>
            </div>

            {[
              { title: 'Candidats', links: ['Trouver un job', 'Creer mon CV', 'Conseils carriere', 'Formation'] },
              { title: 'Entreprises', links: ['Publier une offre', 'Nos tarifs', 'Solutions RH', 'API'] },
              { title: 'INTOWORK', links: ['A propos', 'Blog', 'Carrieres', 'Contact'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-bold text-white mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 INTOWORK. Fait avec ❤️ en Afrique.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors text-sm">Confidentialite</a>
              <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors text-sm">CGU</a>
              <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
