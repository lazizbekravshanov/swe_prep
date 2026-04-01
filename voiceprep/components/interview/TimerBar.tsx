'use client';

import { useEffect, useState } from 'react';
import { formatDuration } from '@/lib/utils/timer';

interface TimerBarProps {
  startTime: number | null;
  isRunning: boolean;
  maxMinutes?: number;
}

export function TimerBar({ startTime, isRunning, maxMinutes = 45 }: TimerBarProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || !isRunning) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isRunning]);

  const maxSeconds = maxMinutes * 60;
  const isOvertime = elapsed > maxSeconds;
  const isWarning = !isOvertime && elapsed > maxSeconds * 0.8;

  const color = isOvertime
    ? 'var(--danger)'
    : isWarning
      ? 'var(--warning)'
      : 'var(--text-secondary)';

  return (
    <span
      style={{
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
        fontSize: '15px',
        fontWeight: 500,
        color,
        fontVariantNumeric: 'tabular-nums',
        transition: `color var(--duration-normal) var(--ease-default)`,
      }}
    >
      {formatDuration(elapsed)} / {formatDuration(maxSeconds)}
    </span>
  );
}
