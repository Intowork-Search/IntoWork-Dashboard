import Link from 'next/link';

export default function AboutPage() {
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
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">A propos d&apos;IntoWork</h1>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre mission</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            IntoWork est une plateforme de recrutement B2B2C developpee par <strong>AGILITYM</strong>,
            concue pour transformer le marche de l&apos;emploi en Afrique Centrale et de l&apos;Ouest.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Notre ambition : connecter les talents africains aux entreprises qui recrutent grace a
            une technologie de matching intelligente, un ATS complet et une experience utilisateur
            pensee pour le contexte local.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pourquoi IntoWork ?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <h3 className="text-lg font-bold text-[#6B9B5F] mb-2">Matching IA a 94%</h3>
              <p className="text-gray-600 text-sm">
                Notre algorithme analyse competences, experience et aspirations pour proposer
                les correspondances les plus pertinentes.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <h3 className="text-lg font-bold text-[#6B9B5F] mb-2">Adapte a l&apos;Afrique</h3>
              <p className="text-gray-600 text-sm">
                Paiements Mobile Money (CinetPay), devises FCFA, conformite OHADA/SYSCOHADA,
                multi-zone UEMOA/CEMAC.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <h3 className="text-lg font-bold text-[#6B9B5F] mb-2">ATS complet</h3>
              <p className="text-gray-600 text-sm">
                Pipeline Kanban, scoring IA, planification d&apos;entretiens, templates email,
                collaboration equipe et analytics recrutement.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <h3 className="text-lg font-bold text-[#6B9B5F] mb-2">CV Builder integre</h3>
              <p className="text-gray-600 text-sm">
                5 templates professionnels, partage par lien public, suivi des vues
                et telechargements.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Zones couvertes</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            IntoWork opere principalement au <strong>Gabon</strong>, <strong>Cameroun</strong>,
            <strong> Congo</strong>, <strong>Senegal</strong>, <strong>Cote d&apos;Ivoire</strong> et
            s&apos;etend progressivement a l&apos;ensemble de la zone CEMAC et UEMOA.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">L&apos;equipe</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            IntoWork est developpe par <strong>AGILITYM</strong>, cabinet de conseil et technologie
            specialise dans la transformation digitale des organisations en Afrique.
            Notre equipe combine expertise RH, ingenierie logicielle et connaissance
            approfondie du marche africain.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Partenaire formation : <strong>H&amp;C Executive Education</strong> — L&apos;Universite du Resultat.
          </p>
        </section>

        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl font-semibold bg-[#6B9B5F] text-white hover:bg-[#5a8a4f] transition-colors no-underline"
          >
            Rejoindre IntoWork
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors no-underline"
          >
            Nous contacter
          </Link>
        </div>
      </main>
    </div>
  );
}
