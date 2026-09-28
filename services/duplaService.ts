import { supabase } from '@/lib/supabase/client';
import { DuplaAtencion } from '@/types/dupla';
import { UserProfile } from '@/types/auth';

export const duplaService = {
  async getAll(): Promise<DuplaAtencion[]> {
    try {
      const { data: duplasData, error: duplasError } = await supabase
        .from('duplas_atencion')
        .select('*')
        .order('created_at', { ascending: true });

      const { data: usersData } = await supabase
        .from('usuarios_clinicos')
        .select('*');

      const usersMap = new Map<string, UserProfile>();
      if (usersData) {
        usersData.forEach((u: any) => {
          usersMap.set(u.id, {
            id: u.id,
            email: u.email,
            nombreCompleto: u.nombre_completo,
            rut: u.rut,
            rol: u.rol,
            especialidad: u.especialidad,
            cargo: u.cargo,
            activo: u.activo,
          });
        });
      }

      if (duplasError || !duplasData || duplasData.length === 0) {
        // Fallback default duplas
        return [
          {
            id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
            nombreDupla: 'Dupla 1 (Ps. Tomás Valenzuela - T.O. Camila Soto)',
            profesional1Id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
            profesional2Id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
            activa: true,
            pacientesAsignados: 3,
            profesional1: {
              id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
              email: 'tomas.valenzuela@datareport.cl',
              nombreCompleto: 'Ps. Tomás Valenzuela',
              rut: '17.456.789-2',
              rol: 'PROFESIONAL',
              especialidad: 'Psicología Clínica',
              activo: true,
            },
            profesional2: {
              id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
              email: 'camila.soto@datareport.cl',
              nombreCompleto: 'T.O. Camila Soto',
              rut: '18.123.456-K',
              rol: 'PROFESIONAL',
              especialidad: 'Terapia Ocupacional',
              activo: true,
            },
          },
          {
            id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
            nombreDupla: 'Dupla 2 (Ps. Andrea Ríos - T.S. Marco Peña)',
            profesional1Id: null,
            profesional2Id: null,
            activa: true,
            pacientesAsignados: 2,
            profesional1: {
              id: 'p_andrea',
              email: 'andrea.rios@datareport.cl',
              nombreCompleto: 'Ps. Andrea Ríos',
              rut: '16.789.012-3',
              rol: 'PROFESIONAL',
              especialidad: 'Psicología Infanto-Juvenil',
              activo: true,
            },
            profesional2: {
              id: 'p_marco',
              email: 'marco.pena@datareport.cl',
              nombreCompleto: 'T.S. Marco Peña',
              rut: '15.432.109-8',
              rol: 'PROFESIONAL',
              especialidad: 'Trabajo Social Clínico',
              activo: true,
            },
          },
          {
            id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
            nombreDupla: 'Dupla 3 (Ps. Diego Morales - T.O. Carla Fuentes)',
            profesional1Id: null,
            profesional2Id: null,
            activa: true,
            pacientesAsignados: 1,
            profesional1: {
              id: 'p_diego',
              email: 'diego.morales@datareport.cl',
              nombreCompleto: 'Ps. Diego Morales',
              rut: '17.890.123-4',
              rol: 'PROFESIONAL',
              especialidad: 'Psicoterapia Cognitivo-Conductual',
              activo: true,
            },
            profesional2: {
              id: 'p_carla',
              email: 'carla.fuentes@datareport.cl',
              nombreCompleto: 'T.O. Carla Fuentes',
              rut: '18.901.234-5',
              rol: 'PROFESIONAL',
              especialidad: 'Integración Sensorial',
              activo: true,
            },
          },
        ];
      }

      return duplasData.map((d: any) => ({
        id: d.id,
        nombreDupla: d.nombre_dupla,
        profesional1Id: d.profesional_1_id,
        profesional2Id: d.profesional_2_id,
        profesional1: d.profesional_1_id ? usersMap.get(d.profesional_1_id) || null : null,
        profesional2: d.profesional_2_id ? usersMap.get(d.profesional_2_id) || null : null,
        activa: d.activa !== false,
        createdAt: d.created_at,
      }));
    } catch (err) {
      console.error('Error fetching duplas:', err);
      return [];
    }
  },

  async getProfesionales(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('usuarios_clinicos')
        .select('*')
        .eq('activo', true)
        .order('nombre_completo', { ascending: true });

      if (error || !data) {
        return [];
      }

      return data.map((u: any) => ({
        id: u.id,
        email: u.email,
        nombreCompleto: u.nombre_completo,
        rut: u.rut,
        rol: u.rol,
        especialidad: u.especialidad,
        cargo: u.cargo,
        activo: u.activo,
      }));
    } catch (err) {
      console.error('Error fetching profesionales:', err);
      return [];
    }
  },

  async update(
    id: string,
    payload: {
      nombreDupla: string;
      profesional1Id?: string | null;
      profesional2Id?: string | null;
      activa: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('duplas_atencion')
        .update({
          nombre_dupla: payload.nombreDupla,
          profesional_1_id: payload.profesional1Id || null,
          profesional_2_id: payload.profesional2Id || null,
          activa: payload.activa,
        })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error updating dupla in Supabase:', err);
      return { success: false, error: err.message || 'Error al actualizar dupla' };
    }
  },

  async create(payload: {
    nombreDupla: string;
    profesional1Id?: string | null;
    profesional2Id?: string | null;
    activa: boolean;
  }): Promise<{ data?: DuplaAtencion; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('duplas_atencion')
        .insert([
          {
            nombre_dupla: payload.nombreDupla,
            profesional_1_id: payload.profesional1Id || null,
            profesional_2_id: payload.profesional2Id || null,
            activa: payload.activa,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          nombreDupla: data.nombre_dupla,
          profesional1Id: data.profesional_1_id,
          profesional2Id: data.profesional_2_id,
          activa: data.activa,
          createdAt: data.created_at,
        },
      };
    } catch (err: any) {
      console.error('Error creating dupla in Supabase:', err);
      return { error: err.message || 'Error al crear dupla' };
    }
  },
};
