'use client';

import { useState } from 'react';
import type { ExecutionResult } from '@/lib/execution/types';

interface ExecutionResultsProps {
  result: ExecutionResult | null;
  isRunning: boolean;
}

export function ExecutionResults({ result, isRunning }: ExecutionResultsProps) {
  const [expanded, setExpanded] = useState(false);

  if (isRunning) {
    return (
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border-default)',
          fontSize: 13,
          color: 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            border: '2px solid var(--border-default)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
        Running...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div style={{ borderTop: '1px solid var(--border-default)' }}>
      {/* Summary bar — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        {/* Test dots */}
        <div style={{ display: 'flex', gap: 4 }}>
          {result.results.map((r, i) => (
            <div
              key={i}
              title={`Test ${i + 1}: ${r.passed ? 'PASS' : 'FAIL'}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: r.passed ? 'var(--success)' : 'var(--danger)',
              }}
            />
          ))}
        </div>

        <span style={{ color: result.success ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
          {result.totalPassed}/{result.totalTests} passed
        </span>

        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2}
          style={{
            marginLeft: 'auto',
            color: 'var(--text-tertiary)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: '0 16px 12px' }}>
          {result.results.map((r, i) => (
            <div
              key={i}
              style={{
                padding: '8px 0',
                borderTop: i > 0 ? '1px solid var(--border-default)' : undefined,
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: r.passed ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {r.passed ? 'PASS' : 'FAIL'}
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>Test {i + 1}</span>
                {r.executionTimeMs > 0 && (
                  <span style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                    {r.executionTimeMs}ms
                  </span>
                )}
              </div>

              {!r.passed && (
                <div
                  style={{
                    background: 'var(--bg-code)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px',
                    fontFamily: 'var(--font-mono), monospace',
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ color: 'var(--text-tertiary)' }}>
                    Input: <span style={{ color: 'var(--text-secondary)' }}>{r.input}</span>
                  </div>
                  <div style={{ color: 'var(--text-tertiary)' }}>
                    Expected: <span style={{ color: 'var(--success)' }}>{r.expectedOutput}</span>
                  </div>
                  <div style={{ color: 'var(--text-tertiary)' }}>
                    Got: <span style={{ color: 'var(--danger)' }}>{r.actualOutput}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
