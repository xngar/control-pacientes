'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DuplaAtencion } from '@/types/dupla';
import { UserProfile } from '@/types/auth';
import { duplaService } from '@/services/duplaService';
import { Button } from '@/components/ui/Button';
import {
  X,
  Users2,
  Edit3,
  Plus,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  UserCircle2,
  ChevronDown,
  AlertCircle,
  Trash2,
} from 'lucide-react';

interface DuplasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = 'list' | 'edit' | 'create';

const EMPTY_FORM = {
  nombreDupla: '',
  profesional1Id: '' as string | null,
  profesional2Id: '' as string | null,
  activa: true,
};

export const DuplasModal: React.FC<DuplasModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<ModalView>('list');
  const [duplas, setDuplas] = useState<DuplaAtencion[]>([]);
  const [profesionales, setProfesionales] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDupla, setSelectedDupla] = useState<DuplaAtencion | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const [duplasRes, prosRes] = await Promise.all([
      duplaService.getAll(),
      duplaService.getProfesionales(),
    ]);
    setDuplas(duplasRes);
    setProfesionales(prosRes);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setView('list');
      setError(null);
      setSuccessMsg(null);
      fetchAll();
    }
  }, [isOpen, fetchAll]);

  const handleOpenEdit = (dupla: DuplaAtencion) => {
    setSelectedDupla(dupla);
    setForm({
      nombreDupla: dupla.nombreDupla,
      profesional1Id: dupla.profesional1Id ?? null,
      profesional2Id: dupla.profesional2Id ?? null,
      activa: dupla.activa,
    });
    setError(null);
    setSuccessMsg(null);
    setView('edit');
  };

  const handleOpenCreate = () => {
    setSelectedDupla(null);
    setForm(EMPTY_FORM);
    setError(null);
    setSuccessMsg(null);
    setView('create');
  };

  const handleSave = async () => {
    if (!form.nombreDupla.trim()) {
      setError('El nombre de la dupla es obligatorio.');
      return;
    }
    setIsSaving(true);
    setError(null);

    if (view === 'edit' && selectedDupla) {
      const res = await duplaService.update(selectedDupla.id, {
        nombreDupla: form.nombreDupla.trim(),
        profesional1Id: form.profesional1Id || null,
        profesional2Id: form.profesional2Id || null,
        activa: form.activa,
      });
      if (res.success) {
        setSuccessMsg('Dupla actualizada correctamente.');
        await fetchAll();
        setTimeout(() => {
          setSuccessMsg(null);
          setView('list');
        }, 1200);
      } else {
        setError(res.error || 'Error al guardar.');
      }
    } else if (view === 'create') {
      const res = await duplaService.create({
        nombreDupla: form.nombreDupla.trim(),
        profesional1Id: form.profesional1Id || null,
        profesional2Id: form.profesional2Id || null,
        activa: form.activa,
      });
      if (res.data) {
        setSuccessMsg('Dupla creada correctamente.');
        await fetchAll();
        setTimeout(() => {
          setSuccessMsg(null);
          setView('list');
        }, 1200);
      } else {
        setError(res.error || 'Error al crear.');
      }
    }

    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Panel */}
      <div className="relative w-full max-w-2xl mx-4 bg-surface rounded-[var(--radius-lg)] border border-border shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-primary/10 text-primary flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {view === 'list' && 'Gestión de Duplas a Cargo'}
                {view === 'edit' && 'Editar Dupla'}
                {view === 'create' && 'Nueva Dupla'}
              </h2>
              <p className="text-[11px] text-text-muted">
                {view === 'list'
                  ? `${duplas.length} dupla${duplas.length !== 1 ? 's' : ''} registrada${duplas.length !== 1 ? 's' : ''}`
                  : view === 'edit'
                  ? `Editando: ${selectedDupla?.nombreDupla}`
                  : 'Crear una nueva dupla interdisciplinaria'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {view !== 'list' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('list')}
                className="text-xs text-text-muted"
              >
                ← Volver
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-[var(--radius-sm)] hover:bg-zinc-100 text-text-muted hover:text-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-text-muted">Cargando duplas...</span>
            </div>
          ) : view === 'list' ? (
            /* LIST VIEW */
            <div className="p-6 space-y-3">
              {duplas.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <Users2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay duplas registradas.</p>
                </div>
              ) : (
                duplas.map((dupla) => (
                  <DuplaCard key={dupla.id} dupla={dupla} onEdit={() => handleOpenEdit(dupla)} />
                ))
              )}
            </div>
          ) : (
            /* EDIT / CREATE FORM */
            <div className="p-6 space-y-5">
              {error && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-[var(--radius-sm)]">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-[var(--radius-sm)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Nombre de la Dupla */}
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Nombre de la Dupla <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={form.nombreDupla}
                  onChange={(e) => setForm((f) => ({ ...f, nombreDupla: e.target.value }))}
                  placeholder="Ej: Dupla 1 (Ps. García - T.O. Ramírez)"
                  className="w-full text-sm px-3 py-2.5 rounded-[var(--radius-sm)] border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-zinc-50 focus:bg-white"
                />
              </div>

              {/* Profesional 1 */}
              <ProfesionalSelector
                label="Profesional 1 (Principal)"
                value={form.profesional1Id}
                profesionales={profesionales}
                excludeId={form.profesional2Id}
                onChange={(val) => setForm((f) => ({ ...f, profesional1Id: val }))}
              />

              {/* Profesional 2 */}
              <ProfesionalSelector
                label="Profesional 2 (Co-responsable)"
                value={form.profesional2Id}
                profesionales={profesionales}
                excludeId={form.profesional1Id}
                onChange={(val) => setForm((f) => ({ ...f, profesional2Id: val }))}
              />

              {/* Estado activa */}
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Estado de la Dupla
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="activa"
                      checked={form.activa === true}
                      onChange={() => setForm((f) => ({ ...f, activa: true }))}
                      className="accent-primary"
                    />
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm text-text">Activa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="activa"
                      checked={form.activa === false}
                      onChange={() => setForm((f) => ({ ...f, activa: false }))}
                      className="accent-primary"
                    />
                    <XCircle className="w-4 h-4 text-error" />
                    <span className="text-sm text-text">Inactiva</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between gap-3 bg-zinc-50/60 rounded-b-[var(--radius-lg)]">
          {view === 'list' ? (
            <>
              <p className="text-[11px] text-text-muted">
                Pasa el cursor sobre una dupla para <span className="font-semibold text-primary">editarla</span>.
              </p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleOpenCreate}
              >
                Nueva Dupla
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setView('list'); setError(null); }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                leftIcon={!isSaving ? <Save className="w-4 h-4" /> : undefined}
              >
                {view === 'edit' ? 'Guardar Cambios' : 'Crear Dupla'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Sub-components ── */

interface DuplaCardProps {
  dupla: DuplaAtencion;
  onEdit: () => void;
}

const DuplaCard: React.FC<DuplaCardProps> = ({ dupla, onEdit }) => (
  <div className="group flex items-center justify-between p-4 bg-zinc-50 hover:bg-primary/5 border border-border hover:border-primary/30 rounded-[var(--radius-sm)] transition-all">
    <div className="flex items-start gap-3 min-w-0">
      <div className="mt-1.5 shrink-0">
        <span
          className={`block w-2.5 h-2.5 rounded-full ${dupla.activa ? 'bg-success' : 'bg-zinc-300'}`}
          title={dupla.activa ? 'Activa' : 'Inactiva'}
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text truncate">{dupla.nombreDupla}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          {dupla.profesional1 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
              <UserCircle2 className="w-3 h-3 shrink-0" />
              {dupla.profesional1.nombreCompleto}
              {dupla.profesional1.especialidad && (
                <span className="text-text-muted font-normal">· {dupla.profesional1.especialidad}</span>
              )}
            </span>
          )}
          {dupla.profesional2 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-medium">
              <UserCircle2 className="w-3 h-3 shrink-0" />
              {dupla.profesional2.nombreCompleto}
              {dupla.profesional2.especialidad && (
                <span className="text-text-muted font-normal">· {dupla.profesional2.especialidad}</span>
              )}
            </span>
          )}
          {!dupla.profesional1 && !dupla.profesional2 && (
            <span className="text-xs text-text-muted italic">Sin profesionales asignados</span>
          )}
        </div>
        {dupla.pacientesAsignados !== undefined && (
          <p className="text-[11px] text-text-muted mt-1">
            {dupla.pacientesAsignados} paciente{dupla.pacientesAsignados !== 1 ? 's' : ''} asignado{dupla.pacientesAsignados !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>

    <button
      onClick={onEdit}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:text-white border border-primary/40 hover:bg-primary rounded-[var(--radius-xs)] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
    >
      <Edit3 className="w-3.5 h-3.5" />
      Editar
    </button>
  </div>
);

interface ProfesionalSelectorProps {
  label: string;
  value: string | null;
  profesionales: UserProfile[];
  excludeId?: string | null;
  onChange: (val: string | null) => void;
}

const ProfesionalSelector: React.FC<ProfesionalSelectorProps> = ({
  label,
  value,
  profesionales,
  excludeId,
  onChange,
}) => {
  const available = profesionales.filter((p) => p.id !== excludeId);
  return (
    <div>
      <label className="block text-xs font-semibold text-text mb-1.5">{label}</label>
      <div className="relative">
        <UserCircle2 className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full text-sm pl-9 pr-9 py-2.5 rounded-[var(--radius-sm)] border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-zinc-50 focus:bg-white appearance-none cursor-pointer"
        >
          <option value="">— Sin asignar —</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombreCompleto}{p.especialidad ? ` · ${p.especialidad}` : ''}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {value && (
        <button
          onClick={() => onChange(null)}
          className="mt-1.5 text-[11px] text-error hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Quitar asignación
        </button>
      )}
    </div>
  );
};
