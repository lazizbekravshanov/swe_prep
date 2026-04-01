'use client';

import type { SessionFeedback } from '@/lib/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface ScorecardProps {
  feedback: SessionFeedback;
}

const decisionColors: Record<SessionFeedback['hire_decision'], string> = {
  strong_hire: 'var(--success)',
  hire: 'var(--success)',
  lean_no: 'var(--warning)',
  no_hire: 'var(--danger)',
};

const decisionBgColors: Record<SessionFeedback['hire_decision'], string> = {
  strong_hire: 'var(--success-soft)',
  hire: 'var(--success-soft)',
  lean_no: 'var(--warning-soft)',
  no_hire: 'var(--danger-soft)',
};

const decisionLabels: Record<SessionFeedback['hire_decision'], string> = {
  strong_hire: 'Strong Hire',
  hire: 'Hire',
  lean_no: 'Lean No Hire',
  no_hire: 'No Hire',
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  const fillColor =
    score >= 3 ? 'var(--success)' : score >= 2 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 6 }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 14,
            fontFamily: 'var(--font-mono), monospace',
            color: 'var(--text-secondary)',
          }}
        >
          {score}/4
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 'var(--radius-full)',
          background: 'rgba(0, 0, 0, 0.06)',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 'var(--radius-full)',
            background: fillColor,
            width: `${(score / 4) * 100}%`,
            animation: 'score-fill 0.8s var(--ease-default) forwards',
          }}
        />
      </div>
    </div>
  );
}

export function Scorecard({ feedback }: ScorecardProps) {
  return (
    <div
      className="mx-auto overflow-y-auto"
      style={{ maxWidth: 640, padding: 32 }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: 0,
          }}
        >
          Session Complete
        </h2>

        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginTop: 8,
          }}
        >
          {feedback.overall_score}/4.0
        </div>

        <span
          style={{
            display: 'inline-block',
            marginTop: 12,
            padding: '4px 14px',
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 'var(--radius-full)',
            color: decisionColors[feedback.hire_decision],
            background: decisionBgColors[feedback.hire_decision],
          }}
        >
          {decisionLabels[feedback.hire_decision]}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scores</CardTitle>
        </CardHeader>
        <div>
          <ScoreBar
            score={feedback.categories.problem_solving.score}
            label="Problem Solving"
          />
          <ScoreBar
            score={feedback.categories.coding.score}
            label="Coding"
          />
          <ScoreBar
            score={feedback.categories.communication.score}
            label="Communication"
          />
          <ScoreBar
            score={feedback.categories.edge_cases.score}
            label="Edge Cases"
          />
        </div>
      </Card>

      <div
        className="grid md:grid-cols-2"
        style={{ gap: 20, marginTop: 20 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Strengths</CardTitle>
          </CardHeader>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {feedback.strengths.map((s, i) => (
              <li
                key={i}
                className="flex items-start"
                style={{
                  gap: 8,
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    color: 'var(--success)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  +
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
          </CardHeader>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {feedback.improvements.map((s, i) => (
              <li
                key={i}
                className="flex items-start"
                style={{
                  gap: 8,
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    color: 'var(--warning)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  -
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <Card>
          <CardHeader>
            <CardTitle>Detailed Notes</CardTitle>
          </CardHeader>
          <div>
            {Object.entries(feedback.categories).map(([key, val]) => (
              <div
                key={key}
                style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  marginBottom: 12,
                  lineHeight: 1.6,
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    textTransform: 'capitalize',
                  }}
                >
                  {key.replace('_', ' ')}:
                </span>{' '}
                {val.notes}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
