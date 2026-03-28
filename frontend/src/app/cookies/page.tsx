import Link from 'next/link';

export default function CookiesPage() {
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
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Politique de cookies</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Qu&apos;est-ce qu&apos;un cookie ?</h2>
          <p className="text-gray-700 leading-relaxed">
            Un cookie est un petit fichier texte depose sur votre navigateur lors de la visite
            d&apos;un site web. Il permet au site de memoriser des informations sur votre visite
            (langue, preferences, session) pour ameliorer votre experience.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Cookies utilises par IntoWork</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Cookie</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Type</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Finalite</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Duree</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-3 text-gray-700">next-auth.session-token</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Essentiel</span></td>
                  <td className="p-3 text-gray-600">Authentification et session utilisateur</td>
                  <td className="p-3 text-gray-600">24 heures</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700">next-auth.csrf-token</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Essentiel</span></td>
                  <td className="p-3 text-gray-600">Protection contre les attaques CSRF</td>
                  <td className="p-3 text-gray-600">Session</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700">next-auth.callback-url</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Essentiel</span></td>
                  <td className="p-3 text-gray-600">Redirection apres connexion</td>
                  <td className="p-3 text-gray-600">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Cookies tiers</h2>
          <p className="text-gray-700 leading-relaxed">
            IntoWork n&apos;utilise actuellement <strong>aucun cookie tiers</strong> (pas de tracking
            publicitaire, pas de Google Analytics, pas de pixels de suivi). Seuls les cookies
            strictement necessaires au fonctionnement de la plateforme sont utilises.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Gerer vos cookies</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Vous pouvez a tout moment configurer votre navigateur pour accepter ou refuser
            les cookies. Attention : la desactivation des cookies essentiels peut empecher
            l&apos;utilisation de certaines fonctionnalites (connexion, session).
          </p>
          <p className="text-gray-700 leading-relaxed">
            Pour plus d&apos;informations sur la gestion de vos donnees, consultez notre{' '}
            <Link href="/privacy" className="text-[#6B9B5F] font-semibold hover:underline">
              politique de confidentialite
            </Link>.
          </p>
        </section>

        <p className="text-sm text-gray-400 pt-6 border-t border-gray-200">
          Derniere mise a jour : mars 2026
        </p>
      </main>
    </div>
  );
}
