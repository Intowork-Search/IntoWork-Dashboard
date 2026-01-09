export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">1. Collecte des données</h2>
        <p className="text-gray-700 mb-4">
          Nous collectons les informations que vous nous fournissez lors de votre inscription et utilisation de la plateforme IntoWork.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">2. Utilisation des données</h2>
        <p className="text-gray-700 mb-4">
          Vos données sont utilisées pour :
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Gérer votre compte utilisateur</li>
          <li>Faciliter la mise en relation avec les employeurs</li>
          <li>Améliorer nos services</li>
          <li>Vous envoyer des notifications importantes</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">3. Protection des données</h2>
        <p className="text-gray-700 mb-4">
          Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">4. Vos droits</h2>
        <p className="text-gray-700 mb-4">
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données personnelles.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">5. Cookies</h2>
        <p className="text-gray-700 mb-4">
          Nous utilisons des cookies pour améliorer votre expérience utilisateur et analyser l'utilisation de notre plateforme.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">6. Contact</h2>
        <p className="text-gray-700">
          Pour toute question concernant vos données personnelles, contactez-nous à : privacy@intowork.co
        </p>
      </section>
    </div>
  );
}
