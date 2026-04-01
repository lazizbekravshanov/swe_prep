'use client';

import type { Problem, LeetCodeProblem, Difficulty } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

type AnyProblem = Problem | LeetCodeProblem;

interface ProblemDisplayProps {
  problem: AnyProblem;
}

function normalizeDifficulty(d: string): Difficulty {
  return d.toLowerCase() as Difficulty;
}

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--text-tertiary)',
  margin: '0 0 8px 0',
};

const frostPillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 10px',
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  background: 'rgba(0, 0, 0, 0.03)',
  borderRadius: 'var(--radius-full)',
};

export function ProblemDisplay({ problem }: ProblemDisplayProps) {
  const difficulty = normalizeDifficulty(problem.difficulty);
  const isHandcrafted = 'examples' in problem;

  if (isHandcrafted) {
    const p = problem as Problem;
    return (
      <div className="frost-panel" style={{ padding: '24px' }}>
        {/* Title + badges */}
        <div className="flex flex-wrap" style={{ alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            {p.title}
          </h2>
          <Badge variant={difficulty}>{difficulty}</Badge>
          <Badge>{p.category}</Badge>
        </div>

        {/* Description */}
        <p
          style={{
            margin: '0 0 20px 0',
            fontSize: '14px',
            lineHeight: 1.7,
            color: 'var(--text-primary)',
          }}
        >
          {p.description}
        </p>

        {/* Examples */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={sectionHeadingStyle}>Examples</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {p.examples.map((ex, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-code)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono), ui-monospace, monospace',
                  fontSize: '13px',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Input: </span>
                  {ex.input}
                </div>
                <div style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Output: </span>
                  {ex.output}
                </div>
                {ex.explanation && (
                  <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div>
          <h4 style={sectionHeadingStyle}>Constraints</h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: '18px',
              fontSize: '13px',
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
            }}
          >
            {p.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // LeetCode problem
  const lc = problem as LeetCodeProblem;

  return (
    <div className="frost-panel" style={{ padding: '24px' }}>
      {/* Title + badge */}
      <div className="flex flex-wrap" style={{ alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
        >
          {lc.title}
        </h2>
        <Badge variant={difficulty}>{difficulty}</Badge>
      </div>

      {/* Topics */}
      {lc.topics.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: '6px', marginBottom: '16px' }}>
          {lc.topics.map((t) => (
            <span key={t} style={frostPillStyle}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Acceptance rate */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          marginBottom: '16px',
          fontSize: '13px',
        }}
      >
        <span style={{ color: 'var(--text-tertiary)' }}>Acceptance Rate</span>
        <span
          style={{
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
            fontWeight: 500,
          }}
        >
          {lc.acceptance_rate.toFixed(1)}%
        </span>
      </div>

      {/* Link */}
      {lc.link && (
        <a
          href={lc.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--accent)',
            textDecoration: 'none',
            transition: `color var(--duration-fast) var(--ease-default)`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
        >
          View on LeetCode
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}

      <p
        style={{
          margin: '16px 0 0 0',
          fontSize: '12px',
          color: 'var(--text-tertiary)',
          fontStyle: 'italic',
        }}
      >
        The AI interviewer will present this problem verbally during the interview.
      </p>
    </div>
  );
}
