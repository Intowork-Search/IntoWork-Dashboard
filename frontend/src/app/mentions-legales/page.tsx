import Link from 'next/link';

export default function MentionsLegalesPage() {
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
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Mentions legales</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Editeur du site</h2>
          <div className="text-gray-700 space-y-1">
            <p><strong>Raison sociale :</strong> AGILITYM SARL</p>
            <p><strong>Forme juridique :</strong> Societe a Responsabilite Limitee (SARL) de droit OHADA</p>
            <p><strong>Siege social :</strong> Libreville, Gabon</p>
            <p><strong>Email :</strong> <a href="mailto:contact@intowork.co" className="text-[#6B9B5F] hover:underline">contact@intowork.co</a></p>
            <p><strong>Directeur de publication :</strong> Le gerant d&apos;AGILITYM</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Hebergement</h2>
          <div className="text-gray-700 space-y-1">
            <p><strong>Frontend :</strong> Vercel Inc. — San Francisco, CA, USA</p>
            <p><strong>Backend :</strong> Railway Corp. — San Francisco, CA, USA</p>
            <p><strong>Base de donnees :</strong> PostgreSQL heberge par Railway</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Propriete intellectuelle</h2>
          <p className="text-gray-700 leading-relaxed">
            L&apos;ensemble du contenu du site IntoWork (textes, images, graphismes, logo, icones,
            logiciels) est la propriete exclusive d&apos;AGILITYM ou de ses partenaires et est protege
            par les lois relatives a la propriete intellectuelle applicables dans l&apos;espace OHADA.
            Toute reproduction, representation, modification ou exploitation non autorisee est interdite.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Donnees personnelles</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Les informations collectees sur IntoWork sont traitees conformement a notre{' '}
            <Link href="/privacy" className="text-[#6B9B5F] font-semibold hover:underline">
              politique de confidentialite
            </Link>.
            Conformement a la reglementation applicable, vous disposez d&apos;un droit d&apos;acces,
            de rectification et de suppression de vos donnees personnelles.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Pour exercer ces droits, contactez-nous a :{' '}
            <a href="mailto:privacy@intowork.co" className="text-[#6B9B5F] hover:underline">privacy@intowork.co</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Responsabilite</h2>
          <p className="text-gray-700 leading-relaxed">
            AGILITYM s&apos;efforce d&apos;assurer l&apos;exactitude des informations diffusees sur IntoWork
            mais ne saurait etre tenue responsable des erreurs, omissions ou resultats obtenus
            suite a l&apos;utilisation de ces informations. L&apos;utilisation du site se fait sous
            la responsabilite exclusive de l&apos;utilisateur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Droit applicable</h2>
          <p className="text-gray-700 leading-relaxed">
            Les presentes mentions legales sont soumises au droit OHADA et aux lois de la
            Republique Gabonaise. En cas de litige, les tribunaux de Libreville seront
            seuls competents.
          </p>
        </section>

        <p className="text-sm text-gray-400 pt-6 border-t border-gray-200">
          Derniere mise a jour : mars 2026
        </p>
      </main>
    </div>
  );
}
