'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { KpiCards } from './KpiCards';
import { PatientTable } from './PatientTable';
import { DuplasModal } from './DuplasModal';
import { useAuth } from '@/lib/auth/auth-context';

export const DashboardLayout: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDuplasModalOpen, setIsDuplasModalOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-row">
      {/* Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenDuplas={() => setIsDuplasModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header searchQuery={searchQuery} onSearch={setSearchQuery} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
          {/* Welcome subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                Panel de Control & Seguimiento de Pacientes
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Bienvenido/a, <span className="font-semibold text-text">{user?.nombreCompleto}</span> · Registro clínico por duplas interdisciplinarias.
              </p>
            </div>
          </div>

          {/* Top KPI Metric Cards & Chart */}
          <KpiCards onOpenDuplas={() => setIsDuplasModalOpen(true)} />

          {/* Clinical Patient Table with 36 fields */}
          <PatientTable searchQuery={searchQuery} />
        </main>
      </div>

      {/* Duplas Management Modal */}
      <DuplasModal
        isOpen={isDuplasModalOpen}
        onClose={() => setIsDuplasModalOpen(false)}
      />
    </div>
  );
};
