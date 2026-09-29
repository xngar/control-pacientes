'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { UserProfile } from '@/types/auth';
import { perfilService, type ActualizarPerfilPayload } from '@/services/perfilService';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    payload: ActualizarPerfilPayload
  ) => Promise<{ success: boolean; emailChanged?: boolean; error?: string }>;
}

type ProfileResult =
  | { status: 'ok'; profile: UserProfile }
  | { status: 'missing' }
  | { status: 'inactive' }
  | { status: 'error'; message: string };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SIGN_IN_ERRORS: Record<string, string> = {
  InvalidLoginCredentials: 'Credenciales inválidas. Verifica tu correo y contraseña.',
  EmailNotConfirmed: 'Tu correo aún no fue confirmado. Revisa tu casilla de entrada.',
};

export const PROFILE_ERRORS: Record<Exclude<ProfileResult['status'], 'ok' | 'error'>, string> = {
  missing:
    'Tu cuenta no tiene un perfil clínico asociado. Contacta al Administrador para que lo habilite.',
  inactive: 'Esta cuenta se encuentra temporalmente inactiva. Contacta al Administrador.',
};

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

async function fetchProfile(userId: string): Promise<ProfileResult> {
  const { data, error } = await supabase
    .from('usuarios_clinicos')
    .select('*')
    .eq('auth_id', userId)
    .maybeSingle();

  if (error) return { status: 'error', message: error.message };
  if (!data) return { status: 'missing' };
  if (!data.activo) return { status: 'inactive' };

  return { status: 'ok', profile: toProfile(data) };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const signOut = useCallback(async () => {
    setUser(null);
    setSession(null);
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error al cerrar sesión', error);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);

      if (!nextSession) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const result = await fetchProfile(nextSession.user.id);
      if (!isMounted) return;

      if (result.status === 'ok') {
        setUser(result.profile);
      } else {
        if (result.status === 'error') console.error('Error al cargar el perfil clínico', result.message);
        await signOut();
      }

      if (isMounted) setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => hydrate(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setIsLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        // Las llamadas a Supabase dentro del listener deben salir del ciclo
        // sincrónico del evento o se interrumpe el refresco del token.
        setTimeout(() => hydrate(nextSession), 0);
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [signOut]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        setIsLoading(false);
        return {
          success: false,
          error:
            SIGN_IN_ERRORS[error?.message ?? ''] ??
            'No fue posible iniciar sesión. Inténtalo nuevamente.',
        };
      }

      const result = await fetchProfile(data.user.id);

      if (result.status !== 'ok') {
        await signOut();
        setIsLoading(false);
        return {
          success: false,
          error:
            result.status === 'error'
              ? 'No pudimos validar tu perfil clínico. Inténtalo nuevamente.'
              : PROFILE_ERRORS[result.status],
        };
      }

      setSession(data.session);
      setUser(result.profile);
      setIsLoading(false);

      router.push(result.profile.rol === 'ADMIN' ? '/admin' : '/clinico');
      return { success: true };
    },
    [router, signOut]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
    router.push('/login');
  }, [router, signOut]);

  const updateProfile = useCallback(
    async (
      payload: ActualizarPerfilPayload
    ): Promise<{ success: boolean; emailChanged?: boolean; error?: string }> => {
      const { profile, emailChanged, error } = await perfilService.update(payload);

      if (error || !profile) {
        return { success: false, error: error || 'No fue posible guardar tu perfil.' };
      }

      setUser(profile);
      return { success: true, emailChanged };
    },
    []
  );

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
