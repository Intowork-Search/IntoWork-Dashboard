'use client';

import { useUser } from '@/hooks/useNextAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLoading from './loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/signin');
    }
  }, [isLoaded, isSignedIn, router]);

  // Detecter si le chargement prend trop longtemps (session expiree)
  useEffect(() => {
    if (!isLoaded) {
      const timer = setTimeout(() => setLoadingTimeout(true), 5000);
      return () => clearTimeout(timer);
    }
    setLoadingTimeout(false);
  }, [isLoaded]);

  if (!isLoaded) {
    if (loadingTimeout) {
      // Session probablement expiree — rediriger vers signin
      router.push('/signin');
      return null;
    }
    return <DashboardLoading />;
  }

  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
