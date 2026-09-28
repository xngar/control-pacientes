export type UserRole = 'ADMIN' | 'PROFESIONAL';

export interface UserProfile {
  id: string;
  email: string;
  nombreCompleto: string;
  rut: string;
  rol: UserRole;
  especialidad?: string;
  cargo?: string;
  avatarUrl?: string;
  activo: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
