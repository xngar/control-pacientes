'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Activity, AlertCircle, ArrowLeft, CheckCircle2, Lock, Mail } from 'lucide-react';

const MIN_PASSWORD_LENGTH = 8;

type View = 'request' | 'update';

export default function RecuperarContrasenaPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkRecoverySession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (data.session) setView('update');
    };

    checkRecoverySession();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted && (event === 'PASSWORD_RECOVERY' || session)) setView('update');
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSent(false);

    if (!email.trim()) {
      setError('Ingresa el correo con el que te registraste.');
      return;
    }

    setIsSubmitting(true);

    const { error: requestError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/recuperar-contrasena` }
    );

    setIsSubmitting(false);

    if (requestError) {
      setError(
        requestError.message === 'Rate limit exceeded'
          ? 'Demasiados intentos. Espera unos minutos antes de volver a solicitar.'
          : 'No fue posible enviar el correo de recuperación. Inténtalo nuevamente.'
      );
      return;
    }

    setSent(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setIsSubmitting(false);

    if (updateError) {
      setError('No fue posible actualizar la contraseña. El enlace pudo haber vencido.');
      return;
    }

    setUpdated(true);
    setTimeout(() => router.push('/login'), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-[var(--radius-full)] bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-[var(--radius-full)] bg-accent/10 blur-3xl pointer-events-none" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-[var(--radius-lg)] bg-primary text-white shadow-md ring-4 ring-primary/10 mb-2">
              <Activity className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              SICOLOGIA DATA REPORT
            </h1>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              {view === 'update'
                ? 'Define una nueva contraseña para acceder al sistema.'
                : 'Te enviaremos un enlace para restablecer tu contraseña.'}
            </p>
          </div>

          <div className="bg-surface rounded-[var(--radius-lg)] border border-border shadow-xl p-6 sm:p-8 space-y-6">
            {view === 'update' ? (
              /* ── UPDATE PASSWORD ── */
              <>
                <div className="border-b border-border pb-4">
                  <h2 className="text-lg font-semibold text-text">Nueva Contraseña</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Mínimo {MIN_PASSWORD_LENGTH} caracteres
                  </p>
                </div>

                {updated ? (
                  <div className="p-3.5 rounded-[var(--radius-sm)] bg-success/15 border border-success/30 text-emerald-900 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-success" />
                    <div>
                      <p className="font-semibold">Contraseña actualizada</p>
                      <p className="mt-0.5 opacity-90">Te redirigimos al inicio de sesión...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="p-3.5 rounded-[var(--radius-sm)] bg-error/15 border border-error/30 text-rose-900 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-error" />
                        <div className="flex-1">
                          <p className="font-semibold">No fue posible continuar</p>
                          <p className="mt-0.5 opacity-90">{error}</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-4">
                      <Input
                        label="Nueva Contraseña"
                        isPassword
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        leftIcon={<Lock className="w-4 h-4" />}
                        required
                        autoComplete="new-password"
                      />

                      <Input
                        label="Repetir Contraseña"
                        isPassword
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        leftIcon={<Lock className="w-4 h-4" />}
                        required
                        autoComplete="new-password"
                      />

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full mt-2"
                        isLoading={isSubmitting}
                      >
                        Guardar Contraseña
                      </Button>
                    </form>
                  </>
                )}
              </>
            ) : (
              /* ── REQUEST RESET ── */
              <>
                <div className="border-b border-border pb-4">
                  <h2 className="text-lg font-semibold text-text">Recuperar Contraseña</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Ingresa tu correo y te enviaremos un enlace seguro
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-[var(--radius-sm)] bg-error/15 border border-error/30 text-rose-900 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-error" />
                    <div className="flex-1">
                      <p className="font-semibold">No fue posible enviar el correo</p>
                      <p className="mt-0.5 opacity-90">{error}</p>
                    </div>
                  </div>
                )}

                {sent ? (
                  <div className="p-3.5 rounded-[var(--radius-sm)] bg-success/15 border border-success/30 text-emerald-900 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-success" />
                    <div>
                      <p className="font-semibold">Revisa tu correo</p>
                      <p className="mt-0.5 opacity-90">
                        Si <span className="font-semibold">{email}</span> tiene una cuenta activa,
                        recibirás el enlace en unos minutos.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRequest} className="space-y-4">
                    <Input
                      label="Correo Electrónico"
                      type="email"
                      placeholder="ejemplo@datareport.cl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                      required
                      autoComplete="email"
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full mt-2"
                      isLoading={isSubmitting}
                    >
                      Enviar Enlace
                    </Button>
                  </form>
                )}
              </>
            )}

            <div className="pt-4 border-t border-border text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-center text-xs text-text-muted">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>
              Acceso seguro y protegido bajo normativa de confidencialidad clínica.
            </span>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-text-muted border-t border-border bg-surface/50">
        SICOLOGIA DATA REPORT © {new Date().getFullYear()} — Gestión por Duplas Profesionales
      </footer>
    </div>
  );
}
