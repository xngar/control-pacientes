'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingLabel = 'Cargando',
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'text-[13px] px-3 py-1.5 rounded-[var(--radius-sm)] gap-1.5 min-h-8',
      md: 'text-sm px-4 py-2 rounded-[var(--radius-sm)] gap-2 min-h-10',
      lg: 'text-base px-6 py-3 rounded-[var(--radius-md)] gap-2.5 min-h-12 font-semibold',
    };

    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-primary-hover',
      secondary: 'bg-secondary-strong text-white hover:bg-secondary-text',
      accent: 'bg-accent-strong text-white hover:brightness-95',
      outline: 'border border-border bg-surface text-text hover:bg-surface-hover',
      ghost: 'bg-transparent text-text hover:bg-surface-muted',
      danger: 'bg-error-strong text-white hover:brightness-95',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={`inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon && (
            <span className="inline-flex shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )
        )}
        {children}
        {isLoading && <span className="sr-only">{loadingLabel}</span>}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
