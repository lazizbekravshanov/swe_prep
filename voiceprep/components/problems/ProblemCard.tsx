'use client';

import type { Problem } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface ProblemCardProps {
  problem: Problem;
  onSelect: (problem: Problem) => void;
}

export function ProblemCard({ problem, onSelect }: ProblemCardProps) {
  return (
    <button
      onClick={() => onSelect(problem)}
      className="frost-panel frost-panel-hover w-full text-left"
      style={{
        padding: 20,
        cursor: 'pointer',
        transition: `all var(--duration-normal) var(--ease-default)`,
      }}
    >
      <div
        className="flex items-start justify-between"
        style={{ gap: 12 }}
      >
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {problem.title}
        </h3>
        <Badge variant={problem.difficulty}>{problem.difficulty}</Badge>
      </div>

      <p
        className="line-clamp-2"
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          marginTop: 10,
          lineHeight: 1.5,
          margin: '10px 0 0',
        }}
      >
        {problem.description}
      </p>

      <div className="flex flex-wrap" style={{ gap: 6, marginTop: 12 }}>
        {problem.companies.slice(0, 3).map((c) => (
          <span
            key={c}
            style={{
              fontSize: 12,
              color: 'var(--text-tertiary)',
              background: 'rgba(0, 0, 0, 0.04)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 8px',
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </button>
  );
}
