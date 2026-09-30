'use client';

import React, { useId, useRef, useState } from 'react';
import { RegistroPaciente } from '@/types/paciente';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { Pencil, Users2, Phone, X } from 'lucide-react';

interface PatientDetailModalProps {
  paciente: RegistroPaciente | null;
  onClose: () => void;
  onEdit?: (paciente: RegistroPaciente) => void;
}

const TABS = [
  { key: 'resumen', label: 'Ficha general y dupla' },
  { key: 'ingreso', label: 'Ingreso y trazabilidad' },
  { key: 'atenciones', label: 'Atenciones' },
  { key: 'psicosocial', label: 'Psicosocial y entrega' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const estadoVariant = (estado: RegistroPaciente['estado']) => {
  if (estado === 'Activo') return 'success' as const;
  if (estado === 'En Seguimiento') return 'pro' as const;
  if (estado === 'Egresado') return 'default' as const;
  if (estado === 'En Espera') return 'warning' as const;
  return 'info' as const;
};

const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label,
  children,
  className = '',
}) => (
  <div className={`px-4 py-3 rounded-[var(--radius-sm)] bg-surface-muted border border-border ${className}`}>
    <dt className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{label}</dt>
    <dd className="mt-1 text-[13px] text-text">{children}</dd>
  </div>
);

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  paciente,
  onClose,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('resumen');
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const titleId = `${baseId}-title`;

  if (!paciente) return null;

  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = event.key === 'ArrowRight' ? (index + 1) % TABS.length : (index - 1 + TABS.length) % TABS.length;
    setActiveTab(TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  return (
    <Modal isOpen onClose={onClose} labelledBy={titleId} size="xl">
      <div className="px-5 sm:px-6 py-4 border-b border-border flex items-start justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <span
            className="w-11 h-11 rounded-[var(--radius-md)] bg-primary text-white flex items-center justify-center font-semibold text-lg shrink-0"
            aria-hidden="true"
          >
            {paciente.nombre.charAt(0)}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 id={titleId} className="text-lg font-bold text-text tracking-tight truncate" title={paciente.nombre}>
                {paciente.nombre}
              </h2>
              <Badge variant={estadoVariant(paciente.estado)} dot>
                {paciente.estado}
              </Badge>
            </div>
            <p className="text-[13px] text-text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span>
                <span className="sr-only">RUT: </span>
                {paciente.rut}
              </span>
              <span>
                <span className="sr-only">Edad: </span>
                {paciente.edad} años
              </span>
              <span>
                <span className="sr-only">Ficha: </span>N° {paciente.numero}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(paciente)}
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
            >
              Editar ficha
            </Button>
          )}
          <IconButton label="Cerrar ficha" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Secciones de la ficha"
        className="px-5 sm:px-6 border-b border-border flex gap-1 overflow-x-auto shrink-0"
      >
        {TABS.map((tab, index) => (
          <button
            key={tab.key}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            id={`${baseId}-tab-${tab.key}`}
            aria-selected={activeTab === tab.key}
            aria-controls={`${baseId}-panel-${tab.key}`}
            tabIndex={activeTab === tab.key ? 0 : -1}
            onKeyDown={(e) => onTabKeyDown(e, index)}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 px-3 text-[13px] font-medium border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-primary text-primary-text font-semibold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${activeTab}`}
        aria-labelledby={`${baseId}-tab-${activeTab}`}
        tabIndex={0}
        className="px-5 sm:px-6 py-5 overflow-y-auto flex-1 space-y-5"
      >
        {activeTab === 'resumen' && (
          <>
            <div className="px-4 py-3.5 rounded-[var(--radius-sm)] bg-primary/5 border border-primary/20">
              <p className="text-[11px] font-semibold text-primary-text uppercase tracking-wider flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5" aria-hidden="true" /> Dupla responsable
              </p>
              <p className="mt-1 text-base font-bold text-text">{paciente.duplaACargo}</p>
              <p className="mt-0.5 text-[13px] text-text-muted">
                Derivada el {paciente.fechaDerivacionDupla || 'sin fecha registrada'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Tipología">
                <p className="font-semibold">{paciente.tipologia}</p>
                <p className="mt-1 text-text-muted">Escolaridad: {paciente.eg}</p>
              </Field>
              <Field label="Diagnóstico clínico">
                <p className="font-semibold">{paciente.diagnostico}</p>
                <p className="mt-1 text-text-muted leading-relaxed">
                  {paciente.observacionesDiagnostico || 'Sin observaciones adicionales.'}
                </p>
              </Field>
            </div>

            <div className="px-4 py-3.5 rounded-[var(--radius-sm)] bg-surface-muted border border-border">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> Datos de contacto
              </p>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[13px] text-text-muted">Teléfono principal</p>
                  <p className="font-semibold text-text font-mono tnum">{paciente.telefono}</p>
                </div>
                <div>
                  <p className="text-[13px] text-text-muted">Observaciones de contacto</p>
                  <p className="text-[13px] text-text leading-relaxed">
                    {paciente.observacionesContacto || 'Sin observaciones.'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'ingreso' && (
          <>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field label="Ingreso UEGO">{paciente.fechaIngresoUego || '—'}</Field>
              <Field label="Derivación dupla">{paciente.fechaDerivacionDupla || '—'}</Field>
              <Field label="Máx. contacto">{paciente.fechaMaximaContactoInicial || '—'}</Field>
              <Field label="Egreso">{paciente.fechaEgreso || 'En curso'}</Field>
            </dl>

            <div className="px-4 py-3.5 rounded-[var(--radius-sm)] bg-surface-muted border border-border">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Ingreso en fin de semana, horario inhábil, feriado o UEGO
              </p>
              <p className="mt-1 text-[13px] font-semibold text-accent-text">{paciente.ingresoHorarioEspecial}</p>
            </div>

            <div className="px-4 py-3.5 rounded-[var(--radius-sm)] bg-surface-muted border border-border">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Observaciones de ingreso
              </p>
              <p className="mt-1 text-[13px] text-text leading-relaxed">
                {paciente.observacionesIngreso || 'Sin observaciones registradas.'}
              </p>
            </div>
          </>
        )}

        {activeTab === 'atenciones' && (
          <>
            <div className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-sm)] bg-primary/5 border border-primary/20">
              <span className="text-[13px] font-semibold text-text">Total de atenciones realizadas</span>
              <span className="text-base font-bold text-primary-text tnum">
                {paciente.totalAtenciones} <span className="text-text-muted text-sm font-medium">/ 10</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const value = paciente[`atencion${n}` as keyof RegistroPaciente] as string;
                return (
                  <div
                    key={n}
                    className={`px-3 py-2.5 rounded-[var(--radius-sm)] border text-[13px] ${
                      value
                        ? 'bg-surface border-border'
                        : 'bg-surface-muted/50 border-dashed border-border'
                    }`}
                  >
                    <span className="font-semibold text-text">Atención {n}</span>
                    {/* El comentario se muestra completo: se envuelve en varias líneas
                        en vez de recortarse, para que nada quede ilegible. */}
                    {value ? (
                      <p className="mt-1 text-text leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                        {value}
                      </p>
                    ) : (
                      <p className="mt-1 text-text-muted italic">Sin registro</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3.5 rounded-[var(--radius-sm)] bg-surface-muted border border-border">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Observación general de atenciones
              </p>
              <p className="mt-1 text-[13px] text-text leading-relaxed">
                {paciente.observacionAtenciones || 'Sin observaciones registradas.'}
              </p>
            </div>
          </>
        )}

        {activeTab === 'psicosocial' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Migrante">
              <Badge variant={paciente.migrante === 'Sí' ? 'warning' : 'default'}>{paciente.migrante}</Badge>
            </Field>
            <Field label="Pueblo originario">
              <Badge variant={paciente.puebloOriginario !== 'No' ? 'info' : 'default'}>
                {paciente.puebloOriginario}
              </Badge>
            </Field>
            <Field label="Entrega de recuerdo">
              <Badge variant={paciente.entregaRecuerdo === 'Sí' ? 'success' : 'error'}>
                {paciente.entregaRecuerdo === 'Sí' ? 'Entregado' : 'No entregado'}
              </Badge>
            </Field>
            <Field label="Entrega de díptico informativo">
              <Badge variant={paciente.entregaDiptico === 'Sí' ? 'success' : 'error'}>
                {paciente.entregaDiptico === 'Sí' ? 'Entregado' : 'No entregado'}
              </Badge>
            </Field>
            <Field label="Acompañamiento psicosocial">
              <Badge variant={paciente.acompanamientoAtencionCerrada === 'Sí' ? 'pro' : 'default'}>
                {paciente.acompanamientoAtencionCerrada === 'Sí' ? 'Atención cerrada' : 'Abierta'}
              </Badge>
            </Field>
            <Field label="Control ambulatorio psicosocial">
              <Badge variant={paciente.controlAmbulatorioPsicosocial === 'Sí' ? 'pro' : 'default'}>
                {paciente.controlAmbulatorioPsicosocial === 'Sí' ? 'Realizado' : 'Pendiente'}
              </Badge>
            </Field>
          </div>
        )}
      </div>

      <div className="px-5 sm:px-6 py-3.5 border-t border-border bg-surface-muted flex items-center justify-end gap-3 shrink-0 rounded-b-[var(--radius-lg)]">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cerrar ficha
        </Button>
      </div>
    </Modal>
  );
};
