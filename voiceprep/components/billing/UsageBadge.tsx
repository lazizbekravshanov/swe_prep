'use client';

interface UsageBadgeProps {
  used: number;
  total: number;
  plan: string;
}

export function UsageBadge({ used, total, plan }: UsageBadgeProps) {
  const isAtLimit = used >= total;

  if (plan === 'pro') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 10px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--accent)',
          background: 'var(--accent-soft)',
          borderRadius: 'var(--radius-full)',
          letterSpacing: '0.02em',
        }}
      >
        Pro
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        fontSize: '12px',
        fontWeight: 500,
        color: isAtLimit ? 'var(--danger)' : 'var(--text-secondary)',
        background: isAtLimit ? 'var(--danger-soft)' : 'transparent',
        border: isAtLimit
          ? '1px solid rgba(197, 48, 48, 0.12)'
          : '1px solid var(--border-default)',
        borderRadius: 'var(--radius-full)',
        letterSpacing: '0.02em',
      }}
    >
      {used}/{total} sessions
    </span>
  );
}
