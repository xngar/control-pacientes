'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DuplasModal } from './DuplasModal';
import { UsuariosModal } from './UsuariosModal';
import { PerfilModal } from './PerfilModal';
import { useAuth } from '@/lib/auth/auth-context';

/**
 * Esqueleto común de las pantallas del panel: sidebar + header + modales de
 * duplas, usuarios y perfil. Las secciones (Dashboard, Pacientes) solo aportan
 * su contenido dentro de `<main>`.
 */
export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDuplasModalOpen, setIsDuplasModalOpen] = useState(false);
  const [isUsuariosModalOpen, setIsUsuariosModalOpen] = useState(false);
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  return (
    <div className="min-h-screen bg-background flex flex-row">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onOpenDuplas={() => setIsDuplasModalOpen(true)}
        onOpenUsuarios={isAdmin ? () => setIsUsuariosModalOpen(true) : undefined}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setMobileNavOpen((o) => !o)}
          sidebarOpen={mobileNavOpen}
          onOpenPerfil={() => setIsPerfilModalOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      <DuplasModal isOpen={isDuplasModalOpen} onClose={() => setIsDuplasModalOpen(false)} />

      {isAdmin && isUsuariosModalOpen && (
        <UsuariosModal onClose={() => setIsUsuariosModalOpen(false)} />
      )}

      {isPerfilModalOpen && <PerfilModal onClose={() => setIsPerfilModalOpen(false)} />}
    </div>
  );
};