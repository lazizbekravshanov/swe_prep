'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { ConversationTurn, SessionFeedback } from '@/lib/types';
import { Spinner } from '@/components/ui/Spinner';

interface Annotation {
  timestamp: number;
  type: 'positive' | 'negative' | 'tip' | 'insight';
  text: string;
  category: 'communication' | 'problem_solving' | 'coding' | 'edge_cases' | 'timing';
}

interface SessionReplayProps {
  transcript: ConversationTurn[];
  codeSnapshot: string;
  feedback: SessionFeedback | null;
}

const typeBorderColors: Record<Annotation['type'], string> = {
  positive: 'var(--success)',
  negative: 'var(--danger)',
  tip: 'var(--accent)',
  insight: 'var(--warning)',
};

const categoryLabels: Record<Annotation['category'], string> = {
  communication: 'Communication',
  problem_solving: 'Problem Solving',
  coding: 'Coding',
  edge_cases: 'Edge Cases',
  timing: 'Timing',
};

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SessionReplay({ transcript, codeSnapshot, feedback }: SessionReplayProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const transcriptRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    async function fetchCommentary() {
      try {
        const res = await fetch('/api/replay/commentary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript,
            codeSnapshot,
            feedback,
          }),
        });

        if (!res.ok) throw new Error('Failed to fetch commentary');

        const data: Annotation[] = await res.json();
        setAnnotations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchCommentary();
  }, [transcript, codeSnapshot, feedback]);

  const scrollToTimestamp = useCallback((timestamp: number) => {
    // Find the closest transcript turn to this timestamp
    let closestIdx = 0;
    let closestDiff = Infinity;
    transcript.forEach((turn, idx) => {
      const diff = Math.abs(turn.timestamp - timestamp);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIdx = idx;
      }
    });

    const el = transcriptRefs.current.get(closestIdx);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.background = 'var(--bg-active)';
      setTimeout(() => {
        el.style.background = 'transparent';
      }, 1500);
    }
  }, [transcript]);

  // Compute silence gaps between turns
  const silenceGaps: { afterIndex: number; duration: number }[] = [];
  for (let i = 0; i < transcript.length - 1; i++) {
    const gap = transcript[i + 1].timestamp - transcript[i].timestamp;
    if (gap > 5) {
      silenceGaps.push({ afterIndex: i, duration: gap });
    }
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Two-column layout */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        {/* Left column: Transcript */}
        <div
          className="frost-panel scrollbar-thin"
          style={{
            flex: '0 0 60%',
            maxHeight: 600,
            overflowY: 'auto',
            padding: 24,
          }}
        >
          <h3
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 20,
              margin: 0,
              paddingBottom: 16,
            }}
          >
            Session Transcript
          </h3>

          {transcript.map((turn, idx) => {
            const silenceAfter = silenceGaps.find((g) => g.afterIndex === idx);

            return (
              <div key={idx}>
                <div
                  ref={(el) => {
                    if (el) transcriptRefs.current.set(idx, el);
                  }}
                  style={{
                    padding: '12px 0',
                    borderBottom:
                      idx < transcript.length - 1
                        ? '1px dashed var(--border-default)'
                        : 'none',
                    transition: 'background var(--duration-normal) var(--ease-default)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color:
                          turn.role === 'interviewer'
                            ? 'var(--accent)'
                            : 'var(--success)',
                      }}
                    >
                      {turn.role}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-mono), monospace',
                      }}
                    >
                      {formatTimestamp(turn.timestamp)}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {turn.text}
                  </p>
                </div>

                {silenceAfter && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 0',
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(0, 0, 0, 0.06)',
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-mono), monospace',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {Math.round(silenceAfter.duration)}s silence
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(0, 0, 0, 0.06)',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column: AI Commentary */}
        <div
          className="frost-panel scrollbar-thin"
          style={{
            flex: '0 0 calc(40% - 24px)',
            maxHeight: 600,
            overflowY: 'auto',
            padding: 24,
          }}
        >
          <h3
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 20,
              margin: 0,
              paddingBottom: 16,
            }}
          >
            AI Commentary
          </h3>

          {loading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
                gap: 12,
              }}
            >
              <Spinner size="md" />
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                }}
              >
                Generating commentary...
              </span>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: 16,
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-soft)',
                color: 'var(--danger)',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            annotations.map((ann, idx) => (
              <div
                key={idx}
                onClick={() => scrollToTimestamp(ann.timestamp)}
                style={{
                  padding: '12px 16px',
                  marginBottom: 12,
                  borderLeft: `3px solid ${typeBorderColors[ann.type]}`,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'background var(--duration-fast) var(--ease-default)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-surface)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: 'var(--font-mono), monospace',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {formatTimestamp(ann.timestamp)}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: 'var(--radius-full)',
                      padding: '1px 8px',
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      background: 'rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {categoryLabels[ann.category]}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: 'var(--text-primary)',
                  }}
                >
                  {ann.text}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Code Snapshot */}
      <div
        className="frost-panel"
        style={{
          background: 'var(--bg-code)',
          padding: 24,
        }}
      >
        <h3
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 16,
            margin: 0,
            paddingBottom: 12,
          }}
        >
          Code Snapshot
        </h3>
        <pre
          style={{
            margin: 0,
            padding: 16,
            fontSize: 13,
            lineHeight: 1.6,
            fontFamily: 'var(--font-mono), monospace',
            color: 'var(--text-primary)',
            background: 'transparent',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            userSelect: 'text',
          }}
        >
          <code>{codeSnapshot}</code>
        </pre>
      </div>
    </div>
  );
}
