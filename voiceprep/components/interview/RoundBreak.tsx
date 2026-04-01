'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { RoundConfig, RoundResult } from '@/lib/interview/multi-round';
import { getRoundLabel } from '@/lib/interview/multi-round';

interface RoundBreakProps {
  completedRound: RoundResult;
  nextRound: RoundConfig;
  roundNumber: number;
  totalRounds: number;
  onReady: () => void;
  onTakeBreak: () => void;
}

export function RoundBreak({
  completedRound,
  nextRound,
  roundNumber,
  totalRounds,
  onReady,
  onTakeBreak,
}: RoundBreakProps) {
  const [breakActive, setBreakActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);

  useEffect(() => {
    if (!breakActive || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          onReady();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breakActive, secondsLeft, onReady]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const scoreColor =
    completedRound.score >= 3 ? 'var(--success)' : completedRound.score >= 2 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="flex h-full items-center justify-center" style={{ padding: 48 }}>
      <div className="frost-panel" style={{ maxWidth: 480, padding: 40, textAlign: 'center' }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-tertiary)',
            marginBottom: 8,
          }}
        >
          Round {roundNumber} of {totalRounds}
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: '0 0 16px',
          }}
        >
          Round Complete
        </h2>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 4,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 36, fontWeight: 600, color: scoreColor }}>
            {completedRound.score.toFixed(1)}
          </span>
          <span style={{ fontSize: 16, color: 'var(--text-tertiary)' }}>/4</span>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.6 }}>
          {completedRound.summary}
        </p>

        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-active)',
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
            Next: {getRoundLabel(nextRound.type)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {nextRound.duration} min &middot; {nextRound.difficulty === 'auto' ? 'Adaptive' : nextRound.difficulty} difficulty
            {nextRound.problemCount > 1 && ` · ${nextRound.problemCount} problems`}
          </div>
        </div>

        {breakActive ? (
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--text-primary)',
                marginBottom: 12,
              }}
            >
              {mins}:{secs.toString().padStart(2, '0')}
            </div>
            <Button onClick={onReady}>I&apos;m ready now</Button>
          </div>
        ) : (
          <div className="flex" style={{ gap: 8, justifyContent: 'center' }}>
            <Button onClick={onReady}>Ready now</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setBreakActive(true);
                onTakeBreak();
              }}
            >
              Take a 2-min break
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
