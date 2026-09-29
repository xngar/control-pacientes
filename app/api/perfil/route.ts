import { NextRequest, NextResponse } from 'next/server';
import {
  getAnonClient,
  getServiceRoleClient,
  isMissingServerConfig,
  MISSING_SERVER_CONFIG_MESSAGE,
} from '@/lib/supabase/server';

export const runtime = 'nodejs';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UpdateBody {
  nombreCompleto?: string;
  email?: string;
  especialidad?: string;
  cargo?: string;
  currentPassword?: string;
}

interface ProfileRow {
  id: string;
  auth_id: string | null;
  email: string;
  nombre_completo: string;
  rut: string;
  rol: 'ADMIN' | 'PROFESIONAL';
  especialidad: string | null;
  cargo: string | null;
  activo: boolean;
}

type Guard =
  | { ok: true; authId: string }
  | { ok: false; response: NextResponse };

async function requireSelf(
  request: NextRequest,
  supabase: ReturnType<typeof getServiceRoleClient>
): Promise<Guard> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autenticado.' }, { status: 401 }),
    };
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Sesión inválida o vencida.' }, { status: 401 }),
    };
  }

  return { ok: true, authId: data.user.id };
}

export async function PATCH(request: NextRequest) {
  let supabase: ReturnType<typeof getServiceRoleClient>;
  try {
    supabase = getServiceRoleClient();
  } catch (error) {
    if (isMissingServerConfig(error)) {
      return NextResponse.json({ error: MISSING_SERVER_CONFIG_MESSAGE }, { status: 500 });
    }
    throw error;
  }

  const guard = await requireSelf(request, supabase);
  if (!guard.ok) return guard.response;

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido.' }, { status: 400 });
  }

  const nombreCompleto = (body.nombreCompleto ?? '').trim();
  const email = (body.email ?? '').trim().toLowerCase();
  const especialidad = (body.especialidad ?? '').trim() || null;
  const cargo = (body.cargo ?? '').trim() || null;

  if (!nombreCompleto) {
    return NextResponse.json({ error: 'El nombre completo es obligatorio.' }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'El correo electrónico no es válido.' }, { status: 400 });
  }

  const { data: current, error: readError } = await supabase
    .from('usuarios_clinicos')
    .select('*')
    .eq('auth_id', guard.authId)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }
  if (!current) {
    return NextResponse.json(
      { error: 'Tu cuenta no tiene un perfil clínico asociado. Contacta al Administrador.' },
      { status: 404 }
    );
  }

  const profile = current as ProfileRow;
  const previousEmail = profile.email;
  const emailChanges = email !== previousEmail.toLowerCase();

  if (emailChanges) {
    const password = body.currentPassword ?? '';
    if (!password) {
      return NextResponse.json(
        { error: 'Para cambiar tu correo debes confirmar tu contraseña actual.' },
        { status: 400 }
      );
    }

    const { error: passwordError } = await getAnonClient().auth.signInWithPassword({
      email: previousEmail,
      password,
    });

    if (passwordError) {
      return NextResponse.json(
        { error: 'La contraseña actual no es correcta.' },
        { status: 401 }
      );
    }
  }

  // El correo vive en dos sitios: en auth.users (identidad de login) y en
  // usuarios_clinicos (directorio). Se actualiza primero la identidad y, si la
  // tabla falla, se revierte para no dejar un correo desincronizado.
  if (emailChanges) {
    const { error: authError } = await supabase.auth.admin.updateUserById(guard.authId, {
      email,
      email_confirm: true,
    });

    if (authError) {
      const taken = /already been registered|already exists|duplicate/i.test(authError.message);
      return NextResponse.json(
        {
          error: taken
            ? 'Ese correo ya está en uso por otra cuenta.'
            : 'No fue posible actualizar tu correo de acceso.',
        },
        { status: taken ? 409 : 502 }
      );
    }
  }

  const updates: Record<string, unknown> = {
    nombre_completo: nombreCompleto,
    email,
    especialidad,
    cargo,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('usuarios_clinicos')
    .update(updates)
    .eq('id', profile.id)
    .select()
    .single();

  if (error) {
    if (emailChanges) {
      const { error: rollbackError } = await supabase.auth.admin.updateUserById(guard.authId, {
        email: previousEmail,
        email_confirm: true,
      });
      if (rollbackError) {
        console.error('No se pudo revertir el correo en auth.users:', rollbackError.message);
      }
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, emailChanged: emailChanges });
}
