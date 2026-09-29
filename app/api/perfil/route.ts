import { NextRequest, NextResponse } from 'next/server';
import {
  getAnonClient,
  getServiceRoleClient,
  isMissingServerConfig,
  MISSING_SERVER_CONFIG_MESSAGE,
} from '@/lib/supabase/server';
import { esRutValido, formatearRut, normalizarRut } from '@/lib/utils/rut';

export const runtime = 'nodejs';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface UpdateBody {
  nombreCompleto?: string;
  email?: string;
  especialidad?: string;
  cargo?: string;
  rut?: string;
  currentPassword?: string;
  newPassword?: string;
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
  const rutSolicitado = formatearRut(body.rut ?? '');

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
  // El RUT solo se revalida cuando el usuario lo cambia: varios perfiles ya
  // guardados en la base arrastran un digito verificador erroneo de origen, y
  // revalidarlos dejaria al profesional sin poder guardar nada en su perfil.
  const rutChanges = normalizarRut(rutSolicitado) !== normalizarRut(formatearRut(profile.rut));

  if (rutChanges) {
    if (!normalizarRut(rutSolicitado)) {
      return NextResponse.json({ error: 'El RUT es obligatorio.' }, { status: 400 });
    }
    if (!esRutValido(rutSolicitado)) {
      return NextResponse.json(
        { error: 'El RUT no es válido. Revisa el número y su dígito verificador.' },
        { status: 400 }
      );
    }
  }

  // El RUT identifica al profesional en la historia clínica, asi que no puede
  // quedar repetido: dos profesionales con el mismo RUT fusionarian sus fichas.
  if (rutChanges) {
    const { data: taken, error: takenError } = await supabase
      .from('usuarios_clinicos')
      .select('id')
      .eq('rut', rutSolicitado)
      .neq('id', profile.id)
      .maybeSingle();

    if (takenError) {
      return NextResponse.json({ error: takenError.message }, { status: 500 });
    }
    if (taken) {
      return NextResponse.json(
        { error: 'Ese RUT ya está registrado en otro profesional.' },
        { status: 409 }
      );
    }
  }

  const newPassword = body.newPassword ?? '';
  const passwordChanges = newPassword.length > 0;

  if (passwordChanges && newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` },
      { status: 400 }
    );
  }

  if (passwordChanges && newPassword === body.currentPassword) {
    return NextResponse.json(
      { error: 'La nueva contraseña debe ser distinta de la actual.' },
      { status: 400 }
    );
  }

  // Cualquier cambio sensible (correo o contraseña) exige probar la contraseña
  // actual: sin ese paso un token robado basta para reescribir la identidad.
  if (emailChanges || passwordChanges) {
    const password = body.currentPassword ?? '';
    if (!password) {
      return NextResponse.json(
        {
          error: emailChanges
            ? 'Para cambiar tu correo debes confirmar tu contraseña actual.'
            : 'Para cambiar tu contraseña debes confirmar la actual.',
        },
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

  // El correo y la contraseña viven en auth.users, no en usuarios_clinicos. Se
  // actualiza la identidad primero y, si la tabla falla, se revierte para no
  // dejar el login desincronizado del directorio clínico.
  if (emailChanges || passwordChanges) {
    const { error: authError } = await supabase.auth.admin.updateUserById(guard.authId, {
      ...(emailChanges ? { email, email_confirm: true } : {}),
      ...(passwordChanges ? { password: newPassword } : {}),
    });

    if (authError) {
      const taken = /already been registered|already exists|duplicate/i.test(authError.message);
      return NextResponse.json(
        {
          error: taken
            ? 'Ese correo ya está en uso por otra cuenta.'
            : emailChanges
              ? 'No fue posible actualizar tu correo de acceso.'
              : 'No fue posible actualizar tu contraseña.',
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

  // Solo se escribe el RUT si cambio, para no reformatear en cada guardado los
  // perfiles antiguos que guardan el numero sin puntos ni guion.
  if (rutChanges) {
    updates.rut = rutSolicitado;
  }

  const { data, error } = await supabase
    .from('usuarios_clinicos')
    .update(updates)
    .eq('id', profile.id)
    .select()
    .single();

  if (error) {
    // La escritura del directorio fallo, pero la identidad ya cambio. Sin esta
    // reversa el usuario entraria con una clave que el directorio no conoce.
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

  return NextResponse.json({
    data,
    emailChanged: emailChanges,
    passwordChanged: passwordChanges,
  });
}
