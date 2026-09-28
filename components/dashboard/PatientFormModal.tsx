'use client';

import React, { useState, useEffect } from 'react';
import { RegistroPaciente } from '@/types/paciente';
import { pacienteService } from '@/services/pacienteService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Save, UserPlus, Edit3, Loader2 } from 'lucide-react';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (paciente: RegistroPaciente) => void;
  pacienteToEdit?: RegistroPaciente | null;
}

const DEFAULT_PACIENTE: Omit<RegistroPaciente, 'id' | 'numero'> = {
  duplaACargo: 'Dupla 1 (Ps. Tomás Valenzuela - T.O. Camila Soto)',
  estado: 'Activo',
  fechaDerivacionDupla: new Date().toISOString().split('T')[0],
  fechaEgreso: '',
  fechaMaximaContactoInicial: '',
  fechaIngresoUego: new Date().toISOString().split('T')[0],
  observacionesIngreso: '',
  nombre: '',
  rut: '',
  edad: 18,
  eg: 'N/A',
  tipologia: 'Salud Mental General',
  diagnostico: '',
  observacionesDiagnostico: '',
  ingresoHorarioEspecial: 'No',
  telefono: '+56 9 ',
  observacionesContacto: '',
  migrante: 'No',
  puebloOriginario: 'No',
  entregaRecuerdo: 'No',
  entregaDiptico: 'Sí',
  acompanamientoAtencionCerrada: 'No',
  controlAmbulatorioPsicosocial: 'Sí',
  atencion1: '',
  atencion2: '',
  atencion3: '',
  atencion4: '',
  atencion5: '',
  atencion6: '',
  atencion7: '',
  atencion8: '',
  atencion9: '',
  atencion10: '',
  totalAtenciones: 0,
  observacionAtenciones: '',
};

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  pacienteToEdit,
}) => {
  const [formData, setFormData] = useState<Omit<RegistroPaciente, 'id' | 'numero'>>(DEFAULT_PACIENTE);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pacienteToEdit) {
      const { id, numero, ...rest } = pacienteToEdit;
      setFormData(rest);
    } else {
      setFormData(DEFAULT_PACIENTE);
    }
    setError(null);
  }, [pacienteToEdit, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!pacienteToEdit?.id;

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre.trim() || !formData.rut.trim() || !formData.diagnostico.trim()) {
      setError('Por favor completa al menos el Nombre, RUT y Diagnóstico.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && pacienteToEdit?.id) {
        const res = await pacienteService.update(pacienteToEdit.id, formData);
        if (!res.success) {
          setError(res.error || 'Error al actualizar paciente');
          setIsSaving(false);
          return;
        }
        onSaved({
          ...formData,
          id: pacienteToEdit.id,
          numero: pacienteToEdit.numero,
        });
      } else {
        const res = await pacienteService.create(formData);
        if (res.error || !res.data) {
          setError(res.error || 'Error al guardar paciente');
          setIsSaving(false);
          return;
        }
        onSaved(res.data);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-3xl rounded-[var(--radius-lg)] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between gap-4 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-primary/10 text-primary flex items-center justify-center">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">
                {isEditing ? 'Editar Ficha de Paciente' : 'Registrar Nuevo Paciente'}
              </h2>
              <p className="text-xs text-text-muted">
                {isEditing
                  ? `Modificando registro #${pacienteToEdit.numero} en Supabase`
                  : 'Ingresa los datos para registrar la ficha clínica y asignar dupla'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-sm)] hover:bg-zinc-200 text-text-muted hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-[var(--radius-sm)] bg-error/15 text-rose-900 border border-error/30 text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Datos Personales */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-text border-b border-border pb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Datos Personales & Identificación
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Nombre Completo *"
                  placeholder="Ej: Sofía Antonia Morales Silva"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  required
                />
              </div>
              <Input
                label="RUT *"
                placeholder="Ej: 21.987.654-1"
                value={formData.rut}
                onChange={(e) => handleChange('rut', e.target.value)}
                required
              />
              <Input
                label="Edad"
                type="number"
                value={formData.edad}
                onChange={(e) => handleChange('edad', parseInt(e.target.value) || 0)}
              />
              <Input
                label="EG"
                placeholder="Ej: N/A"
                value={formData.eg}
                onChange={(e) => handleChange('eg', e.target.value)}
              />
              <Input
                label="Teléfono Principal"
                placeholder="+56 9 1234 5678"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Dupla & Estado */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-text border-b border-border pb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Asignación de Dupla & Estado
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-text-muted uppercase text-[11px]">
                  Dupla a Cargo
                </label>
                <select
                  value={formData.duplaACargo}
                  onChange={(e) => handleChange('duplaACargo', e.target.value)}
                  className="w-full bg-surface border border-border rounded-[var(--radius-sm)] py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Dupla 1 (Ps. Tomás Valenzuela - T.O. Camila Soto)">
                    Dupla 1 (Ps. Tomás Valenzuela - T.O. Camila Soto)
                  </option>
                  <option value="Dupla 2 (Ps. Andrea Ríos - T.S. Marco Peña)">
                    Dupla 2 (Ps. Andrea Ríos - T.S. Marco Peña)
                  </option>
                  <option value="Dupla 3 (Ps. Diego Morales - T.O. Carla Fuentes)">
                    Dupla 3 (Ps. Diego Morales - T.O. Carla Fuentes)
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-text-muted uppercase text-[11px]">
                  Estado del Paciente
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleChange('estado', e.target.value as any)}
                  className="w-full bg-surface border border-border rounded-[var(--radius-sm)] py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Activo">Activo</option>
                  <option value="En Seguimiento">En Seguimiento</option>
                  <option value="En Espera">En Espera</option>
                  <option value="Egresado">Egresado</option>
                  <option value="Derivado">Derivado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Diagnóstico y Tipología */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-text border-b border-border pb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Diagnóstico & Tipología
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tipología"
                placeholder="Ej: Salud Mental Infanto-Juvenil"
                value={formData.tipologia}
                onChange={(e) => handleChange('tipologia', e.target.value)}
              />
              <Input
                label="Diagnóstico Principal *"
                placeholder="Ej: Trastorno del Espectro Autista (TEA)"
                value={formData.diagnostico}
                onChange={(e) => handleChange('diagnostico', e.target.value)}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  label="Observaciones del Diagnóstico"
                  placeholder="Detalles complementarios del diagnóstico..."
                  value={formData.observacionesDiagnostico}
                  onChange={(e) => handleChange('observacionesDiagnostico', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Fechas y UEGO */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-text border-b border-border pb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Fechas de Ingreso & Derivación
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Input
                label="Fecha Ingreso UEGO"
                type="date"
                value={formData.fechaIngresoUego}
                onChange={(e) => handleChange('fechaIngresoUego', e.target.value)}
              />
              <Input
                label="Fecha Derivación Dupla"
                type="date"
                value={formData.fechaDerivacionDupla}
                onChange={(e) => handleChange('fechaDerivacionDupla', e.target.value)}
              />
              <Input
                label="Fecha Máx. Contacto"
                type="date"
                value={formData.fechaMaximaContactoInicial}
                onChange={(e) => handleChange('fechaMaximaContactoInicial', e.target.value)}
              />
              <Input
                label="Fecha Egreso"
                type="date"
                value={formData.fechaEgreso}
                onChange={(e) => handleChange('fechaEgreso', e.target.value)}
              />
            </div>
          </div>

          {/* Section 5: Enfoque Psicosocial */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-text border-b border-border pb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Enfoque Psicosocial & Entregas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-text-muted uppercase text-[10px]">Migrante</label>
                <select
                  value={formData.migrante}
                  onChange={(e) => handleChange('migrante', e.target.value as any)}
                  className="bg-surface border border-border rounded-[var(--radius-sm)] py-2 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="No">No</option>
                  <option value="Sí">Sí</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-text-muted uppercase text-[10px]">Pueblo Originario</label>
                <select
                  value={formData.puebloOriginario}
                  onChange={(e) => handleChange('puebloOriginario', e.target.value as any)}
                  className="bg-surface border border-border rounded-[var(--radius-sm)] py-2 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="No">No</option>
                  <option value="Mapuche">Mapuche</option>
                  <option value="Aymara">Aymara</option>
                  <option value="Rapa Nui">Rapa Nui</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-text-muted uppercase text-[10px]">Entrega Recuerdo</label>
                <select
                  value={formData.entregaRecuerdo}
                  onChange={(e) => handleChange('entregaRecuerdo', e.target.value as any)}
                  className="bg-surface border border-border rounded-[var(--radius-sm)] py-2 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-text-muted uppercase text-[10px]">Entrega Díptico</label>
                <select
                  value={formData.entregaDiptico}
                  onChange={(e) => handleChange('entregaDiptico', e.target.value as any)}
                  className="bg-surface border border-border rounded-[var(--radius-sm)] py-2 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-text-muted uppercase text-[10px]">Acomp. Atención Cerrada</label>
                <select
                  value={formData.acompanamientoAtencionCerrada}
                  onChange={(e) => handleChange('acompanamientoAtencionCerrada', e.target.value as any)}
                  className="bg-surface border border-border rounded-[var(--radius-sm)] py-2 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-text-muted uppercase text-[10px]">Control Ambulatorio</label>
                <select
                  value={formData.controlAmbulatorioPsicosocial}
                  onChange={(e) => handleChange('controlAmbulatorioPsicosocial', e.target.value as any)}
                  className="bg-surface border border-border rounded-[var(--radius-sm)] py-2 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
