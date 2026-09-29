import { callAuthenticatedApi } from '@/services/apiClient';
import { UserProfile } from '@/types/auth';

export interface ActualizarPerfilPayload {
  nombreCompleto: string;
  email: string;
  especialidad?: string;
  cargo?: string;
  rut?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ResultadoPerfil {
  profile?: UserProfile;
  emailChanged?: boolean;
  passwordChanged?: boolean;
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

interface PerfilResponse {
  data: ClinicalUserRow;
  emailChanged?: boolean;
  passwordChanged?: boolean;
}

export const perfilService = {
  async update(payload: ActualizarPerfilPayload): Promise<ResultadoPerfil> {
    const { data, error } = await callAuthenticatedApi<PerfilResponse, ActualizarPerfilPayload>(
      '/api/perfil',
      'PATCH',
      payload
    );

    if (error) return { error };
    if (!data?.data) return { error: 'La respuesta del servidor no incluyó el perfil actualizado.' };

    return {
      profile: toProfile(data.data),
      emailChanged: Boolean(data.emailChanged),
      passwordChanged: Boolean(data.passwordChanged),
    };
  },
};
