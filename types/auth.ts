export type UserRole = 'ADMIN' | 'PROFESIONAL';

export interface UserProfile {
  id: string;
  authId?: string | null;
  email: string;
  nombreCompleto: string;
  rut: string;
  rol: UserRole;
  especialidad?: string | null;
  cargo?: string | null;
  avatarUrl?: string;
  activo: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
