import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'admin' | 'pro' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    default: 'bg-surface-muted text-text-muted border-border',
    admin: 'bg-accent/10 text-accent-text border-accent/30 font-semibold',
    pro: 'bg-primary/10 text-primary-text border-primary/30 font-semibold',
    success: 'bg-success/15 text-success-text border-success/30 font-medium',
    warning: 'bg-warning/15 text-warning-text border-warning/30 font-medium',
    error: 'bg-error/10 text-error-text border-error/30 font-medium',
    info: 'bg-info/10 text-info-text border-info/30 font-medium',
  };

  const dotStyles = {
    default: 'bg-text-muted',
    admin: 'bg-accent-strong',
    pro: 'bg-primary',
    success: 'bg-success-strong',
    warning: 'bg-warning-strong',
    error: 'bg-error-strong',
    info: 'bg-info-strong',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-xs)] text-xs border ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`} aria-hidden="true" />}
      {children}
    </span>
  );
};
