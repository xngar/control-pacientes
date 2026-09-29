'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { CardFooter } from '@/components/ui/Card';
import { AlertCircle, CheckCircle2, KeyRound, Save, ShieldCheck, Stethoscope, UserCircle2, X, Mail } from 'lucide-react';

interface PerfilModalProps {
  onClose: () => void;
}

type Feedback = { ok: boolean; message: string } | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PerfilModal: React.FC<PerfilModalProps> = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const [nombreCompleto, setNombreCompleto] = useState(user?.nombreCompleto ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [especialidad, setEspecialidad] = useState(user?.especialidad ?? '');
  const [cargo, setCargo] = useState(user?.cargo ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  if (!user) return null;

  const emailChanges = email.trim().toLowerCase() !== user.email.toLowerCase();
  const isAdmin = user.rol === 'ADMIN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!nombreCompleto.trim()) {
      setFeedback({ ok: false, message: 'El nombre completo es obligatorio.' });
      return;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      setFeedback({ ok: false, message: 'El correo electrónico no es válido.' });
      return;
    }

    if (emailChanges && !currentPassword) {
      setFeedback({
        ok: false,
        message: 'Confirma tu contraseña actual para cambiar el correo de acceso.',
      });
      return;
    }

    setIsSaving(true);

    const { success, emailChanged, error } = await updateProfile({
      nombreCompleto: nombreCompleto.trim(),
      email: email.trim(),
      especialidad: especialidad.trim(),
      cargo: cargo.trim(),
      currentPassword: emailChanges ? currentPassword : undefined,
    });

    setIsSaving(false);

    if (!success) {
      setFeedback({ ok: false, message: error || 'No fue posible guardar tu perfil.' });
      return;
    }

    setCurrentPassword('');
    setFeedback({
      ok: true,
      message: emailChanged
        ? `Perfil actualizado. Desde ahora ingresas con ${email.trim()}.`
        : 'Perfil actualizado.',
    });

    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1600);
  };

  return (
    <Modal isOpen onClose={onClose} labelledBy="perfil-modal-title" size="lg">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
        <span
          className="w-10 h-10 rounded-[var(--radius-full)] bg-primary/10 text-primary-text flex items-center justify-center text-sm font-bold shrink-0"
          aria-hidden="true"
        >
          {user.nombreCompleto?.charAt(0).toUpperCase() ?? '?'}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="perfil-modal-title" className="text-base font-bold text-text truncate">
            Mi perfil
          </h2>
          <p className="text-[13px] text-text-muted truncate">Actualiza los datos con los que te identifica el equipo</p>
        </div>
        <IconButton label="Cerrar mi perfil" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </IconButton>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1" noValidate>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {feedback && (
            <div
              role={feedback.ok ? 'status' : 'alert'}
              className={`flex items-start gap-2 border px-4 py-3 rounded-[var(--radius-sm)] text-[13px] ${
                feedback.ok
                  ? 'bg-success/10 border-success/30 text-success-text'
                  : 'bg-error/10 border-error/30 text-error-text'
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-[var(--radius-sm)] bg-surface-muted border border-border">
            <Badge variant={isAdmin ? 'admin' : 'pro'}>
              {isAdmin ? 'ADMIN' : 'PROFESIONAL'}
            </Badge>
            <span className="text-[13px] text-text-muted">RUT {user.rut}</span>
            <span className="text-[13px] text-text-muted ml-auto flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Rol y RUT los gestiona un Administrador
            </span>
          </div>

          <div className="space-y-4">
            <Input
              label="Nombre completo"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Ej: Ps. Andrea Ríos"
              leftIcon={<UserCircle2 className="w-4 h-4" />}
              required
            />

            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="profesional@datareport.cl"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              hint={
                emailChanges
                  ? 'Cambiarás el correo con el que inicias sesión. Necesitamos confirmar tu contraseña.'
                  : 'Es el correo con el que inicias sesión en la plataforma.'
              }
            />

            {emailChanges && (
              <div className="animate-fade-in">
                <Input
                  label="Contraseña actual"
                  isPassword
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña de acceso"
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  autoComplete="current-password"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Especialidad"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Psicología Clínica Infanto-Juvenil"
                leftIcon={<Stethoscope className="w-4 h-4" />}
              />
              <Input
                label="Cargo"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Coordinadora Clínica"
              />
            </div>
          </div>
        </div>

        <CardFooter className="justify-end gap-3 rounded-b-[var(--radius-lg)]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            loadingLabel="Guardando tu perfil"
            leftIcon={!isSaving ? <Save className="w-3.5 h-3.5" /> : undefined}
          >
            Guardar cambios
          </Button>
        </CardFooter>
      </form>
    </Modal>
  );
};
