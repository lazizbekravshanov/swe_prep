import { use } from 'react';

export default function SharedReplayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  return (
    <div
      style={{
        maxWidth: 768,
        margin: '0 auto',
        padding: '64px 24px',
        width: '100%',
      }}
    >
      <div
        className="frost-panel"
        style={{
          padding: 48,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 16px',
          }}
        >
          Shared Interview Replay
        </h1>

        <p
          style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: 480,
            margin: '0 auto 32px',
          }}
        >
          This replay link requires the session data to be loaded from the
          database. Set up PostgreSQL and run{' '}
          <code
            style={{
              fontSize: 13,
              fontFamily: 'var(--font-mono), monospace',
              background: 'var(--bg-surface)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
            }}
          >
            prisma db push
          </code>{' '}
          to enable session sharing.
        </p>

        <p
          style={{
            fontSize: 13,
            color: 'var(--text-tertiary)',
            margin: '0 0 32px',
          }}
        >
          Token: {token}
        </p>

        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 20px',
            fontSize: 15,
            fontWeight: 500,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent)',
            color: 'var(--text-inverse)',
            textDecoration: 'none',
            transition: 'all var(--duration-fast) var(--ease-default)',
          }}
        >
          Back to VoicePrep
        </a>
      </div>
    </div>
  );
}
