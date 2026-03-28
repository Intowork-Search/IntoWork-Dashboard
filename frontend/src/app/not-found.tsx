import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card bg-base-100 shadow-xl max-w-lg w-full">
        <div className="card-body items-center text-center py-16">
          <div className="text-8xl font-bold text-primary mb-4">404</div>

          <h1 className="card-title text-2xl mb-2">Page introuvable</h1>

          <p className="text-base-content/60 mb-8">
            La page que vous recherchez n&apos;existe pas ou a
            &eacute;t&eacute; d&eacute;plac&eacute;e.
          </p>

          <div className="card-actions flex-col sm:flex-row gap-3">
            <Link href="/" className="btn btn-primary">
              Retour &agrave; l&apos;accueil
            </Link>
            <Link href="/dashboard" className="btn btn-outline btn-primary">
              Acc&eacute;der au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
