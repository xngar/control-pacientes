'use client';

import React, { useState } from 'react';
import { AppShell } from './AppShell';
import { PatientTable } from './PatientTable';
import { usePacientes } from '@/lib/hooks/usePacientes';

/** Sección Pacientes: solo el registro clínico, sin indicadores ni alertas. */
export const PacientesSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const pacientes = usePacientes();

  return (
    <AppShell>
      <PatientTable
        pacientes={pacientes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </AppShell>
  );
};