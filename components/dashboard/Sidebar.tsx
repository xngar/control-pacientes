'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  LayoutDashboard,
  Users2,
  UserCheck,
  MessageSquare,
  FileText,
  BarChart3,
  Layers,
  Settings,
  ShieldCheck,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenDuplas?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed: controlledCollapsed, onToggleCollapse, onOpenDuplas }) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggle = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const isAdmin = user?.rol === 'ADMIN';

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: isAdmin ? '/admin' : '/clinico', active: true },
    { label: 'Duplas a Cargo', icon: Users2, href: '#duplas', badge: '3' },
    { label: 'Pacientes', icon: UserCheck, href: '#pacientes' },
    { label: 'Alertas & Mensajes', icon: MessageSquare, href: '#mensajes' },
  ];

  const toolItems = [
    { label: 'Registro Atenciones', icon: HeartPulse, href: '#atenciones' },
    { label: 'Fichas Clínicas', icon: FileText, href: '#fichas' },
    { label: 'Analítica & UEGO', icon: BarChart3, href: '#analitica' },
    { label: 'Tipologías & Diagnósticos', icon: Layers, href: '#diagnosticos' },
  ];

  const systemItems = [
    { label: 'Ajustes', icon: Settings, href: '#ajustes' },
    { label: 'Seguridad & RLS', icon: ShieldCheck, href: '#seguridad' },
    { label: 'Centro de Ayuda', icon: HelpCircle, href: '#ayuda' },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-surface border-r border-border flex flex-col justify-between transition-all duration-300 z-40 shrink-0 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col">
        <div className="h-16 px-4 flex items-center justify-between border-b border-border">
          {!isCollapsed && (
            <Link href={isAdmin ? '/admin' : '/clinico'} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-primary text-white flex items-center justify-center shadow-xs group-hover:bg-primary-hover transition-colors">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-text leading-tight">
                  DataReport
                </span>
                <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                  Salud Mental
                </span>
              </div>
            </Link>
          )}

          {isCollapsed && (
            <div className="mx-auto w-8 h-8 rounded-[var(--radius-sm)] bg-primary text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={toggle}
            className="p-1.5 rounded-[var(--radius-sm)] border border-border hover:bg-zinc-100 text-text-muted hover:text-text transition-colors focus:outline-none"
            title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Group 1: Menu */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                Menu
              </p>
            )}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isDuplasItem = item.label === 'Duplas a Cargo';

                if (isDuplasItem) {
                  return (
                    <button
                      key={item.label}
                      onClick={onOpenDuplas}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all text-text-muted hover:text-text hover:bg-zinc-100"
                      title={isCollapsed ? 'Duplas a Cargo' : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 shrink-0 text-text-muted" />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-[var(--radius-full)]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all ${
                      item.active
                        ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'text-text-muted hover:text-text hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-primary' : 'text-text-muted'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-[var(--radius-full)]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Group 2: Tools / Gestión */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                Gestión Clínica
              </p>
            )}
            <nav className="space-y-1">
              {toolItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium text-text-muted hover:text-text hover:bg-zinc-100 transition-all"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Group 3: System */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                Configuración
              </p>
            )}
            <nav className="space-y-1">
              {systemItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium text-text-muted hover:text-text hover:bg-zinc-100 transition-all"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-border">
        {!isCollapsed ? (
          <p className="text-[11px] text-text-muted text-center">
            © {new Date().getFullYear()} DataReport, Inc.
          </p>
        ) : (
          <div className="w-2 h-2 rounded-[var(--radius-full)] bg-primary mx-auto" title="Sistema en línea" />
        )}
      </div>
    </aside>
  );
};
