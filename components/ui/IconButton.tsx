'use client';

import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: an icon-only control has no visible name without it. */
  label: string;
  size?: 'sm' | 'md';
  tone?: 'neutral' | 'primary' | 'danger';
  children: React.ReactNode;
}

const sizeStyles = {
  sm: 'h-7 w-7 rounded-[var(--radius-xs)]',
  md: 'h-9 w-9 rounded-[var(--radius-sm)]',
};

const toneStyles = {
  neutral: 'text-text-muted hover:text-text hover:bg-surface-hover',
  primary: 'text-primary-text hover:bg-primary hover:text-white',
  danger: 'text-error-text hover:bg-error-strong hover:text-white',
};

export const IconButton: React.FC<IconButtonProps> = ({
  label,
  size = 'md',
  tone = 'neutral',
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit cursor-pointer ${sizeStyles[size]} ${toneStyles[tone]} ${className}`}
      {...props}
    >
      <span aria-hidden="true" className="inline-flex">
        {children}
      </span>
    </button>
  );
};
