'use client';

import React, { useMemo } from 'react';
import { RegistroPaciente } from '@/types/paciente';
import { Card } from '@/components/ui/Card';
import {
  UserPlus,
  CalendarCheck,
  UserCheck,
  UserRoundX,
  Loader2,
  AlertCircle,
  Inbox,
} from 'lucide-react';

interface KpiCardsProps {
  data: RegistroPaciente[];
  status: 'loading' | 'ready' | 'error';
}

interface Metric {
  label: string;
  value: number;
  context: string;
  icon: React.ElementType;
  tone: 'primary' | 'secondary' | 'accent' | 'warning';
}

const toneClasses: Record<Metric['tone'], string> = {
  primary: 'bg-primary/10 text-primary-text',
  secondary: 'bg-secondary/15 text-secondary-text',
  accent: 'bg-accent/10 text-accent-text',
  warning: 'bg-warning/10 text-warning-text',
};

const formatNumber = (value: number) => new Intl.NumberFormat('es-CL').format(value);

export const KpiCards: React.FC<KpiCardsProps> = ({ data, status }) => {
  const metrics = useMemo<Metric[]>(() => {
    const totalAtenciones = data.reduce((acc, p) => acc + (p.totalAtenciones ?? 0), 0);
    const conDupla = data.filter(
      (p) => p.duplaACargo && p.duplaACargo !== 'Sin dupla asignada',
    ).length;
    const activos = data.filter((p) => p.estado === 'Activo').length;
    const egresados = data.filter((p) => p.estado === 'Egresado').length;

    return [
      {
        label: 'Pacientes ingresados',
        value: data.length,
        context: `${formatNumber(conDupla)} con dupla a cargo`,
        icon: UserPlus,
        tone: 'primary',
      },
      {
        label: 'Total atenciones',
        value: totalAtenciones,
        context: 'Suma de atenciones registradas',
        icon: CalendarCheck,
        tone: 'secondary',
      },
      {
        label: 'Pacientes activos',
        value: activos,
        context: `De ${formatNumber(data.length)} registros`,
        icon: UserCheck,
        tone: 'accent',
      },
      {
        label: 'Pacientes egresados',
        value: egresados,
        context: `${formatNumber(data.length - egresados)} en curso`,
        icon: UserRoundX,
        tone: 'warning',
      },
    ];
  }, [data]);

  const porDupla = useMemo(() => {
    const totals = new Map<string, number>();
    data.forEach((paciente) => {
      const key = paciente.duplaACargo?.trim() || 'Sin dupla asignada';
      totals.set(key, (totals.get(key) ?? 0) + (paciente.totalAtenciones ?? 0));
    });
    return Array.from(totals, ([dupla, atenciones]) => ({ dupla, atenciones }))
      .sort((a, b) => b.atenciones - a.atenciones)
      .slice(0, 4);
  }, [data]);

  const maxAtenciones = porDupla.reduce((acc, d) => Math.max(acc, d.atenciones), 0);
  const totalGeneral = porDupla.reduce((acc, d) => acc + d.atenciones, 0);

  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" role="status">
        <p className="sm:col-span-2 xl:col-span-4 flex items-center gap-2 text-[13px] text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin text-primary" aria-hidden="true" />
          Calculando indicadores...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 p-4 rounded-[var(--radius-md)] bg-error/10 border border-error/30 text-error-text text-[13px]">
        <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
        No se pudieron calcular los indicadores del registro clínico.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      <div className="xl:col-span-2 grid grid-cols-2 xl:grid-cols-4 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 ${toneClasses[metric.tone]}`}
                  aria-hidden="true"
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-semibold text-text-muted leading-tight min-w-0">
                  {metric.label}
                </span>
                <span className="ml-auto text-xl sm:text-2xl font-bold text-text tracking-tight tnum shrink-0">
                  {formatNumber(metric.value)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-text-muted leading-snug">{metric.context}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-3 flex flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xs font-semibold text-text">Atenciones por dupla</h2>
          <p className="text-[11px] text-text-muted tnum shrink-0">
            {totalGeneral > 0
              ? `${formatNumber(totalGeneral)} registradas`
              : 'Sin atenciones'}
          </p>
        </div>

        {porDupla.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <Inbox className="w-5 h-5 text-text-muted mb-1.5" aria-hidden="true" />
            <p className="text-xs text-text-muted">Aún no hay atenciones que graficar.</p>
          </div>
        ) : (
          <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-x-4 gap-y-1.5 mt-2.5 content-center">
            {porDupla.map(({ dupla, atenciones }) => {
              const pct = maxAtenciones > 0 ? Math.round((atenciones / maxAtenciones) * 100) : 0;
              return (
                <li key={dupla} className="flex items-center gap-2">
                  <span className="text-xs text-text truncate min-w-0 flex-1" title={dupla}>
                    {dupla}
                  </span>
                  <span
                    className="h-1.5 w-14 sm:w-10 xl:w-16 shrink-0 rounded-[var(--radius-full)] bg-surface-muted overflow-hidden"
                    role="img"
                    aria-label={`${dupla}: ${atenciones} atenciones, ${pct}% del máximo`}
                  >
                    <span
                      className="block h-full rounded-[var(--radius-full)] bg-primary transition-[width] duration-500 ease-out"
                      style={{ width: `${Math.max(pct, atenciones > 0 ? 4 : 0)}%` }}
                    />
                  </span>
                  <span className="text-xs font-semibold text-text-muted tnum shrink-0 w-7 text-right">
                    {formatNumber(atenciones)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};
