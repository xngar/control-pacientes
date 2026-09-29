'use client';

import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      isPassword = false,
      type = 'text',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;
    const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-text">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-text-muted" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || hint ? messageId : undefined}
            className={`w-full bg-surface text-text placeholder:text-text-muted border rounded-[var(--radius-sm)] py-2.5 text-sm transition-colors duration-150 ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${isPassword ? 'pr-11' : 'pr-3.5'} ${
              error
                ? 'border-error focus:border-error'
                : 'border-border hover:border-text-muted/50 focus:border-primary'
            } ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-pressed={showPassword}
              className="absolute right-2.5 p-1.5 rounded-[var(--radius-xs)] text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <span className="sr-only">{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</span>
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
        {(error || hint) && (
          <p id={messageId} className={`text-xs ${error ? 'text-error-text font-medium' : 'text-text-muted'}`}>
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
