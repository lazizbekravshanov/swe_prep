'use client';

import { useEffect, useState } from 'react';
import { getRecoverableSession, clearRecoverableSession, type RecoverableSession } from '@/lib/voice/session-recovery';
import { Button } from '@/components/ui/Button';

interface SessionRecoveryPromptProps {
  onRecover: (session: RecoverableSession) => void;
  onDismiss: () => void;
}

export function SessionRecoveryPrompt({ onRecover, onDismiss }: SessionRecoveryPromptProps) {
  const [session, setSession] = useState<RecoverableSession | null>(null);

  useEffect(() => {
    const recovered = getRecoverableSession();
    setSession(recovered);
  }, []);

  if (!session) return null;

  const elapsed = Math.floor((session.savedAt - session.startTime) / 60000);
  const turnsCount = session.transcript.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="frost-panel"
        style={{
          maxWidth: 420,
          padding: 32,
          background: 'var(--bg-elevated)',
          animation: 'fade-in-up var(--duration-normal) var(--ease-default)',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Resume your interview?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
          You have an unfinished session from earlier:
        </p>

        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-active)',
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
            {session.problemTitle}
          </div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: 13, marginTop: 4 }}>
            {elapsed} min &middot; {turnsCount} turns
            {session.company && ` · ${session.company}`}
          </div>
        </div>

        <div className="flex" style={{ gap: 8 }}>
          <Button
            onClick={() => {
              onRecover(session);
              clearRecoverableSession();
            }}
            style={{ flex: 1 }}
          >
            Resume
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              clearRecoverableSession();
              onDismiss();
            }}
            style={{ flex: 1 }}
          >
            Start Fresh
          </Button>
        </div>
      </div>
    </div>
  );
}
