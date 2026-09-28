'use client';

import React, { useState } from 'react';
import { RegistroPaciente } from '@/types/paciente';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  X,
  Phone,
  Users2,
  Edit3,
} from 'lucide-react';

interface PatientDetailModalProps {
  paciente: RegistroPaciente | null;
  onClose: () => void;
  onEdit?: (paciente: RegistroPaciente) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  paciente,
  onClose,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'ingreso' | 'atenciones' | 'psicosocial'>('resumen');

  if (!paciente) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-4xl rounded-[var(--radius-lg)] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-start justify-between gap-4 bg-zinc-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-primary text-white flex items-center justify-center font-bold text-lg shadow-xs">
              {paciente.nombre.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-text">{paciente.nombre}</h2>
                <Badge
                  variant={
                    paciente.estado === 'Activo'
                      ? 'success'
                      : paciente.estado === 'En Seguimiento'
                      ? 'pro'
                      : paciente.estado === 'Egresado'
                      ? 'default'
                      : 'warning'
                  }
                  dot
                >
                  {paciente.estado}
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-1 flex items-center gap-3">
                <span><strong>RUT:</strong> {paciente.rut}</span>
                <span>•</span>
                <span><strong>Edad:</strong> {paciente.edad} años</span>
                <span>•</span>
                <span><strong>N° Ficha:</strong> #{paciente.numero}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(paciente);
                }}
                leftIcon={<Edit3 className="w-4 h-4" />}
              >
                Editar Ficha
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-[var(--radius-sm)] hover:bg-zinc-200/80 text-text-muted hover:text-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-border flex gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'resumen'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            Ficha General & Dupla
          </button>
          <button
            onClick={() => setActiveTab('ingreso')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'ingreso'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            Ingreso & Trazabilidad
          </button>
          <button
            onClick={() => setActiveTab('atenciones')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'atenciones'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            Atenciones (1 al 10)
          </button>
          <button
            onClick={() => setActiveTab('psicosocial')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'psicosocial'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            Enfoque Psicosocial & Entrega
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              {/* Dupla a cargo card */}
              <div className="p-4 rounded-[var(--radius-sm)] bg-primary/10 border border-primary/20">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Users2 className="w-4 h-4" /> Dupla Responsable a Cargo
                </p>
                <p className="text-base font-bold text-text mt-1">
                  {paciente.duplaACargo}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Fecha de derivación: {paciente.fechaDerivacionDupla || 'Sin registro'}
                </p>
              </div>

              {/* Diagnosis and Typology */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-[var(--radius-sm)] bg-zinc-50 border border-border">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Tipología
                  </p>
                  <p className="text-sm font-semibold text-text mt-1">{paciente.tipologia}</p>
                  <p className="text-xs text-text-muted mt-2"><strong>EG:</strong> {paciente.eg}</p>
                </div>

                <div className="p-4 rounded-[var(--radius-sm)] bg-zinc-50 border border-border">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Diagnóstico Clínico
                  </p>
                  <p className="text-sm font-semibold text-text mt-1">{paciente.diagnostico}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {paciente.observacionesDiagnostico || 'Sin observaciones adicionales.'}
                  </p>
                </div>
              </div>

              {/* Contact info */}
              <div className="p-4 rounded-[var(--radius-sm)] bg-zinc-50 border border-border space-y-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-primary" /> Datos de Contacto
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-xs text-text-muted">Teléfono Principal:</span>
                    <p className="font-semibold text-text">{paciente.telefono}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted">Observaciones de Contacto:</span>
                    <p className="text-xs text-text">{paciente.observacionesContacto || 'Sin observaciones'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ingreso' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3.5 bg-zinc-50 rounded-[var(--radius-sm)] border border-border">
                  <span className="text-xs text-text-muted">Fecha Ingreso UEGO</span>
                  <p className="text-sm font-semibold text-text mt-1">{paciente.fechaIngresoUego || '—'}</p>
                </div>
                <div className="p-3.5 bg-zinc-50 rounded-[var(--radius-sm)] border border-border">
                  <span className="text-xs text-text-muted">Fecha Derivación Dupla</span>
                  <p className="text-sm font-semibold text-text mt-1">{paciente.fechaDerivacionDupla || '—'}</p>
                </div>
                <div className="p-3.5 bg-zinc-50 rounded-[var(--radius-sm)] border border-border">
                  <span className="text-xs text-text-muted">Fecha Máx. Contacto</span>
                  <p className="text-sm font-semibold text-text mt-1">{paciente.fechaMaximaContactoInicial || '—'}</p>
                </div>
                <div className="p-3.5 bg-zinc-50 rounded-[var(--radius-sm)] border border-border">
                  <span className="text-xs text-text-muted">Fecha Egreso</span>
                  <p className="text-sm font-semibold text-text mt-1">{paciente.fechaEgreso || 'En curso'}</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 rounded-[var(--radius-sm)] border border-border space-y-2">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Ingreso Fin de Semana / Horario Inhábil / Feriado / UEGO
                </span>
                <p className="text-sm font-bold text-accent">
                  {paciente.ingresoHorarioEspecial}
                </p>
              </div>

              <div className="p-4 bg-zinc-50 rounded-[var(--radius-sm)] border border-border space-y-2">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Observaciones Respecto del Ingreso
                </span>
                <p className="text-xs text-text leading-relaxed">
                  {paciente.observacionesIngreso || 'Sin observaciones de ingreso registradas.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'atenciones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary/10 text-primary rounded-[var(--radius-sm)] border border-primary/20">
                <span className="font-semibold text-xs">Total Atenciones Realizadas:</span>
                <span className="text-base font-bold bg-white px-3 py-1 rounded-[var(--radius-xs)] shadow-xs">
                  {paciente.totalAtenciones} / 10
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { num: 1, val: paciente.atencion1 },
                  { num: 2, val: paciente.atencion2 },
                  { num: 3, val: paciente.atencion3 },
                  { num: 4, val: paciente.atencion4 },
                  { num: 5, val: paciente.atencion5 },
                  { num: 6, val: paciente.atencion6 },
                  { num: 7, val: paciente.atencion7 },
                  { num: 8, val: paciente.atencion8 },
                  { num: 9, val: paciente.atencion9 },
                  { num: 10, val: paciente.atencion10 },
                ].map((item) => (
                  <div
                    key={item.num}
                    className={`p-3 rounded-[var(--radius-sm)] border text-xs flex items-center justify-between ${
                      item.val
                        ? 'bg-surface border-primary/30 text-text'
                        : 'bg-zinc-50/50 border-dashed border-border text-text-muted'
                    }`}
                  >
                    <span className="font-semibold">Atención {item.num}</span>
                    <span className={item.val ? 'font-medium' : 'italic text-zinc-400'}>
                      {item.val || 'Sin registro'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-zinc-50 rounded-[var(--radius-sm)] border border-border space-y-1 mt-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Observación General de Atenciones
                </span>
                <p className="text-xs text-text leading-relaxed">
                  {paciente.observacionAtenciones || 'Sin observaciones registradas.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'psicosocial' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-[var(--radius-sm)] bg-zinc-50 border border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-text">Migrante</span>
                <Badge variant={paciente.migrante === 'Sí' ? 'warning' : 'default'}>
                  {paciente.migrante}
                </Badge>
              </div>

              <div className="p-4 rounded-[var(--radius-sm)] bg-zinc-50 border border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-text">Pueblo Originario</span>
                <Badge variant={paciente.puebloOriginario !== 'No' ? 'info' : 'default'}>
                  {paciente.puebloOriginario}
                </Badge>
              </div>

              <div className="p-4 rounded-[var(--radius-sm)] bg-zinc-50 border border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-text">Entrega de Recuerdo</span>
                <Badge variant={paciente.entregaRecuerdo === 'Sí' ? 'success' : 'error'}>
                  {paciente.entregaRecuerdo}
                </Badge>
              </div>

              <div className="p-4 rounded-[var(--radius-sm)] bg-zinc-50 border border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-text">Entrega Díptico Informativo</span>
                <Badge variant={paciente.entregaDiptico === 'Sí' ? 'success' : 'error'}>
                  {paciente.entregaDiptico}
                </Badge>
              </div>

              <div className="p-4 rounded-[var(--radius-sm)] bg-zinc-50 border border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-text">Acompañamiento Psicosocial Atención Cerrada</span>
                <Badge variant={paciente.acompanamientoAtencionCerrada === 'Sí' ? 'pro' : 'default'}>
                  {paciente.acompanamientoAtencionCerrada}
                </Badge>
              </div>

              <div className="p-4 rounded-[var(--radius-sm)] bg-zinc-50 border border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-text">Control Ambulatorio Psicosocial</span>
                <Badge variant={paciente.controlAmbulatorioPsicosocial === 'Sí' ? 'pro' : 'default'}>
                  {paciente.controlAmbulatorioPsicosocial}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-zinc-50 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar Ficha
          </Button>
        </div>
      </div>
    </div>
  );
};
