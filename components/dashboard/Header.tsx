'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { DEMO_USERS } from '@/lib/auth/mock-users';
import {
  Search,
  Mail,
  Bell,
  ChevronDown,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, searchQuery = '' }) => {
  const { user, logout, quickLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = user?.rol === 'ADMIN';

  return (
    <header className="h-16 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por RUT, paciente, dupla, diagnóstico..."
            value={searchQuery}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white text-xs sm:text-sm pl-9 pr-14 py-2 rounded-[var(--radius-sm)] border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted/60"
          />
          <div className="absolute right-2.5 flex items-center gap-0.5 text-[10px] font-mono text-text-muted bg-white px-1.5 py-0.5 rounded-[var(--radius-xs)] border border-border">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Actions: Messages, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
        {/* Messages */}
        <button
          className="relative p-2 rounded-[var(--radius-sm)] border border-border hover:bg-zinc-100 text-text-muted hover:text-text transition-colors focus:outline-none"
          title="Mensajes del equipo"
        >
          <Mail className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-[var(--radius-full)] flex items-center justify-center">
            4
          </span>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-[var(--radius-sm)] border border-border hover:bg-zinc-100 text-text-muted hover:text-text transition-colors focus:outline-none"
          title="Notificaciones y alertas UEGO"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-[var(--radius-full)] flex items-center justify-center">
            8
          </span>
        </button>

        {/* Profile Card & Quick Role Switcher */}
        <div className="relative ml-1">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-2.5 rounded-[var(--radius-sm)] hover:bg-zinc-100 transition-colors border border-transparent hover:border-border focus:outline-none"
          >
            <div className="w-8 h-8 rounded-[var(--radius-full)] bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.nombreCompleto.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-text leading-tight">
                {user?.nombreCompleto || 'Usuario'}
              </span>
              <span className="text-[10px] text-text-muted">
                {isAdmin ? 'Dirección Clínica' : user?.especialidad || 'Profesional'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-surface rounded-[var(--radius-md)] border border-border shadow-xl p-2 z-50 animate-in fade-in-50 slide-in-from-top-2">
              <div className="p-3 border-b border-border">
                <p className="text-xs font-semibold text-text">{user?.nombreCompleto}</p>
                <p className="text-[11px] text-text-muted">{user?.email}</p>
                <div className="mt-2">
                  <Badge variant={isAdmin ? 'admin' : 'pro'} dot>
                    {isAdmin ? 'ADMINISTRADOR' : 'PROFESIONAL CLÍNICO'}
                  </Badge>
                </div>
              </div>

              {/* Fast switch demo account */}
              <div className="p-2 border-b border-border">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" /> Cambiar de Perfil
                </p>
                <div className="space-y-1">
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => {
                        quickLogin(demo.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-[var(--radius-xs)] text-xs flex items-center justify-between hover:bg-zinc-100 transition-colors ${
                        demo.id === user?.id ? 'bg-primary/10 text-primary font-medium' : 'text-text'
                      }`}
                    >
                      <span className="truncate">{demo.nombreCompleto}</span>
                      <span className="text-[9px] text-text-muted uppercase">
                        {demo.rol === 'ADMIN' ? 'Admin' : 'Pro'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-error hover:bg-rose-50 rounded-[var(--radius-xs)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
