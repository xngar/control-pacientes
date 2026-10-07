import { supabase } from '@/lib/supabase/client';
import { RegistroPaciente } from '@/types/paciente';
import { MOCK_PACIENTES } from '@/lib/mock-data/pacientes';

export interface PacientesResult {
  data: RegistroPaciente[];
  /** 'demo' = datos de ejemplo en memoria, no registros clinicos reales. */
  source: 'database' | 'demo';
  error?: string;
}

/** Ordena por numero descendente: el más reciente (mayor) queda primero. */
const ordenarMasRecientes = (rows: RegistroPaciente[]): RegistroPaciente[] =>
  [...rows].sort((a, b) => b.numero - a.numero);

export const pacienteService = {
  async getAll(): Promise<PacientesResult> {
    try {
      const { data, error } = await supabase
        .from('pacientes_seguimiento')
        .select('*')
        .order('numero', { ascending: false });

      if (error) {
        console.warn('Supabase query error, using local demo data fallback:', error);
        return { data: ordenarMasRecientes(MOCK_PACIENTES), source: 'demo', error: error.message };
      }

      if (!data) {
        return { data: [], source: 'database' };
      }

      return {
        source: 'database',
        data: ordenarMasRecientes(
          data.map((row: any) => ({
        id: row.id,
        numero: row.numero,
        duplaACargo: row.dupla_a_cargo || 'Sin dupla asignada',
        duplaId: row.dupla_id,
        estado: row.estado || 'Activo',
        fechaDerivacionDupla: row.fecha_derivacion_dupla || '',
        fechaEgreso: row.fecha_egreso || '',
        fechaMaximaContactoInicial: row.fecha_maxima_contacto_inicial || '',
        fechaIngresoUego: row.fecha_ingreso_uego || '',
        observacionesIngreso: row.observaciones_ingreso || '',
        nombre: row.nombre || '',
        rut: row.rut || '',
        edad: row.edad || 0,
        eg: row.eg || 'N/A',
        tipologia: row.tipologia || '',
        diagnostico: row.diagnostico || '',
        observacionesDiagnostico: row.observaciones_diagnostico || '',
        ingresoHorarioEspecial: row.ingreso_horario_especial || 'No',
        telefono: row.telefono || '',
        observacionesContacto: row.observaciones_contacto || '',
        migrante: row.migrante || 'No',
        puebloOriginario: row.pueblo_originario || 'No',
        entregaRecuerdo: row.entrega_recuerdo || 'No',
        entregaDiptico: row.entrega_diptico || 'No',
        acompanamientoAtencionCerrada: row.acompanamiento_atencion_cerrada || 'No',
        controlAmbulatorioPsicosocial: row.control_ambulatorio_psicosocial || 'No',
        atencion1: row.atencion_1 || '',
        atencion2: row.atencion_2 || '',
        atencion3: row.atencion_3 || '',
        atencion4: row.atencion_4 || '',
        atencion5: row.atencion_5 || '',
        atencion6: row.atencion_6 || '',
        atencion7: row.atencion_7 || '',
        atencion8: row.atencion_8 || '',
        atencion9: row.atencion_9 || '',
        atencion10: row.atencion_10 || '',
        totalAtenciones: row.total_atenciones || 0,
        observacionAtenciones: row.observacion_atenciones || '',
      })),
        ),
      };
    } catch (err) {
      console.error('Error fetching patients from Supabase:', err);
      return {
        data: ordenarMasRecientes(MOCK_PACIENTES),
        source: 'demo',
        error: err instanceof Error ? err.message : 'No fue posible conectar con la base de datos.',
      };
    }
  },

  async create(paciente: Omit<RegistroPaciente, 'id' | 'numero'>): Promise<{ data?: RegistroPaciente; error?: string }> {
    try {
      const payload = {
        dupla_a_cargo: paciente.duplaACargo,
        dupla_id: paciente.duplaId || null,
        estado: paciente.estado,
        fecha_derivacion_dupla: paciente.fechaDerivacionDupla || null,
        fecha_egreso: paciente.fechaEgreso || null,
        fecha_maxima_contacto_inicial: paciente.fechaMaximaContactoInicial || null,
        fecha_ingreso_uego: paciente.fechaIngresoUego || null,
        observaciones_ingreso: paciente.observacionesIngreso,
        nombre: paciente.nombre,
        rut: paciente.rut,
        edad: paciente.edad,
        eg: paciente.eg,
        tipologia: paciente.tipologia,
        diagnostico: paciente.diagnostico,
        observaciones_diagnostico: paciente.observacionesDiagnostico,
        ingreso_horario_especial: paciente.ingresoHorarioEspecial,
        telefono: paciente.telefono,
        observaciones_contacto: paciente.observacionesContacto,
        migrante: paciente.migrante,
        pueblo_originario: paciente.puebloOriginario,
        entrega_recuerdo: paciente.entregaRecuerdo,
        entrega_diptico: paciente.entregaDiptico,
        acompanamiento_atencion_cerrada: paciente.acompanamientoAtencionCerrada,
        control_ambulatorio_psicosocial: paciente.controlAmbulatorioPsicosocial,
        atencion_1: paciente.atencion1,
        atencion_2: paciente.atencion2,
        atencion_3: paciente.atencion3,
        atencion_4: paciente.atencion4,
        atencion_5: paciente.atencion5,
        atencion_6: paciente.atencion6,
        atencion_7: paciente.atencion7,
        atencion_8: paciente.atencion8,
        atencion_9: paciente.atencion9,
        atencion_10: paciente.atencion10,
        total_atenciones: paciente.totalAtenciones,
        observacion_atenciones: paciente.observacionAtenciones,
      };

      const { data, error } = await supabase
        .from('pacientes_seguimiento')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          ...paciente,
          id: data.id,
          numero: data.numero,
        },
      };
    } catch (err: any) {
      console.error('Error creating patient in Supabase:', err);
      return { error: err.message || 'Error al guardar paciente en Supabase' };
    }
  },

  /**
   * Borra la ficha. Se exige .select() porque RLS no lanza error cuando bloquea
   * una escritura: simplemente no devuelve filas. Sin comprobar eso, un borrado
   * prohibido por permisos se reportaria como exitoso.
   */
  async remove(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('pacientes_seguimiento')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'No se pudo eliminar la ficha. Revisa tus permisos e inténtalo nuevamente.',
        };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar paciente';
      console.error('Error deleting patient in Supabase:', err);
      return { success: false, error: message };
    }
  },

  async update(id: string, paciente: Partial<RegistroPaciente>): Promise<{ success: boolean; error?: string }> {
    try {
      const payload: any = {
        updated_at: new Date().toISOString(),
      };

      if (paciente.duplaACargo !== undefined) payload.dupla_a_cargo = paciente.duplaACargo;
      if (paciente.estado !== undefined) payload.estado = paciente.estado;
      if (paciente.fechaDerivacionDupla !== undefined) payload.fecha_derivacion_dupla = paciente.fechaDerivacionDupla || null;
      if (paciente.fechaEgreso !== undefined) payload.fecha_egreso = paciente.fechaEgreso || null;
      if (paciente.fechaMaximaContactoInicial !== undefined) payload.fecha_maxima_contacto_inicial = paciente.fechaMaximaContactoInicial || null;
      if (paciente.fechaIngresoUego !== undefined) payload.fecha_ingreso_uego = paciente.fechaIngresoUego || null;
      if (paciente.observacionesIngreso !== undefined) payload.observaciones_ingreso = paciente.observacionesIngreso;
      if (paciente.nombre !== undefined) payload.nombre = paciente.nombre;
      if (paciente.rut !== undefined) payload.rut = paciente.rut;
      if (paciente.edad !== undefined) payload.edad = paciente.edad;
      if (paciente.eg !== undefined) payload.eg = paciente.eg;
      if (paciente.tipologia !== undefined) payload.tipologia = paciente.tipologia;
      if (paciente.diagnostico !== undefined) payload.diagnostico = paciente.diagnostico;
      if (paciente.observacionesDiagnostico !== undefined) payload.observaciones_diagnostico = paciente.observacionesDiagnostico;
      if (paciente.ingresoHorarioEspecial !== undefined) payload.ingreso_horario_especial = paciente.ingresoHorarioEspecial;
      if (paciente.telefono !== undefined) payload.telefono = paciente.telefono;
      if (paciente.observacionesContacto !== undefined) payload.observaciones_contacto = paciente.observacionesContacto;
      if (paciente.migrante !== undefined) payload.migrante = paciente.migrante;
      if (paciente.puebloOriginario !== undefined) payload.pueblo_originario = paciente.puebloOriginario;
      if (paciente.entregaRecuerdo !== undefined) payload.entrega_recuerdo = paciente.entregaRecuerdo;
      if (paciente.entregaDiptico !== undefined) payload.entrega_diptico = paciente.entregaDiptico;
      if (paciente.acompanamientoAtencionCerrada !== undefined) payload.acompanamiento_atencion_cerrada = paciente.acompanamientoAtencionCerrada;
      if (paciente.controlAmbulatorioPsicosocial !== undefined) payload.control_ambulatorio_psicosocial = paciente.controlAmbulatorioPsicosocial;
      if (paciente.atencion1 !== undefined) payload.atencion_1 = paciente.atencion1;
      if (paciente.atencion2 !== undefined) payload.atencion_2 = paciente.atencion2;
      if (paciente.atencion3 !== undefined) payload.atencion_3 = paciente.atencion3;
      if (paciente.atencion4 !== undefined) payload.atencion_4 = paciente.atencion4;
      if (paciente.atencion5 !== undefined) payload.atencion_5 = paciente.atencion5;
      if (paciente.atencion6 !== undefined) payload.atencion_6 = paciente.atencion6;
      if (paciente.atencion7 !== undefined) payload.atencion_7 = paciente.atencion7;
      if (paciente.atencion8 !== undefined) payload.atencion_8 = paciente.atencion8;
      if (paciente.atencion9 !== undefined) payload.atencion_9 = paciente.atencion9;
      if (paciente.atencion10 !== undefined) payload.atencion_10 = paciente.atencion10;
      if (paciente.totalAtenciones !== undefined) payload.total_atenciones = paciente.totalAtenciones;
      if (paciente.observacionAtenciones !== undefined) payload.observacion_atenciones = paciente.observacionAtenciones;

      const { error } = await supabase
        .from('pacientes_seguimiento')
        .update(payload)
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      console.error('Error updating patient in Supabase:', err);
      return { success: false, error: err.message || 'Error al actualizar paciente' };
    }
  },
};
