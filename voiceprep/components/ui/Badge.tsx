import type { Difficulty } from '@/lib/types';

const difficultyStyles: Record<Difficulty, React.CSSProperties> = {
  easy: { color: 'var(--success)', background: 'var(--success-soft)' },
  medium: { color: 'var(--warning)', background: 'var(--warning-soft)' },
  hard: { color: 'var(--danger)', background: 'var(--danger-soft)' },
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | Difficulty;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const style: React.CSSProperties =
    variant === 'default'
      ? { color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.04)' }
      : difficultyStyles[variant];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--radius-full)',
        padding: '2px 10px',
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
