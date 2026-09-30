'use client';

import React, { useState, useEffect, useId } from 'react';
import { RegistroPaciente } from '@/types/paciente';
import { pacienteService } from '@/services/pacienteService';
import { notificar } from '@/lib/notifications';
import { formatearRut } from '@/lib/utils/rut';
import { duplaService } from '@/services/duplaService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { CardFooter } from '@/components/ui/Card';
import { AlertCircle, X, Save, UserPlus, Edit3, ChevronDown, Hash } from 'lucide-react';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (paciente: RegistroPaciente) => void;
  pacienteToEdit?: RegistroPaciente | null;
}

const SIN_DUPLA = 'Sin dupla asignada';

/** Catálogos cerrados de la ficha clínica. */
const TIPOLOGIAS = ['Mayor de 22', 'Menor de 22'];

const DIAGNOSTICOS = [
  'Aborto Incompleto',
  'Aborto Espontáneo',
  'Embarazo Ectópico',
  'Aborto Retenido',
  'Óbito Fetal',
  'Aborto en Evolución',
  'Embarazo Gemelar Monocorial Biamniótico',
  'Embarazo Ectópico V/S Aborto Tubario',
  'Mortinato',
  'Embarazo Ectópico en CCA',
];

type CampoAtencion = 'atencion1' | 'atencion2' | 'atencion3' | 'atencion4' | 'atencion5' | 'atencion6' | 'atencion7' | 'atencion8' | 'atencion9' | 'atencion10';

const ATENCIONES: { key: CampoAtencion; label: string }[] = Array.from({ length: 10 }, (_, i) => ({
  key: `atencion${i + 1}` as CampoAtencion,
  label: `Atención ${i + 1}`,
}));

/** El total cuenta los casilleros de atención con comentario; los vacíos no cuentan. */
const contarAtenciones = (data: { [K in CampoAtencion]: string }): number =>
  ATENCIONES.filter(({ key }) => data[key]?.trim()).length;

