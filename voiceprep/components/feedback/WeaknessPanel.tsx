'use client';

import { useEffect, useState } from 'react';
import {
  getSessionRecords,
  detectWeaknesses,
  type WeaknessSignal,
  type SessionRecord,
} from '@/lib/analytics/weakness-detector';
import {
  getReviewQueue,
  getDueProblems,
  type ReviewItem,
} from '@/lib/analytics/spaced-repetition';
import { Button } from '@/components/ui/Button';

// ─── Circular percentage indicator ───

function ReadinessRing({
  label,
  percentage,
}: {
  label: string;
  percentage: number;
}) {
  const size = 88;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color =
    percentage >= 75
      ? 'var(--success)'
      : percentage >= 50
        ? 'var(--warning)'
        : 'var(--danger)';

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0, 0, 0, 0.06)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: `stroke-dashoffset var(--duration-slow) var(--ease-default)`,
            }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono), monospace',
          }}
        >
          {Math.round(percentage)}%
        </div>
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textTransform: 'capitalize',
        }}
      >
        {label.replace('_', ' ')}
      </div>
    </div>
  );
}

// ─── Severity badge ───

function SeverityBadge({ severity }: { severity: WeaknessSignal['severity'] }) {
  const colorMap: Record<WeaknessSignal['severity'], { color: string; bg: string }> = {
    high: { color: 'var(--danger)', bg: 'var(--danger-soft)' },
    medium: { color: 'var(--warning)', bg: 'var(--warning-soft)' },
    low: { color: 'var(--accent)', bg: 'var(--accent-soft)' },
  };

  const { color, bg } = colorMap[severity];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 'var(--radius-full)',
        color,
        background: bg,
        textTransform: 'capitalize',
      }}
    >
      {severity}
    </span>
  );
}

// ─── Trend arrow ───

function TrendIndicator({ trend }: { trend: WeaknessSignal['trend'] }) {
  const config: Record<
    WeaknessSignal['trend'],
    { symbol: string; color: string; label: string }
  > = {
    improving: { symbol: '\u2191', color: 'var(--success)', label: 'Improving' },
    stable: { symbol: '\u2192', color: 'var(--text-tertiary)', label: 'Stable' },
    declining: { symbol: '\u2193', color: 'var(--danger)', label: 'Declining' },
  };

  const { symbol, color, label } = config[trend];

  return (
    <span
      style={{ fontSize: 13, fontWeight: 500, color }}
      title={label}
    >
      {symbol} {label}
    </span>
  );
}

// ─── Main panel ───

export function WeaknessPanel() {
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [weaknesses, setWeaknesses] = useState<WeaknessSignal[]>([]);
  const [dueItems, setDueItems] = useState<ReviewItem[]>([]);

  useEffect(() => {
    const sessionRecords = getSessionRecords();
    setRecords(sessionRecords);
    setWeaknesses(detectWeaknesses(sessionRecords));

    const queue = getReviewQueue();
    setDueItems(getDueProblems(queue));
  }, []);

  // Calculate readiness percentages from recent sessions (last 10)
  const recentScored = records
    .filter((r) => r.feedback !== null)
    .slice(-10);

  const categories = ['problem_solving', 'coding', 'communication', 'edge_cases'] as const;

  const readiness: Record<string, number> = {};
  for (const cat of categories) {
    if (recentScored.length === 0) {
      readiness[cat] = 0;
    } else {
      const avg =
        recentScored.reduce(
          (sum, r) => sum + r.feedback!.categories[cat].score,
          0,
        ) / recentScored.length;
      readiness[cat] = Math.min(100, avg * 25); // 4.0 -> 100%
    }
  }

  // Find weakest topic for CTA
  const weakestTopic = weaknesses.length > 0 ? weaknesses[0].topic : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Readiness rings */}
      <div className="frost-panel" style={{ padding: 24 }}>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 20,
          }}
        >
          Readiness Scores
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}
        >
          {categories.map((cat) => (
            <ReadinessRing
              key={cat}
              label={cat}
              percentage={readiness[cat]}
            />
          ))}
        </div>
      </div>

      {/* Areas to Focus */}
      {weaknesses.length > 0 && (
        <div className="frost-panel" style={{ padding: 24 }}>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}
          >
            Areas to Focus
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {weaknesses.map((w, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {w.topic}
                    </span>
                    <SeverityBadge severity={w.severity} />
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {w.evidence}
                  </p>
                </div>
                <TrendIndicator trend={w.trend} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due for Review */}
      {dueItems.length > 0 && (
        <div className="frost-panel" style={{ padding: 24 }}>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}
          >
            Due for Review
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dueItems.map((item) => (
              <div
                key={item.problemSlug}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {item.problemTitle}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-tertiary)',
                      marginTop: 2,
                    }}
                  >
                    Last practiced{' '}
                    {new Date(item.dueDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: 'var(--font-mono), monospace',
                    color:
                      item.lastScore >= 3
                        ? 'var(--success)'
                        : item.lastScore >= 2
                          ? 'var(--warning)'
                          : 'var(--danger)',
                  }}
                >
                  {item.lastScore}/4
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {weakestTopic && (
        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <Button
            size="lg"
            onClick={() => {
              window.location.href = `/setup?focus=${encodeURIComponent(weakestTopic)}`;
            }}
          >
            Practice your weakest topic
          </Button>
        </div>
      )}
    </div>
  );
}
