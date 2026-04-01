'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewStore } from '@/store/interview-store';
import { Scorecard } from '@/components/feedback/Scorecard';
import { Button } from '@/components/ui/Button';
import type { ConversationTurn, SessionFeedback } from '@/lib/types';

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
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

function Spinner() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        border: '3px solid var(--border-default)',
        borderTopColor: 'var(--accent)',
        borderRadius: 'var(--radius-full)',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}

function TranscriptSection({ transcript }: { transcript: ConversationTurn[] }) {
  return (
    <div
      className="frost-panel scrollbar-thin"
      style={{
        maxHeight: 480,
        overflowY: 'auto',
        padding: '12px 24px',
        marginTop: 16,
      }}
    >
      {transcript.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-tertiary)', padding: '24px 0' }}>
          No transcript available.
        </p>
      )}
      {transcript.map((turn, i) => {
        const isInterviewer = turn.role === 'interviewer';
        return (
          <div key={i}>
            {i > 0 && <hr style={dividerStyle} />}
            <div style={{ padding: '14px 0' }}>
              <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span
                  style={{
                    ...labelStyle,
                    color: isInterviewer ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                  }}
                >
                  {isInterviewer ? 'ALEX (INTERVIEWER)' : 'YOU'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTimestamp(turn.timestamp)}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
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
    </div>
  );
}

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [showTranscript, setShowTranscript] = useState(false);

  const transcript = useInterviewStore((s) => s.transcript);
  const state = useInterviewStore((s) => s.state);

  // For MVP: construct feedback from store data if session has ended
  // In production this would come from a DB lookup by sessionId
  const feedback: SessionFeedback | null = state === 'ended'
    ? {
        overall_score: 0,
        categories: {
          problem_solving: { score: 0, notes: '' },
          coding: { score: 0, notes: '' },
          communication: { score: 0, notes: '' },
          edge_cases: { score: 0, notes: '' },
        },
        strengths: [],
        improvements: [],
        hire_decision: 'lean_no',
        transcript,
      }
    : null;

  // Loading state — no feedback yet
  if (!feedback) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 16 }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <Spinner />
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>
          Generating feedback...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 640, padding: '32px 24px' }}>
      {/* Page title */}
      <h1
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          margin: 0,
          textAlign: 'center',
        }}
      >
        Interview Feedback
      </h1>

      {/* Scorecard */}
      <div style={{ marginTop: 24 }}>
        <Scorecard feedback={feedback} />
      </div>

      {/* Action buttons */}
      <div
        className="flex items-center justify-center"
        style={{ gap: 12, marginTop: 32 }}
      >
        <Button size="md" onClick={() => router.push('/setup')}>
          Practice Again
        </Button>
        <Button
          size="md"
          variant="secondary"
          onClick={() => setShowTranscript(!showTranscript)}
        >
          {showTranscript ? 'Hide Transcript' : 'View Transcript'}
        </Button>
      </div>

      {/* Expandable transcript section */}
      {showTranscript && (
        <div style={{ marginTop: 24 }}>
          <TranscriptSection transcript={feedback.transcript} />
        </div>
      )}
    </div>
  );
}
