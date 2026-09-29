'use client';

import { useCallback, useEffect, useState } from 'react';
import { RegistroPaciente } from '@/types/paciente';
import { pacienteService } from '@/services/pacienteService';

export type PacientesStatus = 'loading' | 'ready' | 'error';

export interface UsePacientesResult {
  data: RegistroPaciente[];
  status: PacientesStatus;
  /** Mensaje del origen de datos cuando no proviene de la base real. */
  sourceNotice: string | null;
  refresh: () => Promise<void>;
  replace: (updater: (prev: RegistroPaciente[]) => RegistroPaciente[]) => void;
}

const DEMO_NOTICE =
  'No se pudo leer la base de datos. Se muestran datos de demostración, no registros clínicos reales.';

/**
 * Fuente unica del registro clinico. La consumen tanto los indicadores como la
 * tabla para que ambos no puedan discrepar: antes cada componente traia su
 * propio conteo y el panel anunciaba 148 pacientes con 63 en la tabla.
 */
export const usePacientes = (): UsePacientesResult => {
  const [data, setData] = useState<RegistroPaciente[]>([]);
  const [status, setStatus] = useState<PacientesStatus>('loading');
  const [sourceNotice, setSourceNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    pacienteService.getAll().then(
      (result) => {
        if (cancelled) return;
        setData(result.data);
        setSourceNotice(result.source === 'demo' ? DEMO_NOTICE : null);
        setStatus('ready');
      },
      () => {
        if (cancelled) return;
        setSourceNotice(DEMO_NOTICE);
        setStatus('error');
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await pacienteService.getAll();
      setData(result.data);
      setSourceNotice(result.source === 'demo' ? DEMO_NOTICE : null);
      setStatus('ready');
    } catch {
      setSourceNotice(DEMO_NOTICE);
      setStatus('error');
    }
  }, []);

  return { data, status, sourceNotice, refresh, replace: setData };
};
