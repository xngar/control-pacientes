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
    <header className="bg-surface border-b border-border sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link
            href={isAdmin ? '/admin' : '/clinico'}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base text-text-primary tracking-tight leading-tight">
                SICOLOGIA DATA REPORT
              </span>
              <span className="text-[11px] text-text-muted font-medium">
                Control & Seguimiento Clínico
              </span>
            </div>
          </Link>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-text-primary">
              {user.nombreCompleto}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant={isAdmin ? 'admin' : 'pro'} dot>
                {isAdmin ? (
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Administrador
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" /> Profesional
                  </span>
                )}
              </Badge>
              {user.especialidad && (
                <span className="text-xs text-text-muted hidden md:inline">
                  • {user.especialidad}
                </span>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-border hidden sm:block" />

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title="Cerrar sesión"
            className="text-text-muted hover:text-error hover:bg-rose-50"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
