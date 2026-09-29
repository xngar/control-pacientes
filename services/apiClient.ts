import { supabase } from '@/lib/supabase/client';

export interface ApiResult<T> {
  data?: T;
  error?: string;
}

interface ServerError {
  error?: string;
}

/**
 * Los Route Handlers de escritura validan el token contra Supabase con el
 * service role. Si el access token esta vencido esas rutas responden 401 aunque
 * el resto de la app siga funcionando, porque las lecturasyon las resuelve RLS
 * con la renovacion automatica de la sesion. Sin reintentar la renovacion el
 * usuario ve un error sin causa aparente teniendo una sesion perfectamente valida.
 */
async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const current = data.session?.access_token;
  if (current) return current;

  const { data: refreshed } = await supabase.auth.refreshSession();
  return refreshed.session?.access_token ?? null;
}

export async function callAuthenticatedApi<TResponse, TBody extends object>(
  endpoint: string,
  method: 'POST' | 'PATCH',
  body: TBody
): Promise<ApiResult<TResponse>> {
  const token = await accessToken();
  if (!token) return { error: 'Tu sesion expiro. Vuelve a iniciar sesion.' };

  const send = (bearer: string) =>
    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
      body: JSON.stringify(body),
    });

  try {
    let response = await send(token);

    if (response.status === 401) {
      const { data } = await supabase.auth.refreshSession();
      const renewed = data.session?.access_token;
      if (renewed) response = await send(renewed);
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const detail = (payload as ServerError | null)?.error;
      return { error: detail ?? `El servidor respondio ${response.status} sin detalle.` };
    }

    return { data: (payload ?? null) as TResponse | undefined };
  } catch {
    return { error: 'No pudimos comunicarnos con el servidor. Intentalo nuevamente.' };
  }
}
