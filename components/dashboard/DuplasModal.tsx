'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import { DuplaAtencion } from '@/types/dupla';
import { UserProfile } from '@/types/auth';
import { duplaService } from '@/services/duplaService';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { CardFooter } from '@/components/ui/Card';
import {
  X,
  Users2,
  Plus,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  UserCircle2,
  ChevronDown,
  AlertCircle,
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

  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setView('list');
      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    Promise.all([duplaService.getAll(), duplaService.getProfesionales()]).then(
      ([duplasRes, prosRes]) => {
        if (cancelled) return;
        setDuplas(duplasRes);
        setProfesionales(prosRes);
        setIsLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setError(null);
    setSuccessMsg(null);
    setSelectedDupla(null);
    onClose();
  }, [onClose]);

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
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="duplas-modal-title" size="lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <h2 id="duplas-modal-title" className="text-base font-bold text-text">
          {view === 'list' && 'Gestión de duplas a cargo'}
          {view === 'edit' && 'Editar dupla'}
          {view === 'create' && 'Nueva dupla'}
        </h2>

        <div className="flex items-center gap-2">
          {view !== 'list' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('list')}
              leftIcon={<ChevronDown className="w-3.5 h-3.5 rotate-90" />}
            >
              Volver
            </Button>
          )}
          <IconButton label="Cerrar gestión de duplas" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2.5" role="status">
            <Loader2 className="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
            <span className="text-[13px] text-text-muted">Cargando duplas...</span>
          </div>
        ) : view === 'list' ? (
          <div className="p-6">
            {duplas.length === 0 ? (
              <div className="text-center py-12">
                <Users2 className="w-9 h-9 mx-auto mb-3 text-text-muted" aria-hidden="true" />
                <p className="text-sm font-semibold text-text">No hay duplas registradas</p>
                <p className="text-[13px] text-text-muted mt-1">
                  Crea la primera dupla para asignarle pacientes.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {duplas.map((dupla) => (
                  <li key={dupla.id}>
                    <DuplaCard dupla={dupla} onEdit={() => handleOpenEdit(dupla)} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div role="status" aria-live="polite" className="contents">
              {error && (
                <div className="flex items-start gap-2.5 bg-error/10 border border-error/30 text-error-text text-[13px] px-4 py-3 rounded-[var(--radius-sm)]">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2.5 bg-success/10 border border-success/30 text-success-text text-[13px] px-4 py-3 rounded-[var(--radius-sm)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="dupla-nombre" className="block text-xs font-semibold text-text mb-1.5">
                Nombre de la dupla
              </label>
              <input
                id="dupla-nombre"
                type="text"
                value={form.nombreDupla}
                onChange={(e) => setForm((f) => ({ ...f, nombreDupla: e.target.value }))}
                placeholder="Ej: Dupla 1 (Ps. García - T.O. Ramírez)"
                className="w-full text-sm px-3 py-2.5 rounded-[var(--radius-sm)] border border-border focus:border-primary transition-colors bg-surface"
              />
            </div>

            <ProfesionalSelector
              label="Profesional 1 (principal)"
              value={form.profesional1Id}
              profesionales={profesionales}
              excludeId={form.profesional2Id}
              onChange={(val) => setForm((f) => ({ ...f, profesional1Id: val }))}
            />

            <ProfesionalSelector
              label="Profesional 2 (co-responsable)"
              value={form.profesional2Id}
              profesionales={profesionales}
              excludeId={form.profesional1Id}
              onChange={(val) => setForm((f) => ({ ...f, profesional2Id: val }))}
            />

            <fieldset>
              <legend className="text-xs font-semibold text-text mb-2">Estado de la dupla</legend>
              <div className="flex items-center gap-6">
                {[
                  { value: true, label: 'Activa', Icon: CheckCircle2, color: 'text-success-text' },
                  { value: false, label: 'Inactiva', Icon: XCircle, color: 'text-error-text' },
                ].map(({ value, label, Icon, color }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="activa"
                      checked={form.activa === value}
                      onChange={() => setForm((f) => ({ ...f, activa: value }))}
                      className="accent-primary"
                    />
                    <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
                    <span className="text-sm text-text">{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </div>

      <CardFooter className="flex items-center justify-between gap-3 rounded-b-[var(--radius-lg)]">
        {view === 'list' ? (
          <>
            <p className="text-[13px] text-text-muted">
              {duplas.length} dupla{duplas.length !== 1 ? 's' : ''} registrada
              {duplas.length !== 1 ? 's' : ''}
            </p>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={handleOpenCreate}>
              Nueva dupla
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setView('list');
                setError(null);
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              loadingLabel="Guardando la dupla"
              leftIcon={!isSaving ? <Save className="w-3.5 h-3.5" /> : undefined}
            >
              {view === 'edit' ? 'Guardar cambios' : 'Crear dupla'}
            </Button>
          </>
        )}
      </CardFooter>
    </Modal>
  );
};

/* ── Sub-components ── */

interface DuplaCardProps {
  dupla: DuplaAtencion;
  onEdit: () => void;
}

const DuplaCard: React.FC<DuplaCardProps> = ({ dupla, onEdit }) => (
  <div className="flex items-center justify-between gap-3 p-4 bg-surface-muted hover:bg-primary/5 border border-border hover:border-primary/30 rounded-[var(--radius-sm)] transition-colors">
    <div className="flex items-start gap-3 min-w-0">
      <span
        className={`mt-1.5 w-2.5 h-2.5 rounded-[var(--radius-full)] shrink-0 ${dupla.activa ? 'bg-success' : 'bg-border'}`}
        title={dupla.activa ? 'Activa' : 'Inactiva'}
        aria-label={dupla.activa ? 'Activa' : 'Inactiva'}
        role="img"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text truncate">{dupla.nombreDupla}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          {dupla.profesional1 && (
            <span className="inline-flex items-center gap-1.5 text-xs text-primary-text font-medium">
              <UserCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {dupla.profesional1.nombreCompleto}
              {dupla.profesional1.especialidad && (
                <span className="text-text-muted font-normal">· {dupla.profesional1.especialidad}</span>
              )}
            </span>
          )}
          {dupla.profesional2 && (
            <span className="inline-flex items-center gap-1.5 text-xs text-secondary-text font-medium">
              <UserCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
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
          <p className="text-xs text-text-muted mt-1 tnum">
            {dupla.pacientesAsignados} paciente{dupla.pacientesAsignados !== 1 ? 's' : ''} asignado
            {dupla.pacientesAsignados !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>

    <Button variant="outline" size="sm" onClick={onEdit} className="shrink-0">
      Gestionar
    </Button>
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
  const id = useId();
  const available = profesionales.filter((p) => p.id !== excludeId);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-text mb-1.5">
        {label}
      </label>
      <div className="relative">
        <UserCircle2
          className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <select
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full text-sm pl-9 pr-9 py-2.5 rounded-[var(--radius-sm)] border border-border focus:border-primary transition-colors bg-surface appearance-none cursor-pointer"
        >
          <option value="">Sin asignar</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombreCompleto}
              {p.especialidad ? ` · ${p.especialidad}` : ''}
            </option>
          ))}
        </select>
        <ChevronDown
          className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {value && (
        <button
          onClick={() => onChange(null)}
          className="mt-1.5 text-xs text-error-text hover:underline flex items-center gap-1 cursor-pointer"
        >
          <X className="w-3 h-3" aria-hidden="true" /> Quitar asignación
        </button>
      )}
    </div>
  );
};
