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
    default: 'bg-zinc-100 text-text border-border',
    admin: 'bg-accent/15 text-accent border-accent/30 font-semibold',
    pro: 'bg-primary/15 text-primary border-primary/30 font-semibold',
    success: 'bg-success/15 text-emerald-800 border-success/30 font-medium',
    warning: 'bg-warning/15 text-amber-800 border-warning/30 font-medium',
    error: 'bg-error/15 text-rose-800 border-error/30 font-medium',
    info: 'bg-info/15 text-blue-800 border-info/30 font-medium',
  };

  const dotStyles = {
    default: 'bg-text-muted',
    admin: 'bg-accent',
    pro: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-xs)] text-xs border tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
};
