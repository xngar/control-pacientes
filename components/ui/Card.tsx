import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Superficie base. La elevacion de este nivel se declara con borde, nunca
 * con sombra: un borde de 1px bajo una sombra ancha produce tarjetas fantasma.
 */
export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-surface rounded-[var(--radius-md)] border border-border overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, action, className = '', children }) => {
  return (
    <div className={`px-5 py-4 border-b border-border ${className}`}>
      {children || (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-text">{title}</h3>}
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-5 py-3.5 bg-surface-muted border-t border-border ${className}`}>{children}</div>
  );
};
