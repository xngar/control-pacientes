'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
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
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 rounded-[var(--radius-sm)] gap-1.5',
      md: 'text-sm px-4 py-2.5 rounded-[var(--radius-sm)] gap-2',
      lg: 'text-base px-6 py-3.5 rounded-[var(--radius-md)] gap-2.5 font-semibold',
    };

    const variantStyles = {
      primary:
        'bg-primary text-white hover:bg-primary-hover focus:ring-primary/40 shadow-sm active:scale-[0.99]',
      secondary:
        'bg-secondary text-white hover:opacity-90 focus:ring-secondary/40 shadow-sm active:scale-[0.99]',
      accent:
        'bg-accent text-white hover:bg-accent-hover focus:ring-accent/40 shadow-sm active:scale-[0.99]',
      outline:
        'border border-border bg-surface text-text-primary hover:bg-black/5 dark:hover:bg-white/5 focus:ring-primary/30',
      ghost:
        'bg-transparent text-text-primary hover:bg-black/5 dark:hover:bg-white/5 focus:ring-primary/20',
      danger:
        'bg-error text-white hover:opacity-90 focus:ring-error/40 shadow-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
