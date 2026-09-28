import { UserProfile } from './auth';

export interface DuplaAtencion {
  id: string;
  nombreDupla: string;
  profesional1Id?: string | null;
  profesional2Id?: string | null;
  profesional1?: UserProfile | null;
  profesional2?: UserProfile | null;
  activa: boolean;
  pacientesAsignados?: number;
  createdAt?: string;
}
