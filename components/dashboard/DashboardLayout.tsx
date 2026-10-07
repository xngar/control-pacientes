'use client';

import React, { useState } from 'react';
import { AppShell } from './AppShell';
import { AlertaLlamados } from './AlertaLlamados';
import { KpiCards } from './KpiCards';
import { PatientTable } from './PatientTable';
import { useAuth } from '@/lib/auth/auth-context';
import { usePacientes } from '@/lib/hooks/usePacientes';

export const DashboardLayout: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const pacientes = usePacientes();

  return (
    <AppShell>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h1 className="text-base sm:text-lg font-bold text-text tracking-tight">
          Panel de control y seguimiento de pacientes
        </h1>
        <p className="text-xs sm:text-[13px] text-text-muted">
          Bienvenido/a, <span className="font-semibold text-text">{user?.nombreCompleto}</span>. Registro clínico
          por duplas interdisciplinarias.
        </p>
      </div>

      <AlertaLlamados data={pacientes.data} status={pacientes.status} />

      <KpiCards data={pacientes.data} status={pacientes.status} />

      <PatientTable
        pacientes={pacientes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </AppShell>
  );
};