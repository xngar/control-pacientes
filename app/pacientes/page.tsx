'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { PacientesSection } from '@/components/dashboard/PacientesSection';
import { Loader2 } from 'lucide-react';

export default function PacientesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || (user.rol !== 'ADMIN' && user.rol !== 'PROFESIONAL'))) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (user.rol !== 'ADMIN' && user.rol !== 'PROFESIONAL')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return <PacientesSection />;
}