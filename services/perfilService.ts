import { supabase } from '@/lib/supabase/client';
import { UserProfile } from '@/types/auth';

export interface ActualizarPerfilPayload {
  nombreCompleto: string;
  email: string;
  especialidad?: string;
  cargo?: string;
  currentPassword?: string;
}

export interface ResultadoPerfil {
  profile?: UserProfile;
  emailChanged?: boolean;
  error?: string;
}

interface ClinicalUserRow {
  id: string;
  auth_id: string | null;
  email: string;
  nombre_completo: string;
  rut: string;
  rol: UserProfile['rol'];
  especialidad: string | null;
  cargo: string | null;
  activo: boolean;
}

const toProfile = (row: ClinicalUserRow): UserProfile => ({
  id: row.id,
  authId: row.auth_id,
  email: row.email,
  nombreCompleto: row.nombre_completo,
  rut: row.rut,
  rol: row.rol,
  especialidad: row.especialidad,
  cargo: row.cargo,
  activo: row.activo,
});

export const perfilService = {
  async update(payload: ActualizarPerfilPayload): Promise<ResultadoPerfil> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      return { error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
    }

    try {
      const response = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        return { error: result?.error || 'No fue posible guardar tu perfil.' };
      }

      if (!result?.data) {
        return { error: 'La respuesta del servidor no incluyó el perfil actualizado.' };
      }

      return { profile: toProfile(result.data), emailChanged: Boolean(result.emailChanged) };
    } catch {
      return { error: 'No pudimos comunicarnos con el servidor. Inténtalo nuevamente.' };
    }
  },
};
