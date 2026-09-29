'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { UsuarioGestionado, usuarioService } from '@/services/usuarioService';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { CardFooter } from '@/components/ui/Card';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Plus,
  Save,
  Loader2,
  ShieldCheck,
  Stethoscope,
  UserCircle2,
  X,
  ChevronDown,
} from 'lucide-react';

interface UsuariosModalProps {
  onClose: () => void;
}

type ModalView = 'list' | 'create' | 'edit';
type ModalResult = { success: boolean; message?: string };

const MIN_PASSWORD_LENGTH = 8;

const EMPTY_FORM = {
  email: '',
  nombreCompleto: '',
  rut: '',
  rol: 'PROFESIONAL' as 'ADMIN' | 'PROFESIONAL',
  especialidad: '',
  cargo: '',
  password: '',
};

export const UsuariosModal: React.FC<UsuariosModalProps> = ({ onClose }) => {
  const { user: currentUser } = useAuth();
  const [view, setView] = useState<ModalView>('list');
  const [usuarios, setUsuarios] = useState<UsuarioGestionado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selected, setSelected] = useState<UsuarioGestionado | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState<ModalResult | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const rows = await usuarioService.list();
    setUsuarios(rows);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    usuarioService.list().then((rows) => {
      if (cancelled) return;
      setUsuarios(rows);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenCreate = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setFeedback(null);
    setView('create');
  };

  const handleOpenEdit = (usuario: UsuarioGestionado) => {
    setSelected(usuario);
    setForm({
      email: usuario.email,
      nombreCompleto: usuario.nombreCompleto,
      rut: usuario.rut,
      rol: usuario.rol,
      especialidad: usuario.especialidad ?? '',
      cargo: usuario.cargo ?? '',
      password: '',
    });
    setFeedback(null);
    setView('edit');
  };

  const handleCreate = async () => {
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setFeedback({ success: false, message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` });
      return;
    }

    setIsSaving(true);
    const { data, error } = await usuarioService.create({
      email: form.email.trim(),
      nombreCompleto: form.nombreCompleto.trim(),
      rut: form.rut.trim(),
      rol: form.rol,
      especialidad: form.especialidad.trim(),
      cargo: form.cargo.trim(),
      password: form.password,
    });

    setIsSaving(false);

    if (error) {
      setFeedback({ success: false, message: error });
      return;
    }

    setFeedback({ success: true, message: `Cuenta creada para ${data?.nombreCompleto ?? form.email}.` });
    await fetchAll();
    setTimeout(() => {
      setFeedback(null);
      setView('list');
    }, 1400);
  };

  const handleSaveEdit = async () => {
    if (!selected) return;

    setIsSaving(true);
    let lastMessage = 'Usuario actualizado.';

    if (form.password) {
      if (form.password.length < MIN_PASSWORD_LENGTH) {
        setIsSaving(false);
        setFeedback({
          success: false,
          message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
        });
        return;
      }
      if (!selected.tieneCuenta) {
        setIsSaving(false);
        setFeedback({
          success: false,
          message: 'Este profesional todavía no tiene cuenta. Créalo con una contraseña para habilitarlo.',
        });
        return;
      }
      const { error } = await usuarioService.resetPassword(selected.id, form.password);
      if (error) {
        setIsSaving(false);
        setFeedback({ success: false, message: error });
        return;
      }
      lastMessage = 'Contraseña actualizada.';
    }

    const { error } = await usuarioService.setActivo(selected.id, selected.activo);
    setIsSaving(false);

    if (error) {
      setFeedback({ success: false, message: error });
      return;
    }

    setFeedback({ success: true, message: lastMessage });
    await fetchAll();
    setTimeout(() => {
      setFeedback(null);
      setView('list');
    }, 1400);
  };

  const handleToggleActivo = async (usuario: UsuarioGestionado) => {
    setIsSaving(true);
    const { error } = await usuarioService.setActivo(usuario.id, !usuario.activo);
    setIsSaving(false);

    if (error) {
      setFeedback({ success: false, message: error });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    await fetchAll();
  };

  return (
    <Modal isOpen onClose={onClose} labelledBy="usuarios-modal-title" size="lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <h2 id="usuarios-modal-title" className="text-base font-bold text-text">
          {view === 'list' && 'Gestión de usuarios'}
          {view === 'create' && 'Nuevo usuario'}
          {view === 'edit' && 'Editar usuario'}
        </h2>

        <div className="flex items-center gap-2">
          {view !== 'list' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('list')}
              leftIcon={<ChevronDown className="w-3.5 h-3.5 rotate-90" />}
            >
              Volver
            </Button>
          )}
          <IconButton label="Cerrar gestión de usuarios" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2.5" role="status">
            <Loader2 className="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
            <span className="text-[13px] text-text-muted">Cargando usuarios...</span>
          </div>
        ) : view === 'list' ? (
          <div className="p-6">
            {usuarios.length === 0 ? (
              <div className="text-center py-12">
                <UserCircle2 className="w-9 h-9 mx-auto mb-3 text-text-muted" aria-hidden="true" />
                <p className="text-sm font-semibold text-text">Todavía no hay usuarios</p>
                <p className="text-[13px] text-text-muted mt-1">
                  Crea la primera cuenta con acceso al sistema.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {usuarios.map((usuario) => (
                  <li key={usuario.id}>
                    <UsuarioCard
                      usuario={usuario}
                      isSelf={usuario.id === currentUser?.id}
                      isSaving={isSaving}
                      onEdit={() => handleOpenEdit(usuario)}
                      onToggleActivo={() => handleToggleActivo(usuario)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
            <div className="p-6 space-y-5">
              {feedback && (
                <div
                  className={`flex items-start gap-2 border text-sm px-4 py-3 rounded-[var(--radius-sm)] ${
                    feedback.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {feedback.success ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {view === 'create' ? (
                <>
                  <Input
                    label="Correo Electrónico"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="profesional@datareport.cl"
                    leftIcon={<UserCircle2 className="w-4 h-4" />}
                    required
                  />

                  <Input
                    label="Nombre Completo"
                    value={form.nombreCompleto}
                    onChange={(e) => setForm((f) => ({ ...f, nombreCompleto: e.target.value }))}
                    placeholder="Ej: Ps. Andrea Ríos"
                    required
                  />

                  <Input
                    label="RUT"
                    value={form.rut}
                    onChange={(e) => setForm((f) => ({ ...f, rut: e.target.value }))}
                    placeholder="16.789.012-3"
                    required
                  />

                  <fieldset>
                    <legend className="text-xs font-semibold text-text mb-2">Rol</legend>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rol"
                          checked={form.rol === 'PROFESIONAL'}
                          onChange={() => setForm((f) => ({ ...f, rol: 'PROFESIONAL' }))}
                          className="accent-primary"
                        />
                        <Stethoscope className="w-4 h-4 text-primary-text" aria-hidden="true" />
                        <span className="text-sm text-text">Profesional</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rol"
                          checked={form.rol === 'ADMIN'}
                          onChange={() => setForm((f) => ({ ...f, rol: 'ADMIN' }))}
                          className="accent-primary"
                        />
                        <ShieldCheck className="w-4 h-4 text-accent-text" aria-hidden="true" />
                        <span className="text-sm text-text">Administrador</span>
                      </label>
                    </div>
                  </fieldset>

                  <Input
                    label="Especialidad"
                    value={form.especialidad}
                    onChange={(e) => setForm((f) => ({ ...f, especialidad: e.target.value }))}
                    placeholder="Psicología Clínica Infanto-Juvenil"
                  />

                  <Input
                    label="Cargo"
                    value={form.cargo}
                    onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
                    placeholder="Coordinadora Clínica"
                  />

                  <Input
                    label="Contraseña temporal"
                    isPassword
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                    leftIcon={<KeyRound className="w-4 h-4" />}
                    required
                    autoComplete="new-password"
                    hint="El profesional podrá cambiarla cuando tenga que recuperar acceso."
                  />
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-[var(--radius-sm)] bg-surface-muted border border-border">
                    <p className="text-sm font-semibold text-text">{form.nombreCompleto}</p>
                    <p className="text-[13px] text-text-muted">
                      {form.email} · {form.rut}
                    </p>
                    {!selected?.tieneCuenta && (
                      <p className="text-[13px] text-warning-text mt-2 font-medium">
                        Este registro no tiene cuenta de acceso. Crea un usuario nuevo con este correo
                        para habilitar el ingreso.
                      </p>
                    )}
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected?.activo ?? false}
                      disabled={selected?.id === currentUser?.id}
                      onChange={(e) =>
                        setSelected((prev) => (prev ? { ...prev, activo: e.target.checked } : prev))
                      }
                      className="accent-primary mt-0.5"
                    />
                    <span className="text-sm text-text">
                      Cuenta activa
                      {selected?.id === currentUser?.id && (
                        <span className="block text-[13px] text-text-muted mt-0.5">
                          No puedes desactivar tu propia cuenta.
                        </span>
                      )}
                    </span>
                  </label>

                  <Input
                    label="Nueva Contraseña"
                    isPassword
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Déjalo vacío para no cambiarla"
                    leftIcon={<KeyRound className="w-4 h-4" />}
                    autoComplete="new-password"
                    disabled={!selected?.tieneCuenta}
                  />
                </>
              )}
            </div>
          )}
        </div>

      <CardFooter className="flex items-center justify-between gap-3 rounded-b-[var(--radius-lg)]">
        {view === 'list' ? (
          <>
            <p className="text-[13px] text-text-muted">
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} en la plataforma. Los cambios de acceso
              aplican de inmediato.
            </p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenCreate}
            >
              Nuevo usuario
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setView('list');
                setFeedback(null);
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={view === 'create' ? handleCreate : handleSaveEdit}
              isLoading={isSaving}
              loadingLabel="Guardando el usuario"
              leftIcon={!isSaving ? <Save className="w-3.5 h-3.5" /> : undefined}
            >
              {view === 'create' ? 'Crear usuario' : 'Guardar cambios'}
            </Button>
          </>
        )}
      </CardFooter>
    </Modal>
  );
};

