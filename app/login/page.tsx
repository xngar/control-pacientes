'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Activity, Lock, Mail, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Completa tu correo y contraseña para continuar.');
      return;
    }

    const res = await login(email.trim(), password);
    if (!res.success) {
      setError(res.error || 'No fue posible iniciar sesión.');
    }
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
              Plataforma centralizada de registro clínico, trazabilidad por duplas y seguimiento seguro.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <div className="border-b border-border pb-4 mb-5">
              <h2 className="text-lg font-semibold text-text">Iniciar sesión</h2>
              <p className="text-[13px] text-text-muted mt-0.5">
                Ingresa tus credenciales para acceder al sistema.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                  className="p-3.5 rounded-[var(--radius-sm)] bg-error/10 border border-error/30 text-error-text text-[13px] flex items-start gap-2.5 animate-fade-in"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-semibold">No fue posible ingresar</p>
                    <p className="mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              <Input
                label="Correo electrónico"
                type="email"
                placeholder="ejemplo@datareport.cl"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
                autoFocus
              />

              <Input
                label="Contraseña"
                isPassword
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                loadingLabel="Verificando credenciales"
              >
                Ingresar al sistema
              </Button>
            </form>

            <div className="pt-5 mt-5 border-t border-border text-center">
              <Link
                href="/recuperar-contrasena"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-text hover:text-primary-hover hover:underline"
              >
                <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                ¿Olvidaste tu contraseña?
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
