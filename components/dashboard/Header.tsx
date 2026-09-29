'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { Search, Mail, Bell, ChevronDown, LogOut, X, Menu, UserCog } from 'lucide-react';

const PENDING_TOOLS = [
  { label: 'Notificaciones', icon: Bell },
  { label: 'Reportes', icon: Mail },
];

interface HeaderProps {
  searchQuery: string;
  onSearch: (value: string) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onOpenPerfil: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearch,
  onToggleSidebar,
  sidebarOpen,
  onOpenPerfil,
}) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.rol === 'ADMIN';

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      if (isShortcut) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onSearch('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSearch]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-30">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        <IconButton
          label={sidebarOpen ? 'Cerrar navegación' : 'Abrir navegación'}
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </IconButton>

        <div className="relative flex-1 max-w-2xl">
          <label htmlFor="patient-search" className="sr-only">
            Buscar pacientes
          </label>
          <Search
            className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="patient-search"
            ref={inputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por RUT, paciente, dupla o diagnóstico..."
            className="w-full bg-surface-muted border border-border rounded-[var(--radius-sm)] pl-9 pr-20 py-2 text-sm text-text placeholder:text-text-muted focus:bg-surface focus:border-primary transition-colors"
          />
          <kbd className="hidden sm:block absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-text-muted bg-surface border border-border rounded-[var(--radius-xs)] px-1.5 py-0.5 select-none pointer-events-none">
            Ctrl K
          </kbd>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {PENDING_TOOLS.map(({ label, icon: Icon }) => (
            <span key={label} className="relative hidden sm:block">
              <IconButton label={`${label} (próximamente)`} size="sm" disabled>
                <Icon className="w-4 h-4" />
              </IconButton>
            </span>
          ))}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 pl-1 pr-1.5 sm:pr-2 py-1 rounded-[var(--radius-sm)] hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <span className="w-8 h-8 rounded-[var(--radius-full)] bg-primary/10 text-primary-text flex items-center justify-center text-xs font-bold shrink-0">
                {user?.nombreCompleto?.charAt(0).toUpperCase() ?? '?'}
              </span>
              <span className="hidden md:block text-left min-w-0">
                <span className="block text-[13px] font-semibold text-text truncate max-w-[10rem]">
                  {user?.nombreCompleto}
                </span>
                <span className="block text-[13px] text-text-muted">{isAdmin ? 'Administrador' : 'Profesional'}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-text-muted transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-[var(--radius-md)] shadow-overlay p-1.5 animate-fade-in"
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-[13px] font-semibold text-text truncate">{user?.nombreCompleto}</p>
                  <p className="text-[13px] text-text-muted truncate">{user?.email}</p>
                  {user?.especialidad && (
                    <Badge variant={isAdmin ? 'admin' : 'pro'} className="mt-1.5">
                      {user.especialidad}
                    </Badge>
                  )}
                </div>
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenPerfil();
                  }}
                  className="w-full text-left px-3 py-2 text-[13px] text-text-muted rounded-[var(--radius-xs)] hover:bg-surface-muted hover:text-text flex items-center gap-2 cursor-pointer"
                >
                  <UserCog className="w-3.5 h-3.5" aria-hidden="true" />
                  Mi perfil
                </button>
                <Link
                  href={isAdmin ? '/admin' : '/clinico'}
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-[13px] text-text-muted rounded-[var(--radius-xs)] hover:bg-surface-muted hover:text-text"
                >
                  Ir a mi panel
                </Link>
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-[13px] text-error-text rounded-[var(--radius-xs)] hover:bg-error/10 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
