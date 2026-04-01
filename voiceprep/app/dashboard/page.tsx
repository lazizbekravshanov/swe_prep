'use client';

import { useEffect, useState } from 'react';
import { WeaknessPanel } from '@/components/feedback/WeaknessPanel';
import { BenchmarkCard } from '@/components/dashboard/BenchmarkCard';
import { Button } from '@/components/ui/Button';
import { getSessionRecords } from '@/lib/analytics/weakness-detector';

export default function DashboardPage() {
  const [hasData, setHasData] = useState<boolean | null>(null);

  useEffect(() => {
    const records = getSessionRecords();
    setHasData(records.length > 0);
  }, []);

  // Don't render until we've checked localStorage
  if (hasData === null) return null;

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '48px 24px 80px',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Your Interview Readiness
        </h1>
        <a
          href="/"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--accent)',
            textDecoration: 'none',
          }}
        >
          Back to home
        </a>
      </div>

      {hasData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <WeaknessPanel />
          <BenchmarkCard />
          <div className="flex" style={{ gap: 12 }}>
            <Button onClick={() => { window.location.href = '/setup'; }}>Practice Weak Areas</Button>
            <Button variant="secondary" onClick={() => { window.location.href = '/debrief'; }}>Debrief a Real Interview</Button>
          </div>
        </div>
      ) : (
        <div
          className="frost-panel"
          style={{
            padding: 48,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 36,
              marginBottom: 16,
            }}
          >
            {/* Placeholder icon using CSS */}
            <span
              style={{
                display: 'inline-block',
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-soft)',
                lineHeight: '56px',
                fontSize: 24,
                color: 'var(--accent)',
              }}
            >
              ?
            </span>
          </div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}
          >
            No sessions yet
          </h2>
          <p
            style={{
              fontSize: 15,
              color: 'var(--text-secondary)',
              maxWidth: 360,
              margin: '0 auto 24px',
              lineHeight: 1.6,
            }}
          >
            Complete a few interviews to see your readiness profile
          </p>
          <Button
            size="lg"
            onClick={() => {
              window.location.href = '/setup';
            }}
          >
            Start an Interview
          </Button>
        </div>
      )}
    </div>
  );
}
