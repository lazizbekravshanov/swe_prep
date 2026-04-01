import { ReactNode } from 'react';

interface FrostPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function FrostPanel({ children, className = '', hover = false, onClick }: FrostPanelProps) {
  return (
    <div
      className={`frost-panel ${hover ? 'frost-panel-hover' : ''} ${className}`}
      onClick={onClick}
      style={{
        padding: '24px',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {children}
    </div>
  );
}
