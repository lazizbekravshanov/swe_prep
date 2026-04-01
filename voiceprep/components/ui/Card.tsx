import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function Card({ children, hoverable = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`frost-panel ${hoverable ? 'frost-panel-hover' : ''} ${className}`}
      style={{ padding: 24 }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div className={className} style={{ marginBottom: 16 }} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <h3
      className={className}
      style={{
        fontSize: '17px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
      }}
      {...props}
    >
      {children}
    </h3>
  );
}
