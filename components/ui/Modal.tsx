'use client';

import React, { useCallback, useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** id del nodo que nombra el dialogo. Sin esto el lector de pantalla no anuncia nada. */
  labelledBy: string;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
}

const sizeStyles = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Dialogo modal. Concentra el comportamiento que los modales hechos a mano
 * solian omitir: rol y nombre accesible, trampa de foco, cierre con Escape,
 * cierre al pulsar el fondo, bloqueo del scroll de fondo y devolucion del foco
 * al control que lo abrio.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  labelledBy,
  size = 'lg',
  className = '',
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const focusFirst = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = panel.querySelector<HTMLElement>(FOCUSABLE);
      (target ?? panel).focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    return () => {
      cancelAnimationFrame(raf);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      restoreFocusRef.current?.focus();
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-overlay-in"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-text/50 animate-overlay-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`relative w-full ${sizeStyles[size]} bg-surface rounded-[var(--radius-lg)] shadow-overlay flex flex-col max-h-[90vh] animate-dialog-in ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