const DEFAULT_PACIENTE: Omit<RegistroPaciente, 'id' | 'numero'> = {
  duplaACargo: SIN_DUPLA,
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
  tipologia: '',
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
  const [duplas, setDuplas] = useState<string[]>([]);
  const duplaFieldId = useId();

  const isEditing = !!pacienteToEdit?.id;
  const formKey = isOpen ? (pacienteToEdit?.id ?? 'new') : null;
  const [syncedKey, setSyncedKey] = useState<string | null>(null);
  /** Valores de una ficha previa que ya no están en los catálogos actuales. */
  const [fueraDeCatalogo, setFueraDeCatalogo] = useState<{
    tipologia: string | null;
    diagnostico: string | null;
  }>({ tipologia: null, diagnostico: null });

  if (isOpen && formKey !== syncedKey) {
    setSyncedKey(formKey);
    setError(null);
    if (pacienteToEdit) {
      const { id, numero, ...rest } = pacienteToEdit;
      // Fichas antiguas pueden traer un total que no cuadra con sus casilleros.
      // Al abrir se recalcula para no editar sobre un número que ya no es real.
      //
      // Un valor fuera del catálogo no puede quedarse en el estado: el `<select>`
      // lo muestra en blanco pero su `.value` pasa a la primera opción, así que la
      // pantalla y el estado discreparían y se guardaría el dato viejo creyendo
      // que se cambió. Se vacía de verdad y se recuerda para avisarle.
      setFueraDeCatalogo({
        tipologia: TIPOLOGIAS.includes(rest.tipologia) ? null : rest.tipologia,
        diagnostico: DIAGNOSTICOS.includes(rest.diagnostico) ? null : rest.diagnostico,
      });
      setFormData({
        ...rest,
        tipologia: TIPOLOGIAS.includes(rest.tipologia) ? rest.tipologia : '',
        diagnostico: DIAGNOSTICOS.includes(rest.diagnostico) ? rest.diagnostico : '',
        totalAtenciones: contarAtenciones(rest),
      });
    } else {
      setFueraDeCatalogo({ tipologia: null, diagnostico: null });
      setFormData(DEFAULT_PACIENTE);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    duplaService.getAll().then((rows) => {
      if (cancelled) return;
      setDuplas(rows.map((d) => d.nombreDupla));
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // El total es derivado, nunca escrito a mano: los casilleros de atención son
      // la fuente de verdad, así la tabla nunca muestra un número descuadrado.
      if (field.startsWith('atencion')) {
        next.totalAtenciones = contarAtenciones(next as { [K in CampoAtencion]: string });
      }
      return next;
    });
    // El aviso se levanta al elegir una opción real del catálogo, no con cualquier
    // cambio: el campo queda en blanco hasta que se elige, y vacío tampoco es válido.
    if (field === 'tipologia' && TIPOLOGIAS.includes(String(value))) {
      setFueraDeCatalogo((prev) => ({ ...prev, tipologia: null }));
    }
    if (field === 'diagnostico' && DIAGNOSTICOS.includes(String(value))) {
      setFueraDeCatalogo((prev) => ({ ...prev, diagnostico: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre.trim() || !formData.rut.trim() || !formData.diagnostico.trim()) {
      setError('Completa al menos el nombre, el RUT y el diagnóstico.');
      return;
    }
    if (!formData.tipologia.trim()) {
      setError('Selecciona la tipología del paciente.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && pacienteToEdit?.id) {
        const res = await pacienteService.update(pacienteToEdit.id, formData);
        if (!res.success) {
          setError(res.error || 'No se pudo actualizar el paciente.');
          notificar.fallo('No se pudo actualizar la ficha', res.error);
          setIsSaving(false);
          return;
        }
        notificar.exito('Ficha actualizada', `Los cambios de ${formData.nombre.trim()} quedaron guardados.`);
        onSaved({
          ...formData,
          id: pacienteToEdit.id,
          numero: pacienteToEdit.numero,
        });
      } else {
        const res = await pacienteService.create(formData);
        if (res.error || !res.data) {
          setError(res.error || 'No se pudo guardar el paciente.');
          notificar.fallo('No se pudo guardar la ficha', res.error);
          setIsSaving(false);
          return;
        }
        notificar.exito('Paciente agregado', `${formData.nombre.trim()} quedó registrado en la lista.`);
        onSaved(res.data);
      }
      onClose();
    } catch (err: unknown) {
      const detalle = err instanceof Error ? err.message : 'No se pudo guardar el paciente.';
      setError(detalle);
      notificar.fallo('No se pudo guardar la ficha', detalle);
    } finally {
      setIsSaving(false);
    }
  };

  const duplaOptions = duplas.includes(formData.duplaACargo)
    ? duplas
    : [formData.duplaACargo, ...duplas].filter(Boolean);

  return (
    <Modal isOpen onClose={onClose} labelledBy="paciente-form-title" size="xl">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
        <span
          className="w-9 h-9 rounded-[var(--radius-sm)] bg-primary/10 text-primary-text flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          {isEditing ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="paciente-form-title" className="text-base font-bold text-text">
            {isEditing ? 'Editar ficha de paciente' : 'Registrar nuevo paciente'}
          </h2>
          <p className="text-[13px] text-text-muted truncate">
            {isEditing
              ? `Registro #${pacienteToEdit?.numero}`
              : 'Los campos marcados con asterisco son obligatorios'}
          </p>
        </div>
        <IconButton label="Cerrar formulario de paciente" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </IconButton>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 p-3 rounded-[var(--radius-sm)] bg-error/10 text-error-text border border-error/30 text-[13px]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              {error}
            </p>
          )}

          {/* Datos personales */}
          <fieldset className="space-y-4">
            <legend className="sr-only">Datos personales e identificación</legend>
            <SectionTitle>Datos personales e identificación</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Nombre completo"
                  placeholder="Ej: Sofía Antonia Morales Silva"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  required
                />
              </div>
              <Input
                label="RUT"
                placeholder="Ej: 21.987.654-1"
                value={formData.rut}
                onChange={(e) => handleChange('rut', formatearRut(e.target.value))}
                inputMode="numeric"
                leftIcon={<Hash className="w-4 h-4" />}
                required
              />
              <Input
                label="Edad"
                type="number"
                min={0}
                max={120}
                value={formData.edad}
                onChange={(e) => handleChange('edad', parseInt(e.target.value, 10) || 0)}
              />
              <Input
                label="EG"
                placeholder="Ej: N/A"
                value={formData.eg}
                onChange={(e) => handleChange('eg', e.target.value)}
              />
              <Input
                label="Teléfono principal"
                placeholder="+56 9 1234 5678"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
              />
            </div>
          </fieldset>

          {/* Dupla y estado */}
          <fieldset className="space-y-4">
            <legend className="sr-only">Asignación de dupla y estado</legend>
            <SectionTitle>Asignación de dupla y estado</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                id={duplaFieldId}
                label="Dupla a cargo"
                value={formData.duplaACargo}
                onChange={(v) => handleChange('duplaACargo', v)}
                options={duplaOptions}
                emptyHint="Aún no hay duplas registradas. Créalas desde el menú Duplas."
              />
              <SelectField
                id={`${duplaFieldId}-estado`}
                label="Estado del paciente"
                value={formData.estado}
                onChange={(v) => handleChange('estado', v)}
                options={['Activo', 'En Seguimiento', 'En Espera', 'Egresado', 'Derivado']}
              />
            </div>
          </fieldset>

          {/* Diagnóstico */}
          <fieldset className="space-y-4">
            <legend className="sr-only">Diagnóstico y tipología</legend>
            <SectionTitle>Diagnóstico y tipología</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                id="paciente-tipologia"
                label="Tipología"
                value={formData.tipologia}
                onChange={(valor) => handleChange('tipologia', valor)}
                options={TIPOLOGIAS}
                placeholder="Selecciona una tipología"
                required
                warning={
                  fueraDeCatalogo.tipologia
                    ? `La ficha guardaba "${fueraDeCatalogo.tipologia}". Elige una tipología del catálogo para reemplazarlo.`
                    : undefined
                }
              />
              <SelectField
                id="paciente-diagnostico"
                label="Diagnóstico principal"
                value={formData.diagnostico}
                onChange={(valor) => handleChange('diagnostico', valor)}
                options={DIAGNOSTICOS}
                placeholder="Selecciona un diagnóstico"
                required
                warning={
                  fueraDeCatalogo.diagnostico
                    ? `La ficha guardaba "${fueraDeCatalogo.diagnostico}". Elige un diagnóstico del catálogo para reemplazarlo.`
                    : undefined
                }
              />
              <div className="sm:col-span-2">
                <Input
                  label="Observaciones del diagnóstico"
                  placeholder="Detalles complementarios del diagnóstico..."
                  value={formData.observacionesDiagnostico}
                  onChange={(e) => handleChange('observacionesDiagnostico', e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          {/* Fechas */}
          <fieldset className="space-y-4">
            <legend className="sr-only">Fechas de ingreso y derivación</legend>
            <SectionTitle>Fechas de ingreso y derivación</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Input
                label="Ingreso UEGO"
                type="date"
                value={formData.fechaIngresoUego}
                onChange={(e) => handleChange('fechaIngresoUego', e.target.value)}
              />
              <Input
                label="Derivación dupla"
                type="date"
                value={formData.fechaDerivacionDupla}
                onChange={(e) => handleChange('fechaDerivacionDupla', e.target.value)}
              />
              <Input
                label="Máx. contacto"
                type="date"
                value={formData.fechaMaximaContactoInicial}
                onChange={(e) => handleChange('fechaMaximaContactoInicial', e.target.value)}
              />
              <Input
                label="Egreso"
                type="date"
                value={formData.fechaEgreso}
                onChange={(e) => handleChange('fechaEgreso', e.target.value)}
              />
            </div>
          </fieldset>

          {/* Atenciones */}
          <fieldset className="space-y-4">
            <legend className="sr-only">Registro de atenciones</legend>
            <SectionTitle>Registro de atenciones</SectionTitle>
            <p className="text-[13px] text-text-muted -mt-1">
              Deja vacío el casillero de las atenciones que no se realizaron.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {ATENCIONES.map(({ key, label }) => (
                <Input
                  key={key}
                  label={label}
                  placeholder="Comentario"
                  value={formData[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Total atenciones"
                type="number"
                min={0}
                max={10}
                readOnly
                value={formData.totalAtenciones}
                hint={`Se cuenta solo: ${contarAtenciones(formData)} de ${ATENCIONES.length} casillas con comentario`}
                className="bg-surface-muted font-bold text-primary-text tnum"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Observación de atenciones"
                  placeholder="Notas sobre el seguimiento de las atenciones..."
                  value={formData.observacionAtenciones}
                  onChange={(e) => handleChange('observacionAtenciones', e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          {/* Psicosocial */}
          <fieldset className="space-y-4">
            <legend className="sr-only">Enfoque psicosocial y entregas</legend>
            <SectionTitle>Enfoque psicosocial y entregas</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SelectField
                id={`${duplaFieldId}-migrante`}
                label="Migrante"
                value={formData.migrante}
                onChange={(v) => handleChange('migrante', v)}
                options={['No', 'Sí']}
              />
              <SelectField
                id={`${duplaFieldId}-pueblo`}
                label="Pueblo originario"
                value={formData.puebloOriginario}
                onChange={(v) => handleChange('puebloOriginario', v)}
                options={['No', 'Mapuche', 'Aymara', 'Rapa Nui', 'Otro']}
              />
              <SelectField
                id={`${duplaFieldId}-recuerdo`}
                label="Entrega recuerdo"
                value={formData.entregaRecuerdo}
                onChange={(v) => handleChange('entregaRecuerdo', v)}
                options={['Sí', 'No']}
              />
              <SelectField
                id={`${duplaFieldId}-diptico`}
                label="Entrega díptico"
                value={formData.entregaDiptico}
                onChange={(v) => handleChange('entregaDiptico', v)}
                options={['Sí', 'No']}
              />
              <SelectField
                id={`${duplaFieldId}-acompanamiento`}
                label="Acomp. atención cerrada"
                value={formData.acompanamientoAtencionCerrada}
                onChange={(v) => handleChange('acompanamientoAtencionCerrada', v)}
                options={['Sí', 'No']}
              />
              <SelectField
                id={`${duplaFieldId}-control`}
                label="Control ambulatorio"
                value={formData.controlAmbulatorioPsicosocial}
                onChange={(v) => handleChange('controlAmbulatorioPsicosocial', v)}
                options={['Sí', 'No']}
              />
              <SelectField
                id={`${duplaFieldId}-horario`}
                label="Ingreso horario especial"
                value={formData.ingresoHorarioEspecial}
                onChange={(v) => handleChange('ingresoHorarioEspecial', v)}
                options={['No', 'Sí']}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Observaciones del ingreso"
                placeholder="Circunstancias del ingreso, motivos, derivación..."
                value={formData.observacionesIngreso}
                onChange={(e) => handleChange('observacionesIngreso', e.target.value)}
              />
              <Input
                label="Observaciones de contacto"
                placeholder="Intentos de contacto, horarios, respuestas..."
                value={formData.observacionesContacto}
                onChange={(e) => handleChange('observacionesContacto', e.target.value)}
              />
            </div>
          </fieldset>
        </div>

        <CardFooter className="justify-end gap-3 rounded-b-[var(--radius-lg)]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            loadingLabel={isEditing ? 'Guardando cambios' : 'Registrando paciente'}
            leftIcon={!isSaving ? <Save className="w-3.5 h-3.5" /> : undefined}
          >
            {isEditing ? 'Guardar cambios' : 'Registrar paciente'}
          </Button>
        </CardFooter>
      </form>
    </Modal>
  );
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-semibold text-text border-b border-border pb-2 flex items-center gap-2">
    <span className="w-2 h-2 rounded-[var(--radius-full)] bg-primary" aria-hidden="true" />
    {children}
  </h3>
);

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  emptyHint?: string;
  placeholder?: string;
  required?: boolean;
  warning?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  emptyHint,
  placeholder,
  required,
  warning,
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-xs font-semibold text-text-muted uppercase">
      {label}
      {required && <span className="text-error-text"> *</span>}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-surface border border-border rounded-[var(--radius-sm)] py-2.5 pl-3 pr-9 text-sm focus:border-primary transition-colors appearance-none cursor-pointer"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />
    </div>
    {warning && (
      <p className="text-[13px] text-warning-text flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        {warning}
      </p>
    )}
    {emptyHint && options.length <= 1 && (
      <p className="text-[13px] text-text-muted">{emptyHint}</p>
    )}
  </div>
);
