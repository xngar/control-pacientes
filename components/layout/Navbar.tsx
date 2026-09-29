'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Activity, LogOut, ShieldCheck, Stethoscope } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.rol === 'ADMIN';

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href={isAdmin ? '/admin' : '/clinico'} className="flex items-center gap-2.5">
          <span
            className="w-9 h-9 rounded-[var(--radius-md)] bg-primary text-on-primary flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Activity className="w-5 h-5" />
          </span>
          <span className="flex flex-col">
            <span className="font-bold text-sm sm:text-base text-text tracking-tight leading-tight">
              SICOLOGIA DATA REPORT
            </span>
            <span className="text-[13px] text-text-muted font-medium">
              Control y seguimiento clínico
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-text">{user.nombreCompleto}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant={isAdmin ? 'admin' : 'pro'} dot>
                {isAdmin ? (
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" aria-hidden="true" /> Administrador
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" aria-hidden="true" /> Profesional
                  </span>
                )}
              </Badge>
              {user.especialidad && (
                <span className="text-[13px] text-text-muted hidden md:inline">
                  {user.especialidad}
                </span>
              )}
            </div>
          </div>

          <span className="h-8 w-px bg-border hidden sm:block" aria-hidden="true" />

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title="Cerrar sesión"
            className="text-text-muted hover:text-error-text hover:bg-error/10"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
