import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Cliente con permisos de service_role. Solo debe usarse dentro de Route Handlers
 * o Server Actions: nunca se importa desde un componente de cliente.
 */
export function getServiceRoleClient(): SupabaseClient {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * El login y las lecturas funcionan sin service_role, asi que cuando esta
 * variable falta en el despliegue solo fallan las escrituras. Sin esto el
 * error real se pierde dentro de un 500 generico.
 */
export function isMissingServerConfig(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith('Faltan NEXT_PUBLIC_SUPABASE_URL');
}

export const MISSING_SERVER_CONFIG_MESSAGE =
  'El servidor no tiene configurada la credencial SUPABASE_SERVICE_ROLE_KEY. ' +
  'Sin ella no se pueden guardar usuarios ni perfiles. Revisa las variables de entorno del despliegue.';

/**
 * Cliente con la clave anonima, usado unicamente para comprobar una contraseña
 * mediante signInWithPassword. El cliente de service_role no sirve para eso:
 * sus peticiones se autentican como el propio rol de servicio.
 */
export function getAnonClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno del servidor.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
