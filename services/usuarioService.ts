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

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function callAdminApi<T extends object>(
  method: 'POST' | 'PATCH',
  body: T
): Promise<Resultado<UsuarioGestionado>> {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    return { error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  try {
    const response = await fetch('/api/admin/usuarios', {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { error: payload?.error || 'No fue posible completar la operación.' };
    }

    return { data: toUsuario(payload.data) };
  } catch {
    return { error: 'No pudimos comunicarnos con el servidor. Inténtalo nuevamente.' };
  }
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
