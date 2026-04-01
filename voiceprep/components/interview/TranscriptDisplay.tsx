'use client';

import { useEffect, useRef } from 'react';
import type { ConversationTurn } from '@/lib/types';

interface TranscriptDisplayProps {
  transcript: ConversationTurn[];
  interimTranscript: string;
}

const labelStyle = {
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
};

const timestampStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-tertiary)',
  fontVariantNumeric: 'tabular-nums',
  flexShrink: 0,
};

const dividerStyle: React.CSSProperties = {
  border: 'none',
  borderTop: '1px dashed var(--border-default)',
  margin: 0,
};

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function TranscriptDisplay({ transcript, interimTranscript }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [transcript, interimTranscript]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto scrollbar-thin"
      style={{ scrollBehavior: 'smooth', padding: '20px 24px' }}
    >
      {transcript.length === 0 && !interimTranscript && (
        <p
          style={{
            textAlign: 'center',
            fontSize: '14px',
            color: 'var(--text-tertiary)',
            padding: '48px 0',
          }}
        >
          Start the interview to begin the conversation...
        </p>
      )}

      {transcript.map((turn, i) => {
        const isInterviewer = turn.role === 'interviewer';

        return (
          <div key={i}>
            {i > 0 && <hr style={dividerStyle} />}
            <div style={{ padding: '16px 0' }}>
              <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <span
                  style={{
                    ...labelStyle,
                    color: isInterviewer ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                  }}
                >
                  {isInterviewer ? 'ALEX (INTERVIEWER)' : 'YOU'}
                </span>
                <span style={timestampStyle}>
                  {formatTimestamp(turn.timestamp)}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: isInterviewer ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {turn.text}
              </p>
            </div>
          </div>
        );
      })}

      {interimTranscript && (
        <div>
          {transcript.length > 0 && <hr style={dividerStyle} />}
          <div style={{ padding: '16px 0' }}>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span
                style={{
                  ...labelStyle,
                  color: 'var(--text-secondary)',
                }}
              >
                YOU
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: 1.7,
                color: 'var(--text-tertiary)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent)',
                  marginRight: '8px',
                  verticalAlign: 'middle',
                  animation: 'blink-dot 1s ease-in-out infinite',
                }}
              />
              {interimTranscript}
            </p>
          </div>
          <style>{`@keyframes blink-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
        </div>
      )}
    </div>
  );
}
