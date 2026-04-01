'use client';

import { useEffect, useState } from 'react';
import { computeBenchmarks, type Benchmark } from '@/lib/analytics/benchmarks';
import { getSessionRecords } from '@/lib/analytics/weakness-detector';

export function BenchmarkCard() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);

  useEffect(() => {
    const records = getSessionRecords();
    setBenchmarks(computeBenchmarks(records));
  }, []);

  if (benchmarks.length === 0) {
    return (
      <div className="frost-panel" style={{ padding: 24 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
          }}
        >
          Peer Comparison
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>
          Complete 3+ sessions to see how you compare.
        </p>
      </div>
    );
  }

  return (
    <div className="frost-panel" style={{ padding: 24 }}>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 16px',
        }}
      >
        Peer Comparison
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {benchmarks.map((b) => (
          <div key={b.metric}>
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 4 }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                {b.metric}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Top {100 - b.percentile}%
                {b.trend === 'improving' && (
                  <span style={{ color: 'var(--success)', marginLeft: 6 }}>&#9650;</span>
                )}
                {b.trend === 'declining' && (
                  <span style={{ color: 'var(--danger)', marginLeft: 6 }}>&#9660;</span>
                )}
                {b.trend === 'stable' && (
                  <span style={{ color: 'var(--text-tertiary)', marginLeft: 6 }}>&#8212;</span>
                )}
              </span>
            </div>

            {/* Percentile bar */}
            <div
              style={{
                height: 6,
                borderRadius: 'var(--radius-full)',
                background: 'rgba(0,0,0,0.06)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 'var(--radius-full)',
                  width: `${b.percentile}%`,
                  background:
                    b.percentile >= 70
                      ? 'var(--success)'
                      : b.percentile >= 40
                        ? 'var(--accent)'
                        : 'var(--warning)',
                  transition: 'width 0.8s ease',
                }}
              />
              {/* Marker at user position */}
              <div
                style={{
                  position: 'absolute',
                  top: -3,
                  left: `${b.percentile}%`,
                  transform: 'translateX(-50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'white',
                  border: '2px solid var(--accent)',
                }}
              />
            </div>

            <div
              style={{
                fontSize: 11,
                color: 'var(--text-tertiary)',
                marginTop: 4,
              }}
            >
              {b.cohort} &middot; Score: {b.userValue}/4
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
