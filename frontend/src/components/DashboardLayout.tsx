'use client';

import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import NotificationPanel from '@/components/NotificationPanel';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly subtitle?: string;
}

export default function DashboardLayout({ 
  children, 
  title = "Dashboard",
  subtitle 
}: DashboardLayoutProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
      return;
    }

    if (isLoaded && user && !user.role) {
      router.push('/onboarding');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = user.role as 'candidate' | 'employer' | 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar pour desktop */}
      <div className="hidden lg:block">
        <Sidebar userRole={userRole} />
      </div>

      {/* Sidebar mobile */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <button 
          className="fixed inset-0 bg-transparent cursor-pointer"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
          aria-label="Fermer le menu"
        />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs">
          <Sidebar userRole={userRole} />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64">
        {/* Header mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">IW</span>
              </div>
              <span className="font-bold text-gray-900">INTOWORK</span>
            </div>
            <div className="w-10"> {/* Spacer pour équilibrer */}</div>
          </div>
        </div>

        {/* Header principal */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
              
              {/* Notifications */}
              <div className="flex items-center space-x-4">
                <NotificationPanel />
              </div>
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
