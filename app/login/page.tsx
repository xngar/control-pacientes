'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { DEMO_USERS } from '@/lib/auth/mock-users';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const { login, quickLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor completa tu correo y contraseña.');
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Error al iniciar sesión.');
    }
  };
  //zona
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-[var(--radius-full)] bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-[var(--radius-full)] bg-accent/10 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Header & Brand Identity */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-[var(--radius-lg)] bg-primary text-white shadow-md ring-4 ring-primary/10 mb-2">
              <Activity className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              SICOLOGIA DATA REPORT
            </h1>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              Plataforma centralizada de registro clínico, trazabilidad por duplas y seguimiento seguro.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-surface rounded-[var(--radius-lg)] border border-border shadow-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-text">Iniciar Sesión</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-[var(--radius-sm)] bg-error/15 border border-error/30 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-error" />
                <div className="flex-1">
                  <p className="font-semibold">No fue posible ingresar</p>
                  <p className="mt-0.5 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Input
                label="Contraseña"
                isPassword
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Ingresar al Sistema
              </Button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" /> Acceso Rápido de Prueba
                </span>
                <span className="text-[11px] text-text-muted">1-clic</span>
              </div>

              <div className="space-y-2">
                {DEMO_USERS.map((demo) => {
                  const isAdmin = demo.rol === 'ADMIN';
                  return (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => quickLogin(demo.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-[var(--radius-sm)] border border-border bg-zinc-50/70 hover:bg-white hover:border-primary/40 hover:shadow-xs transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-[var(--radius-full)] flex items-center justify-center text-xs font-semibold ${isAdmin
                              ? 'bg-accent/15 text-accent'
                              : 'bg-primary/15 text-primary'
                            }`}
                        >
                          {isAdmin ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <Stethoscope className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-text group-hover:text-primary transition-colors">
                            {demo.nombreCompleto}
                          </p>
                          <p className="text-[11px] text-text-muted">
                            {demo.cargo || demo.especialidad}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isAdmin ? 'admin' : 'pro'} className="text-[10px]">
                        {isAdmin ? 'ADMIN' : 'PROFESIONAL'}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Security & Confidentiality Footer Note */}
          <div className="flex items-center justify-center gap-2 text-center text-xs text-text-muted">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>
              Acceso seguro y protegido bajo normativa de confidencialidad clínica.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-text-muted border-t border-border bg-surface/50">
        SICOLOGIA DATA REPORT © {new Date().getFullYear()} — Gestión por Duplas Profesionales
      </footer>
    </div>
  );
}
