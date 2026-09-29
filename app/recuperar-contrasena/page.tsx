'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { notificar } from '@/lib/notifications';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
      notificar.fallo('No se pudo enviar el correo', 'Revisa la dirección e inténtalo nuevamente.');
      return;
    }

    notificar.exito('Enlace enviado', `Revisa el correo de ${email.trim()} para elegir una contraseña.`);
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
      notificar.fallo('No se pudo guardar la contraseña', 'El enlace pudo haber vencido.');
      return;
    }

    notificar.exito('Contraseña actualizada', 'Ya puedes ingresar con la nueva contraseña.');
    setUpdated(true);
    setTimeout(() => router.push('/login'), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="inline-flex items-center gap-3 text-left text-2xl sm:text-3xl font-bold tracking-tight text-text">
              <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-[var(--radius-md)] bg-primary text-on-primary">
                <Activity className="w-6 h-6" aria-hidden="true" />
              </span>
              <span>
                SICOLOGIA
                <span className="block text-base sm:text-lg font-semibold text-text-muted tracking-normal">
                  Data Report
                </span>
              </span>
            </h1>
            <p className="text-sm text-text-muted max-w-sm mx-auto pt-2">
              {view === 'update'
                ? 'Define una nueva contraseña para acceder al sistema.'
                : 'Te enviaremos un enlace para restablecer tu contraseña.'}
            </p>
          </div>

          <Card className="p-6 sm:p-8 space-y-6">
            {view === 'update' ? (
              /* ── UPDATE PASSWORD ── */
              <>
                <div className="border-b border-border pb-4">
                  <h2 className="text-lg font-semibold text-text">Nueva contraseña</h2>
                  <p className="text-[13px] text-text-muted mt-0.5">
                    Mínimo {MIN_PASSWORD_LENGTH} caracteres
                  </p>
                </div>

                {updated ? (
                  <div role="status" className="p-3.5 rounded-[var(--radius-sm)] bg-success/10 border border-success/30 text-success-text text-[13px] flex items-start gap-2.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Contraseña actualizada</p>
                      <p className="mt-0.5 opacity-90">Te redirigimos al inicio de sesión...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div role="alert" className="p-3.5 rounded-[var(--radius-sm)] bg-error/10 border border-error/30 text-error-text text-[13px] flex items-start gap-2.5 animate-fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold">No fue posible continuar</p>
                          <p className="mt-0.5 opacity-90">{error}</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-4">
                      <Input
                        label="Nueva contraseña"
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
                        loadingLabel="Procesando solicitud"
                      >
                        Guardar contraseña
                      </Button>
                    </form>
                  </>
                )}
              </>
            ) : (
              /* ── REQUEST RESET ── */
              <>
                <div className="border-b border-border pb-4">
                  <h2 className="text-lg font-semibold text-text">Recuperar contraseña</h2>
                  <p className="text-[13px] text-text-muted mt-0.5">
                    Ingresa tu correo y te enviaremos un enlace seguro
                  </p>
                </div>

                {error && (
                  <div role="alert" className="p-3.5 rounded-[var(--radius-sm)] bg-error/10 border border-error/30 text-error-text text-[13px] flex items-start gap-2.5 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">No fue posible enviar el correo</p>
                      <p className="mt-0.5 opacity-90">{error}</p>
                    </div>
                  </div>
                )}

                {sent ? (
                  <div role="status" className="p-3.5 rounded-[var(--radius-sm)] bg-success/10 border border-success/30 text-success-text text-[13px] flex items-start gap-2.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
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
                      label="Correo electrónico"
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
                        loadingLabel="Procesando solicitud"
                    >
                      Enviar enlace
                    </Button>
                  </form>
                )}
              </>
            )}

            <div className="pt-5 mt-6 border-t border-border text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-muted hover:text-primary-text"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Volver al inicio de sesión
              </Link>
            </div>
          </Card>

          <p className="flex items-center justify-center gap-2 text-center text-[13px] text-text-muted">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
            <span>
              Acceso seguro y protegido bajo normativa de confidencialidad clínica.
            </span>
          </p>
        </div>
      </main>

      <footer className="py-4 text-center text-[13px] text-text-muted border-t border-border bg-surface-muted">
        SICOLOGIA DATA REPORT © {new Date().getFullYear()} — Gestión por duplas profesionales
      </footer>
    </div>
  );
}
