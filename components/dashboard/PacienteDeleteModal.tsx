'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CardFooter } from '@/components/ui/Card';
import { AlertCircle, Trash2 } from 'lucide-react';
import type { RegistroPaciente } from '@/types/paciente';

interface PacienteDeleteModalProps {
  paciente: RegistroPaciente | null;
  isDeleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * El borrado de una ficha clinica no tiene vuelta atras, asi que se pide
 * confirmacion de forma explicita en lugar de un confirm() del navegador, que
 * bloquea el hilo y no se puede estilar ni leer con lector de pantalla.
 */
export const PacienteDeleteModal: React.FC<PacienteDeleteModalProps> = ({
  paciente,
  isDeleting,
  error,
  onConfirm,
  onClose,
}) => {
  if (!paciente) return null;

  const titleId = 'paciente-delete-title';

  return (
    <Modal isOpen onClose={onClose} labelledBy={titleId} size="md">
      <div className="flex items-start gap-3 px-6 py-5">
        <span
          className="w-10 h-10 rounded-[var(--radius-full)] bg-error/10 text-error-text flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Trash2 className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-bold text-text">
            Eliminar paciente
          </h2>
          <p className="text-[13px] text-text-muted mt-1">
            Se borrará la ficha clínica de <strong className="text-text">{paciente.nombre}</strong>
            {paciente.rut ? ` (RUT ${paciente.rut})` : ''} y todo su historial de atenciones. Esta
            acción no se puede deshacer.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mx-6 mb-4 flex items-start gap-2 bg-error/10 border border-error/30 text-error-text text-[13px] px-4 py-3 rounded-[var(--radius-sm)]"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <CardFooter className="justify-end gap-3 rounded-b-[var(--radius-lg)]">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onConfirm}
          isLoading={isDeleting}
          loadingLabel="Eliminando ficha"
          leftIcon={!isDeleting ? <Trash2 className="w-3.5 h-3.5" /> : undefined}
        >
          Sí, eliminar
        </Button>
      </CardFooter>
    </Modal>
  );
};