/* ── Sub-components ── */

interface UsuarioCardProps {
  usuario: UsuarioGestionado;
  isSelf: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onToggleActivo: () => void;
}

const UsuarioCard: React.FC<UsuarioCardProps> = ({
  usuario,
  isSelf,
  isSaving,
  onEdit,
  onToggleActivo,
}) => {
  const isAdmin = usuario.rol === 'ADMIN';

  return (
    <div className="flex items-center justify-between gap-3 p-4 bg-surface-muted hover:bg-primary/5 border border-border hover:border-primary/30 rounded-[var(--radius-sm)] transition-colors">
      <div className="flex items-start gap-3 min-w-0">
        <span
          className={`mt-1 w-2.5 h-2.5 rounded-[var(--radius-full)] shrink-0 ${
            !usuario.activo ? 'bg-border' : isAdmin ? 'bg-accent' : 'bg-success'
          }`}
          title={usuario.activo ? 'Activo' : 'Inactivo'}
          role="img"
          aria-label={usuario.activo ? 'Activo' : 'Inactivo'}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text truncate">
            {usuario.nombreCompleto}
            {isSelf && <span className="ml-2 text-xs text-text-muted font-normal">(tú)</span>}
          </p>
          <p className="text-[13px] text-text-muted truncate">{usuario.email} · {usuario.rut}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <Badge variant={isAdmin ? 'admin' : 'pro'}>
              {isAdmin ? 'ADMIN' : 'PROFESIONAL'}
            </Badge>
            {!usuario.activo && <Badge variant="error">INACTIVO</Badge>}
            {!usuario.tieneCuenta && <Badge variant="warning">SIN CUENTA</Badge>}
            {usuario.cargo && <span className="text-[13px] text-text-muted">{usuario.cargo}</span>}
            {usuario.especialidad && (
              <span className="text-[13px] text-text-muted">{usuario.especialidad}</span>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleActivo}
          disabled={isSelf || isSaving}
          title={usuario.activo ? 'Desactivar acceso' : 'Reactivar acceso'}
        >
          {usuario.activo ? 'Desactivar' : 'Reactivar'}
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Gestionar
        </Button>
      </div>
    </div>
  );
};
