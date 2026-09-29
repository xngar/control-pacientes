import { callAuthenticatedApi } from '@/services/apiClient';
import { supabase } from '@/lib/supabase/client';
import { UserProfile, UserRole } from '@/types/auth';

export interface NuevoUsuarioPayload {
  email: string;
  nombreCompleto: string;
  rut: string;
  rol: UserRole;
  especialidad?: string;
  cargo?: string;
  password: string;
}

export interface UsuarioGestionado extends UserProfile {
  tieneCuenta: boolean;
  createdAt?: string;
}

export type Resultado<T> = { data?: T; error?: string };

interface ClinicalUserRow {
  id: string;
  auth_id: string | null;
  email: string;
  nombre_completo: string;
  rut: string;
  rol: UserRole;
  especialidad: string | null;
  cargo: string | null;
  activo: boolean;
  created_at?: string;
}

const toUsuario = (row: ClinicalUserRow): UsuarioGestionado => ({
  id: row.id,
  authId: row.auth_id,
  email: row.email,
  nombreCompleto: row.nombre_completo,
  rut: row.rut,
  rol: row.rol,
  especialidad: row.especialidad,
  cargo: row.cargo,
  activo: row.activo,
  tieneCuenta: Boolean(row.auth_id),
  createdAt: row.created_at,
});

interface UsuarioResponse {
  data: ClinicalUserRow;
}

async function callAdminApi<T extends object>(
  method: 'POST' | 'PATCH',
  body: T
): Promise<Resultado<UsuarioGestionado>> {
  const { data, error } = await callAuthenticatedApi<UsuarioResponse, T>('/api/admin/usuarios', method, body);

  if (error) return { error };
  if (!data?.data) return { error: 'La respuesta del servidor no incluyó el usuario.' };

  return { data: toUsuario(data.data) };
}

export const usuarioService = {
  async list(): Promise<UsuarioGestionado[]> {
    const { data, error } = await supabase
      .from('usuarios_clinicos')
      .select('*')
      .order('nombre_completo', { ascending: true });

    if (error) {
      console.error('Error al listar usuarios clínicos:', error);
      return [];
    }

    return (data ?? []).map(toUsuario);
  },

  create(payload: NuevoUsuarioPayload): Promise<Resultado<UsuarioGestionado>> {
    return callAdminApi('POST', payload);
  },

  setActivo(id: string, activo: boolean): Promise<Resultado<UsuarioGestionado>> {
    return callAdminApi('PATCH', { id, activo });
  },

  resetPassword(id: string, password: string): Promise<Resultado<UsuarioGestionado>> {
    return callAdminApi('PATCH', { id, password });
  },
};
