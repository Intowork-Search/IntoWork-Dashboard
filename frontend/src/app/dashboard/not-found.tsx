import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="card bg-base-100 shadow-lg max-w-md w-full">
        <div className="card-body items-center text-center py-12">
          <div className="text-7xl font-bold text-primary mb-3">404</div>

          <h1 className="card-title text-xl mb-2">Page introuvable</h1>

          <p className="text-base-content/60 mb-6">
            Cette section du tableau de bord n&apos;existe pas ou a
            &eacute;t&eacute; d&eacute;plac&eacute;e.
          </p>

          <div className="card-actions">
            <Link href="/dashboard" className="btn btn-primary">
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
