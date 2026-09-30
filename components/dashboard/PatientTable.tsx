'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RegistroPaciente } from '@/types/paciente';
import { pacienteService } from '@/services/pacienteService';
import { notificar } from '@/lib/notifications';
import { exportPacientesToExcel } from '@/lib/export/exportExcel';
import { usePacientes, type UsePacientesResult } from '@/lib/hooks/usePacientes';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { PatientDetailModal } from './PatientDetailModal';
import { PatientFormModal } from './PatientFormModal';
import { PacienteDeleteModal } from './PacienteDeleteModal';
import {
  Pencil,
  Eye,
  Trash2,
  UserPlus,
  Download,
  AlertCircle,
  Search,
  Inbox,
  ChevronDown,
  RefreshCw,
  UserCheck,
  CalendarDays,
  X,
} from 'lucide-react';

interface PatientTableProps {
  pacientes: UsePacientesResult;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const ESTADOS = ['Activo', 'En Seguimiento', 'En Espera', 'Egresado', 'Derivado'];

/**
 * La columna FECHA MAX CONTACTO guarda fechas ISO (YYYY-MM-DD), pero algunos
 * registros arrastran formato libre desde planillas. Normalizar deja comparar
 * contra lo que entrega <input type="date"> sin depender de como se escribió.
 */
const normalizeFecha = (valor?: string | null): string => {
  const texto = (valor ?? '').trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : texto.toLowerCase();
};

const getEstadoVariant = (estado: string) => {
  if (estado === 'Activo') return 'success' as const;
  if (estado === 'Egresado') return 'default' as const;
  if (estado === 'Derivado') return 'warning' as const;
  return 'info' as const;
};

const SíNo = ({ value }: { value: string }) => {
  const esSi = value === 'Sí';
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-[var(--radius-full)] text-[11px] font-bold ${
        esSi ? 'bg-success/15 text-success-text' : 'bg-surface-muted text-text-muted'
      }`}
      title={esSi ? 'Sí' : 'No'}
    >
      {esSi ? '✓' : '—'}
    </span>
  );
};

export const PatientTable: React.FC<PatientTableProps> = ({
  pacientes,
  searchQuery,
  onSearchChange,
}) => {
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [duplaFilter, setDuplaFilter] = useState('Todas');
  const [fechaMaxFiltro, setFechaMaxFiltro] = useState('');
  const [isFechaPopoverOpen, setIsFechaPopoverOpen] = useState(false);
  const fechaPopoverRef = useRef<HTMLDivElement>(null);
  const fechaBtnRef = useRef<HTMLButtonElement>(null);
  const [selectedPatient, setSelectedPatient] = useState<RegistroPaciente | null>(null);
  const [patientToEdit, setPatientToEdit] = useState<RegistroPaciente | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<RegistroPaciente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, status, sourceNotice, refresh } = pacientes;

  const duplas = useMemo(
    () => Array.from(new Set(data.map((p) => p.duplaACargo).filter(Boolean))).sort(),
    [data],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.filter((p) => {
      const matchesEstado = estadoFilter === 'Todos' || p.estado === estadoFilter;
      const matchesDupla = duplaFilter === 'Todas' || p.duplaACargo === duplaFilter;
      const matchesQuery =
        !q ||
        p.nombre?.toLowerCase().includes(q) ||
        p.rut?.toLowerCase().includes(q) ||
        p.diagnostico?.toLowerCase().includes(q) ||
        p.duplaACargo?.toLowerCase().includes(q);
      return matchesEstado && matchesDupla && matchesQuery;
    });
  }, [data, searchQuery, estadoFilter, duplaFilter]);

  /**
   * El filtro de fecha no oculta filas: solo las sube. Los registros que tienen
   * exactamente esa FECHA MAX CONTACTO quedan primero y el resto conserva el
   * orden original debajo, para no perder de vista el panorama completo.
   */
  const ordenados = useMemo(() => {
    if (!fechaMaxFiltro) return filtered;
    const objetivo = normalizeFecha(fechaMaxFiltro);
    const coincide = (p: RegistroPaciente) => normalizeFecha(p.fechaMaximaContactoInicial) === objetivo;
    const primero: RegistroPaciente[] = [];
    const resto: RegistroPaciente[] = [];
    for (const p of filtered) (coincide(p) ? primero : resto).push(p);
    return [...primero, ...resto];
  }, [filtered, fechaMaxFiltro]);

  const coincidenciasFecha = useMemo(() => {
    if (!fechaMaxFiltro) return 0;
    const objetivo = normalizeFecha(fechaMaxFiltro);
    return filtered.filter((p) => normalizeFecha(p.fechaMaximaContactoInicial) === objetivo).length;
  }, [filtered, fechaMaxFiltro]);

  const limpiarFiltros = () => {
    onSearchChange('');
    setEstadoFilter('Todos');
    setDuplaFilter('Todas');
    setFechaMaxFiltro('');
  };

  // El calendario vive en un popover propio: cerrar con Escape debe devolver el
  // foco al botón, si no el teclado queda sin contexto para quien navega con tab.
  useEffect(() => {
    if (!isFechaPopoverOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (fechaPopoverRef.current?.contains(target) || fechaBtnRef.current?.contains(target)) return;
      setIsFechaPopoverOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setIsFechaPopoverOpen(false);
      fechaBtnRef.current?.focus();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isFechaPopoverOpen]);

  const handleSavedPatient = (saved: RegistroPaciente) => {
    if (selectedPatient?.id === saved.id) {
      setSelectedPatient(saved);
    }
    void refresh();
  };

  const openDeleteModal = (paciente: RegistroPaciente) => {
    setDeleteError(null);
    setPatientToDelete(paciente);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;

    // Sin id no hay forma de armar el WHERE del borrado: en modo demo las filas
    // son objects sin clave, y una consulta sin filtro vaciaria la tabla entera.
    if (!patientToDelete.id) {
      setDeleteError('Este registro es de demostración y no se puede eliminar.');
      return;
    }

    setIsDeleting(true);

    let success = false;
    let error: string | undefined;
    try {
      ({ success, error } = await pacienteService.remove(patientToDelete.id));
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'No fue posible eliminar la ficha.';
    }
    setIsDeleting(false);

    if (!success) {
      setDeleteError(error || 'No fue posible eliminar la ficha.');
      notificar.fallo('No se pudo eliminar la ficha', error);
      return;
    }

    notificar.exito('Ficha eliminada', `Se eliminó el registro de ${patientToDelete.nombre}.`);

    // Se cierra la ficha antes de refrescar para no dejar el modal apuntando a
    // un registro que ya no existe.
    setPatientToDelete(null);
    setSelectedPatient((actual) => (actual?.id === patientToDelete.id ? null : actual));
    void refresh();
  };

  const handleExport = () => {
    // El boton esta deshabilitado cuando no hay filas, asi que esta guarda solo
    // cubre el caso en que la lista se vacie entre el render y el clic.
    if (filtered.length === 0) {
      notificar.aviso(
        'No hay nada que exportar',
        'Ajusta los filtros o agrega pacientes antes de generar el archivo.'
      );
      return;
    }

    // Se exporta `ordenados` y no `filtered` para que el archivo salga en el
    // mismo orden que la pantalla, con las coincidencias del filtro de fecha
    // primero. El exportador cubre las 37 columnas clinicas, no un resumen.
    exportPacientesToExcel(ordenados);

    notificar.exito(
      'Archivo generado',
      `Se exportaron ${filtered.length} ${filtered.length === 1 ? 'paciente' : 'pacientes'} a Excel.`
    );
  };

  const hasFilters =
    searchQuery.trim() !== '' ||
    estadoFilter !== 'Todos' ||
    duplaFilter !== 'Todas' ||
    fechaMaxFiltro !== '';

  return (
    <section
      id="pacientes"
      aria-labelledby="pacientes-heading"
      className="bg-surface border border-border rounded-[var(--radius-lg)]"
    >
      <div className="p-4 border-b border-border flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="pacientes-heading" className="text-base font-bold text-text">
              Registro de pacientes
            </h2>
            <p className="text-[13px] text-text-muted mt-0.5">
              <span className="font-semibold text-text tnum">{filtered.length}</span> de{' '}
              <span className="tnum">{data.length}</span> registros
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filtered.length === 0}
              title={
                filtered.length === 0
                  ? 'No hay registros que coincidan con los filtros actuales'
                  : `Exportar ${filtered.length} registros a Excel`
              }
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Exportar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setPatientToEdit(null);
                setIsFormModalOpen(true);
              }}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Nuevo paciente
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <label htmlFor="pacientes-busqueda" className="sr-only">
              Filtrar pacientes
            </label>
            <Search
              className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="pacientes-busqueda"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filtrar por nombre, RUT, diagnóstico o dupla..."
              className="w-full bg-surface border border-border rounded-[var(--radius-sm)] pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative sm:w-52">
              <label htmlFor="filtro-estado" className="sr-only">
                Filtrar por estado
              </label>
              <select
                id="filtro-estado"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="w-full appearance-none bg-surface border border-border rounded-[var(--radius-sm)] py-2.5 pl-3 pr-9 text-sm text-text focus:border-primary transition-colors cursor-pointer"
              >
                <option value="Todos">Todos los estados</option>
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            <div className="relative sm:w-52">
              <label htmlFor="filtro-dupla" className="sr-only">
                Filtrar por dupla
              </label>
              <select
                id="filtro-dupla"
                value={duplaFilter}
                onChange={(e) => setDuplaFilter(e.target.value)}
                className="w-full appearance-none bg-surface border border-border rounded-[var(--radius-sm)] py-2.5 pl-3 pr-9 text-sm text-text focus:border-primary transition-colors cursor-pointer"
              >
                <option value="Todas">Todas las duplas</option>
                {duplas.map((dupla) => (
                  <option key={dupla} value={dupla}>
                    {dupla}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            <div className="relative sm:w-auto flex items-center gap-1">
              <Button
                ref={fechaBtnRef}
                variant="outline"
                size="sm"
                onClick={() => setIsFechaPopoverOpen((v) => !v)}
                aria-expanded={isFechaPopoverOpen}
                aria-haspopup="dialog"
                aria-controls="popover-fecha-max-contacto"
                // El boton conserva siempre su nombre: si la etiqueta cambiara a la fecha, quien
// navega con lector de pantalla perdería el nombre del filtro activo.
className={`w-full justify-between sm:w-auto ${fechaMaxFiltro ? 'border-primary text-primary' : ''}`}
                leftIcon={<CalendarDays className="w-3.5 h-3.5" />}
                rightIcon={<ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                Filtro: Fecha máx. contacto
              </Button>

              {fechaMaxFiltro && (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-primary/10 px-2 py-1 text-[13px] font-semibold text-primary-text tnum whitespace-nowrap">
                    {fechaMaxFiltro}
                    <span className="font-normal">
                      ({coincidenciasFecha === 1 ? '1 coincide' : `${coincidenciasFecha} coinciden`})
                    </span>
                  </span>
                  <IconButton
                    label="Quitar filtro de fecha máxima de contacto"
                    tone="neutral"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setFechaMaxFiltro('')}
                  >
                    <X className="w-4 h-4" />
                  </IconButton>
                </>
              )}

              {isFechaPopoverOpen && (
                <div
                  ref={fechaPopoverRef}
                  id="popover-fecha-max-contacto"
                  role="dialog"
                  aria-label="Filtrar por fecha máxima de contacto"
                  className="absolute right-0 z-30 mt-2 w-[19rem] rounded-[var(--radius-md)] border border-border bg-surface p-4 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold text-text">Fecha máx. contacto</p>
                      <p className="text-[13px] text-text-muted mt-0.5">
                        Sube al inicio los registros que coinciden con esa fecha.
                      </p>
                    </div>
                    <IconButton
                      label="Cerrar filtro de fecha"
                      tone="neutral"
                      size="sm"
                      onClick={() => {
                        setIsFechaPopoverOpen(false);
                        fechaBtnRef.current?.focus();
                      }}
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </IconButton>
                  </div>

                  <label htmlFor="filtro-fecha-max-contacto" className="sr-only">
                    Fecha máxima de contacto
                  </label>
                  <input
                    id="filtro-fecha-max-contacto"
                    type="date"
                    value={fechaMaxFiltro}
                    onChange={(e) => setFechaMaxFiltro(e.target.value)}
                    className="w-full bg-surface border border-border rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-text focus:border-primary transition-colors"
                  />

                  {fechaMaxFiltro && (
                    <p
                      className="mt-3 text-[13px] text-text-muted"
                      role="status"
                      aria-live="polite"
                    >
                      {coincidenciasFecha === 0 ? (
                        'Ningún registro tiene esa fecha; la tabla queda sin reordenar.'
                      ) : (
                        <>
                          <span className="font-semibold text-text tnum">{coincidenciasFecha}</span>{' '}
                          {coincidenciasFecha === 1
                            ? 'registro coincide y sube al inicio.'
                            : 'registros coinciden y suben al inicio.'}
                        </>
                      )}
                    </p>
                  )}

                  {fechaMaxFiltro && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => setFechaMaxFiltro('')}
                    >
                      Quitar filtro de fecha
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {sourceNotice && status === 'ready' && (
          <p className="flex items-start gap-2 text-[13px] text-warning-text bg-warning/10 border border-warning/30 rounded-[var(--radius-sm)] px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            {sourceNotice}
          </p>
        )}
      </div>

      {status === 'loading' ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2" role="status">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
          <p className="text-[13px] text-text-muted">Cargando registros clínicos...</p>
        </div>
      ) : status === 'error' ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <AlertCircle className="w-8 h-8 text-error-text mb-3" aria-hidden="true" />
          <p className="text-sm font-semibold text-text">No pudimos cargar los pacientes</p>
          <p className="text-[13px] text-text-muted mt-1 max-w-sm">
            {sourceNotice ||
              'Ocurrió un problema al consultar el registro clínico. Revisa la conexión e inténtalo de nuevo.'}
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => void refresh()}>
            Reintentar
          </Button>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <Inbox className="w-8 h-8 text-text-muted mb-3" aria-hidden="true" />
          <p className="text-sm font-semibold text-text">Aún no hay pacientes registrados</p>
          <p className="text-[13px] text-text-muted mt-1 max-w-sm">
            Registra el primer paciente para comenzar el seguimiento clínico.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => {
              setPatientToEdit(null);
              setIsFormModalOpen(true);
            }}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Nuevo paciente
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <Search className="w-8 h-8 text-text-muted mb-3" aria-hidden="true" />
          <p className="text-sm font-semibold text-text">Sin coincidencias</p>
          <p className="text-[13px] text-text-muted mt-1">
            Ningún registro cumple los filtros aplicados.
          </p>
{hasFilters && (
              <Button variant="ghost" size="sm" className="mt-3" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            )}
        </div>
      ) : (
        <>
<p className="px-4 py-2 text-[13px] text-text-muted border-b border-border bg-surface-muted flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Desplaza la tabla en horizontal para ver las 37 columnas</span>
              {fechaMaxFiltro && (
                <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                  <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                  Filtro de fecha máx. contacto:{' '}
                  <span className="tnum font-semibold">{fechaMaxFiltro}</span>
                  <span role="status" aria-live="polite">
                    ({coincidenciasFecha}{' '}
                    {coincidenciasFecha === 1 ? 'coincide' : 'coinciden'})
                  </span>
                </span>
              )}
            </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[3200px]">
              <caption className="sr-only">
                Registro clínico de pacientes con estado, dupla a cargo, diagnóstico y atenciones
              </caption>
              <thead>
                {/* whitespace-nowrap + truncate en las celdas: con 37 columnas el
                    ancho lo impone el contenido, y sin esto las celdas de texto
                    largo parten en varias lineas y duplican la altura de la fila. */}
                <tr className="bg-surface-muted border-b border-border text-text-muted uppercase tracking-wider font-semibold text-[11px]">
                  <th scope="col" className="py-3 px-4 sticky left-0 bg-surface-muted z-20">Acciones</th>
                  <th scope="col" className="py-3 px-3 sticky left-20 bg-surface-muted z-20">N°</th>
                  <th scope="col" className="py-3 px-4 sticky left-32 bg-surface-muted z-20 border-r border-border">
                    Nombre paciente
                  </th>
                  <th scope="col" className="py-3 px-4">RUT</th>
                  <th scope="col" className="py-3 px-4">Estado</th>
                  <th scope="col" className="py-3 px-5">Dupla a cargo</th>
                  <th scope="col" className="py-3 px-4">Fecha derivación</th>
                  <th scope="col" className="py-3 px-4">Fecha egreso</th>
                  <th scope="col" className="py-3 px-4">Fecha máx. contacto</th>
                  <th scope="col" className="py-3 px-4">Fecha ingreso UEGO</th>
                  <th scope="col" className="py-3 px-6 max-w-[200px] truncate">Observaciones ingreso</th>
                  <th scope="col" className="py-3 px-3">Edad</th>
                  <th scope="col" className="py-3 px-3">EG</th>
                  <th scope="col" className="py-3 px-4">Tipología</th>
                  <th scope="col" className="py-3 px-6 max-w-[220px] truncate">Diagnóstico</th>
                  <th scope="col" className="py-3 px-6 max-w-[200px] truncate">Obs. diagnóstico</th>
                  <th scope="col" className="py-3 px-4">Ingreso fin semana / UEGO</th>
                  <th scope="col" className="py-3 px-4">Teléfono</th>
                  <th scope="col" className="py-3 px-6 max-w-[180px] truncate">Obs. contacto</th>
                  <th scope="col" className="py-3 px-3 text-center">Migrante</th>
                  <th scope="col" className="py-3 px-4 text-center">Pueblo originario</th>
                  <th scope="col" className="py-3 px-3 text-center">Entrega recuerdo</th>
                  <th scope="col" className="py-3 px-3 text-center">Díptico inf.</th>
                  <th scope="col" className="py-3 px-4 text-center">Acomp. cerrada</th>
                  <th scope="col" className="py-3 px-4 text-center">Control ambulatorio</th>
                  {Array.from({ length: 10 }, (_, i) => (
                    <th scope="col" key={i} className="py-3 px-4">
                      Atención {i + 1}
                    </th>
                  ))}
                  <th scope="col" className="py-3 px-4 text-center">Total atenciones</th>
                  <th scope="col" className="py-3 px-6 max-w-[240px] truncate">Obs. atenciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenados.map((paciente) => {
                  // Marca la fila que el filtro de fecha subió, para que el reordenamiento
                  // se lea como resultado del filtro y no como un cambio de datos.
                  const enTope = fechaMaxFiltro !== '' && normalizeFecha(paciente.fechaMaximaContactoInicial) === normalizeFecha(fechaMaxFiltro);
                  return (
                  <tr
                    key={paciente.id}
                    className={`border-b border-border transition-colors ${
                      // El hover tambien cambia de color: si se dejara el azul de
                      // siempre, al pasar el mouse la fila volveria a verse normal
                      // y se perderia la alerta justo cuando se revisa el registro.
                      enTope ? 'bg-error/10 hover:bg-error/15' : 'hover:bg-primary/5'
                    }`}
                  >
                    <td className="py-2.5 px-4 sticky left-0 bg-surface z-10">
                      <div className="flex items-center gap-1">
                        <IconButton
                          label={`Ver ficha de ${paciente.nombre}`}
                          size="sm"
                          onClick={() => setSelectedPatient(paciente)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </IconButton>
                        <IconButton
                          label={`Editar ficha de ${paciente.nombre}`}
                          size="sm"
                          onClick={() => {
                            setPatientToEdit(paciente);
                            setIsFormModalOpen(true);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </IconButton>
                        <IconButton
                          label={`Eliminar ficha de ${paciente.nombre}`}
                          size="sm"
                          tone="danger"
                          onClick={() => openDeleteModal(paciente)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </IconButton>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-text-muted sticky left-20 bg-surface z-10 tnum">
                      {paciente.numero}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-text sticky left-32 bg-surface z-10 border-r border-border">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-[var(--radius-full)] bg-primary/10 text-primary-text flex items-center justify-center text-[11px] font-bold shrink-0">
                          {paciente.nombre.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate max-w-[180px]">{paciente.nombre}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-text tnum whitespace-nowrap">{paciente.rut}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <Badge variant={getEstadoVariant(paciente.estado)}>{paciente.estado}</Badge>
                    </td>
                    <td className="py-2.5 px-5 font-medium text-text max-w-[160px] truncate" title={paciente.duplaACargo}>
                      {paciente.duplaACargo}
                    </td>
                    <td className="py-2.5 px-4 tnum whitespace-nowrap">{paciente.fechaDerivacionDupla || '—'}</td>
                    <td className="py-2.5 px-4 tnum whitespace-nowrap">{paciente.fechaEgreso || 'En curso'}</td>
                    <td className="py-2.5 px-4 tnum whitespace-nowrap">{paciente.fechaMaximaContactoInicial || '—'}</td>
                    <td className="py-2.5 px-4 tnum whitespace-nowrap">{paciente.fechaIngresoUego || '—'}</td>
                    <td
                      className="py-2.5 px-6 text-text-muted max-w-[220px] truncate"
                      title={paciente.observacionesIngreso}
                    >
                      {paciente.observacionesIngreso || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold tnum whitespace-nowrap">{paciente.edad}</td>
                    <td className="py-2.5 px-3 text-text-muted whitespace-nowrap">{paciente.eg}</td>
                    <td className="py-2.5 px-4 font-medium text-text max-w-[140px] truncate" title={paciente.tipologia}>
                      {paciente.tipologia}
                    </td>
                    <td
                      className="py-2.5 px-6 font-semibold text-text max-w-[240px] truncate"
                      title={paciente.diagnostico}
                    >
                      {paciente.diagnostico}
                    </td>
                    <td
                      className="py-2.5 px-6 text-text-muted max-w-[200px] truncate"
                      title={paciente.observacionesDiagnostico}
                    >
                      {paciente.observacionesDiagnostico || '—'}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">{paciente.ingresoHorarioEspecial}</td>
                    <td className="py-2.5 px-4 font-mono tnum whitespace-nowrap">{paciente.telefono}</td>
                    <td
                      className="py-2.5 px-6 text-text-muted max-w-[180px] truncate"
                      title={paciente.observacionesContacto}
                    >
                      {paciente.observacionesContacto || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center"><SíNo value={paciente.migrante} /></td>
                    <td className="py-2.5 px-4 text-center text-text-muted max-w-[140px] truncate" title={paciente.puebloOriginario}>
                      {paciente.puebloOriginario}
                    </td>
                    <td className="py-2.5 px-3 text-center"><SíNo value={paciente.entregaRecuerdo} /></td>
                    <td className="py-2.5 px-3 text-center"><SíNo value={paciente.entregaDiptico} /></td>
                    <td className="py-2.5 px-4 text-center">
                      <SíNo value={paciente.acompanamientoAtencionCerrada} />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <SíNo value={paciente.controlAmbulatorioPsicosocial} />
                    </td>
                    {Array.from({ length: 10 }, (_, i) => {
                      const key = `atencion${i + 1}` as keyof RegistroPaciente;
                      const value = paciente[key];
                      return (
                        <td
                          key={i}
                          className="py-2.5 px-4 text-text-muted tnum max-w-[180px] truncate"
                          title={(value as string) || undefined}
                        >
                          {(value as string) || '—'}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-4 text-center font-bold text-primary-text tnum">
                      {paciente.totalAtenciones ?? 0}
                    </td>
                    <td
                      className="py-2.5 px-6 text-text-muted max-w-[260px] truncate"
                      title={paciente.observacionAtenciones}
                    >
                      {paciente.observacionAtenciones || '—'}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-3 text-[13px] text-text-muted border-t border-border flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Usa el ojo para ver la ficha, el lápiz para editarla y la papelera para eliminarla.
          </p>
        </>
      )}

      <PatientDetailModal
        paciente={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onEdit={(p) => {
          setSelectedPatient(null);
          setPatientToEdit(p);
          setIsFormModalOpen(true);
        }}
      />

      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSaved={handleSavedPatient}
        pacienteToEdit={patientToEdit}
      />

      <PacienteDeleteModal
        paciente={patientToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (isDeleting) return;
          setPatientToDelete(null);
          setDeleteError(null);
        }}
      />
    </section>
  );
};
