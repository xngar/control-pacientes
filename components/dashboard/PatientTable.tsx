'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RegistroPaciente } from '@/types/paciente';
import { pacienteService } from '@/services/pacienteService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PatientDetailModal } from './PatientDetailModal';
import { PatientFormModal } from './PatientFormModal';
import { exportPacientesToExcel } from '@/lib/export/exportExcel';
import {
  Search,
  RotateCcw,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  RefreshCw,
  FileDown,
} from 'lucide-react';

interface PatientTableProps {
  searchQuery?: string;
}

export const PatientTable: React.FC<PatientTableProps> = ({ searchQuery = '' }) => {
  const [data, setData] = useState<RegistroPaciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');
  const [selectedDupla, setSelectedDupla] = useState<string>('TODAS');

  // Modals
  const [selectedPatient, setSelectedPatient] = useState<RegistroPaciente | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<RegistroPaciente | null>(null);

  const fetchPacientes = async () => {
    setIsLoading(true);
    const res = await pacienteService.getAll();
    setData(res);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const effectiveSearch = searchQuery || localSearch;

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        effectiveSearch === '' ||
        item.nombre.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.rut.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.duplaACargo.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.diagnostico.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.tipologia.toLowerCase().includes(effectiveSearch.toLowerCase());

      const matchEstado =
        selectedEstado === 'TODOS' || item.estado.toLowerCase() === selectedEstado.toLowerCase();

      const matchDupla =
        selectedDupla === 'TODAS' || item.duplaACargo.includes(selectedDupla);

      return matchSearch && matchEstado && matchDupla;
    });
  }, [data, effectiveSearch, selectedEstado, selectedDupla]);

  const resetFilters = () => {
    setLocalSearch('');
    setSelectedEstado('TODOS');
    setSelectedDupla('TODAS');
  };

  const hasActiveFilters =
    localSearch !== '' ||
    searchQuery !== '' ||
    selectedEstado !== 'TODOS' ||
    selectedDupla !== 'TODAS';

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Export the currently filtered view; if no filters → export all
      const toExport = hasActiveFilters ? filteredData : data;
      exportPacientesToExcel(toExport, 'registro_clinico_pacientes');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenCreate = () => {
    setPatientToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (paciente: RegistroPaciente) => {
    setPatientToEdit(paciente);
    setIsFormModalOpen(true);
  };

  const handleSavedPatient = (saved: RegistroPaciente) => {
    setData((prev) => {
      const index = prev.findIndex((p) => (p.id && p.id === saved.id) || p.numero === saved.numero);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = saved;
        return updated;
      } else {
        return [...prev, saved];
      }
    });
    fetchPacientes();
  };

  return (
    <div className="bg-surface rounded-[var(--radius-md)] border border-border shadow-xs overflow-hidden space-y-4">
      {/* Header Bar & Quick Filters */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Active Filter Chips & Add Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Month pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)] bg-zinc-100 text-xs font-medium text-text border border-border">
            <span>Mes: Marzo 2026</span>
          </div>

          {/* Estado filter pill */}
          {selectedEstado !== 'TODOS' ? (
            <button
              onClick={() => setSelectedEstado('TODOS')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)] bg-primary/10 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
            >
              <span>Estado: {selectedEstado}</span>
              <span className="font-bold">×</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)] bg-zinc-100 text-xs font-medium text-text border border-border">
              <span>Todos los Estados</span>
            </div>
          )}

          {/* Dupla Selector */}
          <select
            value={selectedDupla}
            onChange={(e) => setSelectedDupla(e.target.value)}
            className="px-3 py-1.5 rounded-[var(--radius-full)] bg-zinc-100 text-xs font-medium text-text border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="TODAS">Todas las Duplas</option>
            <option value="Dupla 1">Dupla 1 (Ps. Tomás / T.O. Camila)</option>
            <option value="Dupla 2">Dupla 2 (Ps. Andrea / T.S. Marco)</option>
            <option value="Dupla 3">Dupla 3 (Ps. Diego / T.O. Carla)</option>
          </select>

          {/* Quick Estado dropdown */}
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="px-3 py-1.5 rounded-[var(--radius-full)] bg-zinc-100 text-xs font-medium text-text border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="TODOS">Estado (Todos)</option>
            <option value="Activo">Activo</option>
            <option value="En Seguimiento">En Seguimiento</option>
            <option value="En Espera">En Espera</option>
            <option value="Egresado">Egresado</option>
          </select>
        </div>

        {/* Search, Reset & Actions */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar en tabla..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-zinc-50 focus:bg-white text-xs pl-8 pr-3 py-1.5 rounded-[var(--radius-sm)] border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPacientes}
            className="text-xs text-text-muted hover:text-text"
            title="Recargar datos de Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs text-text-muted hover:text-text"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restablecer
          </Button>

          {/* Export to Excel Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            isLoading={isExporting}
            disabled={isExporting || data.length === 0}
            leftIcon={!isExporting ? <FileDown className="w-3.5 h-3.5" /> : undefined}
            title={hasActiveFilters
              ? `Exportar ${filteredData.length} registros filtrados a Excel`
              : `Exportar todos los ${data.length} registros a Excel`}
            className="text-xs border-primary/40 text-primary hover:bg-primary hover:text-white transition-all"
          >
            {hasActiveFilters
              ? `Excel (${filteredData.length})`
              : 'Exportar Excel'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Nuevo Paciente
          </Button>
        </div>
      </div>

      {/* Main Clinical Table with Horizontal Scroll */}
      <div className="overflow-x-auto relative min-h-[250px]">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
            <p className="text-xs text-text-muted">Cargando pacientes desde Supabase...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-border text-text-muted uppercase tracking-wider font-semibold text-[11px]">
                {/* Frozen Left Columns */}
                <th className="py-3 px-4 sticky left-0 bg-zinc-50 z-20 shadow-xs">Acciones</th>
                <th className="py-3 px-3 sticky left-20 bg-zinc-50 z-20">N°</th>
                <th className="py-3 px-4 sticky left-32 bg-zinc-50 z-20 border-r border-border">Nombre Paciente</th>
                
                {/* Remaining 33 Fields */}
                <th className="py-3 px-4">RUT</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-5">Dupla a Cargo</th>
                <th className="py-3 px-4">Fecha Derivación</th>
                <th className="py-3 px-4">Fecha Egreso</th>
                <th className="py-3 px-4">Fecha Máx. Contacto</th>
                <th className="py-3 px-4">Fecha Ingreso UEGO</th>
                <th className="py-3 px-6 min-w-[200px]">Observaciones Ingreso</th>
                <th className="py-3 px-3">Edad</th>
                <th className="py-3 px-3">EG</th>
                <th className="py-3 px-4">Tipología</th>
                <th className="py-3 px-6 min-w-[220px]">Diagnóstico</th>
                <th className="py-3 px-6 min-w-[200px]">Obs. Diagnóstico</th>
                <th className="py-3 px-4">Ingreso Fin Semana / UEGO</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-6 min-w-[180px]">Obs. Contacto</th>
                <th className="py-3 px-3 text-center">Migrante</th>
                <th className="py-3 px-4 text-center">Pueblo Originario</th>
                <th className="py-3 px-3 text-center">Entrega Recuerdo</th>
                <th className="py-3 px-3 text-center">Díptico Inf.</th>
                <th className="py-3 px-4 text-center">Acomp. Cerrada</th>
                <th className="py-3 px-4 text-center">Control Ambulatorio</th>
                <th className="py-3 px-4">Atención 1</th>
                <th className="py-3 px-4">Atención 2</th>
                <th className="py-3 px-4">Atención 3</th>
                <th className="py-3 px-4">Atención 4</th>
                <th className="py-3 px-4">Atención 5</th>
                <th className="py-3 px-4">Atención 6</th>
                <th className="py-3 px-4">Atención 7</th>
                <th className="py-3 px-4">Atención 8</th>
                <th className="py-3 px-4">Atención 9</th>
                <th className="py-3 px-4">Atención 10</th>
                <th className="py-3 px-4 text-center font-bold">Total Atenciones</th>
                <th className="py-3 px-6 min-w-[240px]">Obs. Atenciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={37} className="py-12 text-center text-text-muted text-sm">
                    No se encontraron pacientes que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredData.map((paciente) => (
                  <tr
                    key={paciente.id || paciente.numero}
                    className="hover:bg-zinc-50/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedPatient(paciente)}
                  >
                    {/* Action Column */}
                    <td className="py-3 px-4 sticky left-0 bg-surface group-hover:bg-zinc-50 z-10 shadow-xs flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(paciente);
                        }}
                        className="p-1.5 rounded-[var(--radius-xs)] bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                        title="Ver ficha completa"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(paciente);
                        }}
                        className="p-1.5 rounded-[var(--radius-xs)] bg-zinc-100 text-text-muted hover:bg-primary hover:text-white transition-colors"
                        title="Editar paciente"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* N° */}
                    <td className="py-3 px-3 font-semibold text-text-muted sticky left-20 bg-surface group-hover:bg-zinc-50 z-10">
                      #{paciente.numero}
                    </td>

                    {/* Nombre */}
                    <td className="py-3 px-4 font-bold text-text sticky left-32 bg-surface group-hover:bg-zinc-50 z-10 border-r border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[var(--radius-full)] bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold">
                          {paciente.nombre.charAt(0)}
                        </div>
                        <span className="truncate max-w-[180px]">{paciente.nombre}</span>
                      </div>
                    </td>

                    {/* RUT */}
                    <td className="py-3 px-4 font-mono font-medium text-text">
                      {paciente.rut}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4">
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
                    </td>

                    {/* Dupla a Cargo */}
                    <td className="py-3 px-5 font-medium text-text">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-[var(--radius-full)] bg-primary" />
                        {paciente.duplaACargo}
                      </span>
                    </td>

                    {/* Fechas */}
                    <td className="py-3 px-4">{paciente.fechaDerivacionDupla || '—'}</td>
                    <td className="py-3 px-4">{paciente.fechaEgreso || 'En curso'}</td>
                    <td className="py-3 px-4">{paciente.fechaMaximaContactoInicial || '—'}</td>
                    <td className="py-3 px-4">{paciente.fechaIngresoUego || '—'}</td>

                    {/* Observaciones Ingreso */}
                    <td className="py-3 px-6 text-text-muted max-w-[220px] truncate" title={paciente.observacionesIngreso}>
                      {paciente.observacionesIngreso || '—'}
                    </td>

                    {/* Edad & EG */}
                    <td className="py-3 px-3 font-semibold">{paciente.edad}</td>
                    <td className="py-3 px-3 text-text-muted">{paciente.eg}</td>

                    {/* Tipología */}
                    <td className="py-3 px-4 font-medium text-text">{paciente.tipologia}</td>

                    {/* Diagnóstico */}
                    <td className="py-3 px-6 font-semibold text-text max-w-[240px] truncate" title={paciente.diagnostico}>
                      {paciente.diagnostico}
                    </td>

                    {/* Obs Diagnóstico */}
                    <td className="py-3 px-6 text-text-muted max-w-[200px] truncate" title={paciente.observacionesDiagnostico}>
                      {paciente.observacionesDiagnostico || '—'}
                    </td>

                    {/* Ingreso Especial */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-[var(--radius-xs)] bg-zinc-100 text-text font-medium">
                        {paciente.ingresoHorarioEspecial}
                      </span>
                    </td>

                    {/* Teléfono */}
                    <td className="py-3 px-4 font-mono">{paciente.telefono}</td>

                    {/* Obs Contacto */}
                    <td className="py-3 px-6 text-text-muted max-w-[180px] truncate" title={paciente.observacionesContacto}>
                      {paciente.observacionesContacto || '—'}
                    </td>

                    {/* Migrante & Pueblo */}
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-[var(--radius-xs)] font-medium ${paciente.migrante === 'Sí' ? 'bg-warning/20 text-amber-900' : 'text-text-muted'}`}>
                        {paciente.migrante}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-[var(--radius-xs)] font-medium ${paciente.puebloOriginario !== 'No' ? 'bg-info/20 text-blue-900' : 'text-text-muted'}`}>
                        {paciente.puebloOriginario}
                      </span>
                    </td>

                    {/* Entregas */}
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-[var(--radius-xs)] font-semibold ${paciente.entregaRecuerdo === 'Sí' ? 'text-emerald-800 bg-success/20' : 'text-zinc-400'}`}>
                        {paciente.entregaRecuerdo}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-[var(--radius-xs)] font-semibold ${paciente.entregaDiptico === 'Sí' ? 'text-emerald-800 bg-success/20' : 'text-zinc-400'}`}>
                        {paciente.entregaDiptico}
                      </span>
                    </td>

                    {/* Acompañamiento & Control */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-[var(--radius-xs)] font-semibold ${paciente.acompanamientoAtencionCerrada === 'Sí' ? 'text-primary bg-primary/15' : 'text-zinc-400'}`}>
                        {paciente.acompanamientoAtencionCerrada}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-[var(--radius-xs)] font-semibold ${paciente.controlAmbulatorioPsicosocial === 'Sí' ? 'text-primary bg-primary/15' : 'text-zinc-400'}`}>
                        {paciente.controlAmbulatorioPsicosocial}
                      </span>
                    </td>

                    {/* Atenciones 1 a 10 */}
                    <td className="py-3 px-4 text-text-muted">{paciente.atencion1 || '—'}</td>
                    <td className="py-3 px-4 text-text-muted">{paciente.atencion2 || '—'}</td>
                    <td className="py-3 px-4 text-text-muted">{paciente.atencion3 || '—'}</td>
                    <td className="py-3 px-4 text-text-muted">{paciente.atencion4 || '—'}</td>
                    <td className="py-3 px-4 text-text-muted">{paciente.atencion5 || '—'}</td>
                    <td className="py-3 px-4 text-text-muted">{paciente.atencion6 || '—'}</td>
                    <td className="py-3 px-4 text-text-muted">{paciente.atencion7 || '—'}</td>
                    <td className="py-3 px-4 text-text-muted">{paciente.atencion8 || '—'}</td>
                    <td className="py-3 px-4 text-text-muted">{paciente.atencion9 || '—'}</td>
                    <td className="py-3 px-4 text-text-muted">{paciente.atencion10 || '—'}</td>

                    {/* Total Atenciones */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-sm bg-primary/15 text-primary px-2.5 py-0.5 rounded-[var(--radius-full)]">
                        {paciente.totalAtenciones}
                      </span>
                    </td>

                    {/* Obs Atenciones */}
                    <td className="py-3 px-6 text-text-muted max-w-[260px] truncate" title={paciente.observacionAtenciones}>
                      {paciente.observacionAtenciones || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Table Pagination & Row Summary Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-muted flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span>
            Mostrando{' '}
            <span className="font-semibold text-text">{filteredData.length}</span> de{' '}
            <span className="font-semibold text-text">{data.length}</span> registros clínicos
          </span>
          {hasActiveFilters && filteredData.length > 0 && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-xs)] bg-primary/10 text-primary font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
              title={`Descargar ${filteredData.length} registros filtrados como Excel`}
            >
              {isExporting
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <FileDown className="w-3 h-3" />}
              Descargar {filteredData.length} registros
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-[var(--radius-sm)] border border-border text-text-muted hover:bg-zinc-100 disabled:opacity-50" disabled>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-text">Página 1 de 1</span>
          <button className="p-1.5 rounded-[var(--radius-sm)] border border-border text-text-muted hover:bg-zinc-100 disabled:opacity-50" disabled>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Patient Detail Modal */}
      <PatientDetailModal
        paciente={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onEdit={handleOpenEdit}
      />

      {/* Patient Form Modal (Create / Edit) */}
      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSaved={handleSavedPatient}
        pacienteToEdit={patientToEdit}
      />
    </div>
  );
};
