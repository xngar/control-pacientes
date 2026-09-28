import { UserProfile } from '@/types/auth';

export const DEMO_USERS: (UserProfile & { password: string })[] = [
  {
    id: 'usr_admin_01',
    email: 'admin@datareport.cl',
    password: 'password123',
    nombreCompleto: 'Dra. Marcela Morales',
    rut: '14.238.901-4',
    rol: 'ADMIN',
    cargo: 'Dirección Clínica & Administración',
    activo: true,
  },
  {
    id: 'usr_pro_01',
    email: 'tomas.valenzuela@datareport.cl',
    password: 'password123',
    nombreCompleto: 'Ps. Tomás Valenzuela',
    rut: '17.456.789-2',
    rol: 'PROFESIONAL',
    especialidad: 'Psicología Clínica Infanto-Juvenil',
    activo: true,
  },
  {
    id: 'usr_pro_02',
    email: 'camila.soto@datareport.cl',
    password: 'password123',
    nombreCompleto: 'T.O. Camila Soto',
    rut: '18.123.456-K',
    rol: 'PROFESIONAL',
    especialidad: 'Terapia Ocupacional & Neurodesarrollo',
    activo: true,
  },
];
