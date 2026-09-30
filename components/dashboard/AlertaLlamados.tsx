'use client';

import React, { useMemo } from 'react';
import { RegistroPaciente } from '@/types/paciente';
import { Card } from '@/components/ui/Card';
import { diasHasta, hoyISO } from '@/lib/fechas';
import { CheckCircle2, Loader2, PhoneCall } from 'lucide-react';

interface AlertaLlamadosProps {
  data: RegistroPaciente[];
  status: 'loading' | 'ready' | 'error';
}

/** "martes 30 de septiembre" */
const FECHA_LARGA = new Intl.DateTimeFormat('es-CL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/**
 * Alerta de llamados: fichas cuya fecha maxima de contacto inicial ya se
 * cumplio. Se listan los de hoy primero y despues los mas atrasados, porque
 * un vencimiento atrasado es mas urgente que uno que vence esta semana.
 * No importa el estado del paciente: si la fecha vencio, hay que llamar.
 */
export const AlertaLlamados: React.FC<AlertaLlamadosProps> = ({ data, status }) => {
  const hoy = useMemo(() => hoyISO(), []);
  const hoyLegible = useMemo(() => FECHA_LARGA.format(new Date()), []);

  const agenda = useMemo(() => {
    return data
      .map((paciente) => ({ paciente, dias: diasHasta(paciente.fechaMaximaContactoInicial, hoy) }))
      .filter((item): item is { paciente: RegistroPaciente; dias: number } => item.dias !== null && item.dias <= 0)
      .sort((a, b) => {
        // Los de hoy encabezan la lista porque son el caso que se revisa a
        // diario; entre los atrasados va primero el mas antiguo.
        if (a.dias === 0 && b.dias !== 0) return -1;
        if (b.dias === 0 && a.dias !== 0) return 1;
        return a.dias - b.dias;
      });
  }, [data, hoy]);

  const paraHoy = agenda.filter((item) => item.dias === 0).length;
  const atrasados = agenda.length - paraHoy;

  return (
    <section aria-labelledby="alerta-llamados-heading">
      {/* El `!` es necesario: Card trae `bg-surface` y en Tailwind el color lo
          decide el orden del CSS, no el del className. */}
      <Card className="p-3 border-error/30! bg-error/6!">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className="w-7 h-7 rounded-[var(--radius-sm)] bg-error/15 text-error-strong flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            {status === 'loading' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PhoneCall className="w-3.5 h-3.5" />
            )}
          </span>
          <h2 id="alerta-llamados-heading" className="text-xs font-semibold text-error-strong">
            Pacientes para llamar
          </h2>
          {status === 'ready' && agenda.length > 0 && (
            <>
              <span className="text-[11px] font-bold text-error-strong tnum" aria-hidden="true">
                {agenda.length}
              </span>
              <span className="sr-only">
                {agenda.length} {agenda.length === 1 ? 'paciente' : 'pacientes'} con fecha maxima de contacto
                cumplida
              </span>
              <span className="text-[11px] text-text-muted tnum">
                {paraHoy > 0 && `${paraHoy} para hoy`}
                {paraHoy > 0 && atrasados > 0 && ' · '}
                {atrasados > 0 && `${atrasados} atrasados`}
              </span>
            </>
          )}
          <span className="ml-auto text-[11px] text-text-muted capitalize">{hoyLegible}</span>
        </div>

        {status === 'loading' ? (
          <p className="mt-2 text-xs text-text-muted">Revisando fechas de contacto...</p>
        ) : status === 'error' ? (
          <p className="mt-2 text-xs text-text-muted">
            No se pudo revisar la agenda de llamados. recarga la pagina para reintentar.
          </p>
        ) : agenda.length === 0 ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" aria-hidden="true" />
            Sin pacientes a llamar.
          </p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {agenda.map(({ paciente, dias }) => {
              const telefono = (paciente.telefono ?? '').trim();
              return (
                <li
                  key={paciente.id ?? paciente.numero}
                  className="shrink-0 flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-error/25 bg-surface px-2 py-1"
                >
                  <span className="text-xs font-semibold text-text whitespace-nowrap">
                    {paciente.nombre}
                  </span>
                  {telefono ? (
                    <a
                      href={`tel:${telefono.replace(/\s+/g, '')}`}
                      className="text-[11px] text-text-muted tnum whitespace-nowrap hover:text-error-strong hover:underline"
                    >
                      {telefono}
                    </a>
                  ) : (
                    <span className="text-[11px] text-text-muted italic whitespace-nowrap">
                      Sin telefono
                    </span>
                  )}
                  {dias < 0 && (
                    <span className="text-[10px] font-semibold text-error-strong tnum whitespace-nowrap">
                      {dias === -1 ? 'ayer' : `hace ${Math.abs(dias)} d`}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
};
