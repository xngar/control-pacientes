'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { KpiCards } from './KpiCards';
import { PatientTable } from './PatientTable';
import { DuplasModal } from './DuplasModal';
import { UsuariosModal } from './UsuariosModal';
import { PerfilModal } from './PerfilModal';
import { useAuth } from '@/lib/auth/auth-context';
import { usePacientes } from '@/lib/hooks/usePacientes';

export const DashboardLayout: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDuplasModalOpen, setIsDuplasModalOpen] = useState(false);
  const [isUsuariosModalOpen, setIsUsuariosModalOpen] = useState(false);
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';
  const pacientes = usePacientes();

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

        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-full overflow-x-hidden">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
              Panel de control y seguimiento de pacientes
            </h1>
            <p className="text-[13px] sm:text-sm text-text-muted mt-1">
              Bienvenido/a, <span className="font-semibold text-text">{user?.nombreCompleto}</span>. Registro clínico
              por duplas interdisciplinarias.
            </p>
          </div>

          <KpiCards data={pacientes.data} status={pacientes.status} />

          <PatientTable
            pacientes={pacientes}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
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
