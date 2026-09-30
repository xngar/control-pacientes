'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import {
  PanelLeftClose,
  PanelLeft,
  X,
  UserCog,
  Users2,
  UserCheck,
  Settings,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

type MenuAction = 'usuarios' | 'duplas';

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: MenuAction;
  active?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenDuplas: () => void;
  onOpenUsuarios?: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onOpenDuplas,
  onOpenUsuarios,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.rol === 'ADMIN';

  const groups: MenuGroup[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: isAdmin ? '/admin' : '/clinico', active: true },
        { label: 'Pacientes', icon: UserCheck, href: '#pacientes' },
      ],
    },
    {
      title: 'Herramientas',
      items: [
        { label: 'Duplas a cargo', icon: Users2, action: 'duplas' },
      ],
    },
    {
      title: 'Sistema',
      items: [
        ...(isAdmin ? [{ label: 'Usuarios', icon: UserCog, action: 'usuarios' as MenuAction }] : []),
        { label: 'Ajustes', icon: Settings },
      ],
    },
  ];

  const handleItem = (item: MenuItem) => {
    onCloseMobile();
    if (item.action === 'duplas') onOpenDuplas();
    if (item.action === 'usuarios') onOpenUsuarios?.();
  };

  const navContent = (
    <>
      <div
        className={`flex items-center gap-2.5 h-16 shrink-0 border-b border-border ${
          collapsed ? 'justify-center px-2' : 'px-4'
        }`}
      >
        <span
          className="w-8 h-8 rounded-[var(--radius-md)] bg-primary text-on-primary flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <UserCheck className="w-4 h-4" />
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block text-[13px] font-bold text-text leading-tight truncate">
              SICOLOGIA DATA
            </span>
            <span className="block text-[13px] text-text-muted leading-tight truncate">Report clínico</span>
          </span>
        )}
        <IconButton
          label="Cerrar navegación"
          size="sm"
          onClick={onCloseMobile}
          className="ml-auto lg:hidden"
        >
          <X className="w-4 h-4" />
        </IconButton>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3" aria-label="Navegación principal">
        {groups.map((group) => (
          <div key={group.title} className="mb-4 last:mb-0">
            {!collapsed && (
              <p className="px-4 pb-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const isCurrent = item.active || (item.href === '#pacientes' && pathname?.includes('clinico'));
                const Icon = item.icon;
                const content = (
                  <>
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </>
                );

                const baseClass = `w-full flex items-center gap-2.5 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors ${
                  collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'
                }`;

                if (item.action) {
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => handleItem(item)}
                        className={`${baseClass} text-text-muted hover:bg-primary/10 hover:text-primary-text cursor-pointer`}
                      >
                        {content}
                      </button>
                    </li>
                  );
                }

                if (item.href) {
                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        onClick={onCloseMobile}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={`${baseClass} ${
                          isCurrent
                            ? 'bg-primary/10 text-primary-text font-semibold'
                            : 'text-text-muted hover:bg-primary/10 hover:text-primary-text'
                        }`}
                      >
                        {content}
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <span
                      aria-disabled="true"
                      title="Próximamente"
                      className={`${baseClass} text-text-muted/60 cursor-not-allowed select-none`}
                    >
                      {content}
                      {!collapsed && (
                        <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-text-muted bg-surface-muted border border-border px-1.5 py-0.5 rounded-[var(--radius-xs)] shrink-0">
                          Próximamente
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`shrink-0 border-t border-border ${collapsed ? 'p-2' : 'p-3'}`}>
        {collapsed ? (
          <IconButton
            label="Expandir menú"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center"
          >
            <PanelLeft className="w-4 h-4" />
          </IconButton>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="w-full justify-start text-text-muted"
              leftIcon={<PanelLeftClose className="w-4 h-4" />}
            >
              Colapsar menú
            </Button>
            <p className="mt-2 text-[13px] text-text-muted text-center tnum">
              {new Date().getFullYear()} · v1.0
            </p>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-surface border-r border-border transition-[width] duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-text/50 animate-fade-in" onClick={onCloseMobile} />
          <aside className="relative w-64 max-w-[80vw] bg-surface border-r border-border flex flex-col animate-slide-in-left">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
