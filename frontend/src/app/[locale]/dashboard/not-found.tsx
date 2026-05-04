'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function DashboardNotFound() {
  const tc = useTranslations('common');
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="card bg-base-100 shadow-lg max-w-md w-full">
        <div className="card-body items-center text-center py-12">
          <div className="text-7xl font-bold text-primary mb-3">404</div>

          <h1 className="card-title text-xl mb-2">{tc('notFoundTitle')}</h1>

          <p className="text-base-content/60 mb-6">
            {tc('notFoundDashboardDesc')}
          </p>

          <div className="card-actions">
            <Link href="/dashboard" className="btn btn-primary">
              {tc('backToDashboard')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
