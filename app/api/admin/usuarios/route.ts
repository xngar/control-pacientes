import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['ADMIN', 'PROFESIONAL'] as const;
type Rol = (typeof ROLES)[number];

interface CreateBody {
  email: string;
  nombreCompleto: string;
  rut: string;
  rol: Rol;
  especialidad?: string;
  cargo?: string;
  password: string;
}

interface UpdateBody {
  id: string;
  activo?: boolean;
  rol?: Rol;
  password?: string;
}

type Guard =
  | { ok: true; adminId: string }
  | { ok: false; response: NextResponse };

/** Valida que quien llama tenga una sesión activa con rol ADMIN. */
async function requireAdmin(request: NextRequest): Promise<Guard> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autenticado.' }, { status: 401 }),
    };
  }

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Sesión inválida o vencida.' }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from('usuarios_clinicos')
    .select('rol, activo')
    .eq('auth_id', data.user.id)
    .maybeSingle();

  if (!profile || profile.rol !== 'ADMIN' || !profile.activo) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Sólo un Administrador puede gestionar usuarios.' },
        { status: 403 }
      ),
    };
  }

  return { ok: true, adminId: data.user.id };
}

async function findAuthUserByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<User | null> {
  const perPage = 100;
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);

    const found = data.users.find((u) => (u.email ?? '').toLowerCase() === email);
    if (found) return found;
    if (data.users.length < perPage) return null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido.' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const nombreCompleto = (body.nombreCompleto ?? '').trim();
  const rut = (body.rut ?? '').trim();
  const password = body.password ?? '';
  const rol = body.rol;
  const especialidad = (body.especialidad ?? '').trim() || null;
  const cargo = (body.cargo ?? '').trim() || null;

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'El correo electrónico no es válido.' }, { status: 400 });
  }
  if (!nombreCompleto) {
    return NextResponse.json({ error: 'El nombre completo es obligatorio.' }, { status: 400 });
  }
  if (!rut) {
    return NextResponse.json({ error: 'El RUT es obligatorio.' }, { status: 400 });
  }
  if (!ROLES.includes(rol)) {
    return NextResponse.json({ error: 'El rol debe ser ADMIN o PROFESIONAL.' }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` },
      { status: 400 }
    );
  }

  const supabase = getServiceRoleClient();

  try {
    const existingAuthUser = await findAuthUserByEmail(supabase, email);

    const authUser = existingAuthUser
      ? (
          await supabase.auth.admin.updateUserById(existingAuthUser.id, {
            password,
            email_confirm: true,
          })
        ).data.user
      : (
          await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { nombre_completo: nombreCompleto },
          })
        ).data.user;

    if (!authUser) throw new Error('Supabase Auth no devolvió el usuario creado.');

    const { data: existingProfile } = await supabase
      .from('usuarios_clinicos')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    const profilePayload = {
      email,
      nombre_completo: nombreCompleto,
      rut,
      rol,
      especialidad,
      cargo,
      activo: true,
      auth_id: authUser.id,
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error: profileError } = existingProfile
      ? await supabase
          .from('usuarios_clinicos')
          .update(profilePayload)
          .eq('id', existingProfile.id)
          .select()
          .single()
      : await supabase.from('usuarios_clinicos').insert(profilePayload).select().single();

    if (profileError) throw new Error(profileError.message);

    return NextResponse.json({
      data: profile,
      reutilizaCuenta: Boolean(existingAuthUser),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido.' }, { status: 400 });
  }

  const { id, activo, rol, password } = body;

  if (!id) {
    return NextResponse.json({ error: 'Falta el identificador del usuario.' }, { status: 400 });
  }
  if (rol !== undefined && !ROLES.includes(rol)) {
    return NextResponse.json({ error: 'El rol debe ser ADMIN o PROFESIONAL.' }, { status: 400 });
  }
  if (password !== undefined && password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` },
      { status: 400 }
    );
  }

  const supabase = getServiceRoleClient();

  const { data: current, error: readError } = await supabase
    .from('usuarios_clinicos')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }
  if (!current) {
    return NextResponse.json({ error: 'El usuario no existe.' }, { status: 404 });
  }

  const isSelf = current.auth_id === guard.adminId;
  if (isSelf && (activo === false || (rol !== undefined && rol !== 'ADMIN'))) {
    return NextResponse.json(
      { error: 'No puedes desactivar ni quitarte el rol de Administrador a ti mismo.' },
      { status: 400 }
    );
  }

  try {
    if (password) {
      if (!current.auth_id) {
        return NextResponse.json(
          { error: 'Este usuario aún no tiene una cuenta de acceso vinculada.' },
          { status: 400 }
        );
      }
      const { error: passwordError } = await supabase.auth.admin.updateUserById(current.auth_id, {
        password,
      });
      if (passwordError) throw new Error(passwordError.message);
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (activo !== undefined) updates.activo = activo;
    if (rol !== undefined) updates.rol = rol;

    const { data, error } = await supabase
      .from('usuarios_clinicos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
