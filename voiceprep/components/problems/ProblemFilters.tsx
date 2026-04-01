'use client';

import type { Category, Difficulty } from '@/lib/types';

interface ProblemFiltersProps {
  selectedCategory: Category | 'all';
  selectedDifficulty: Difficulty | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  onDifficultyChange: (difficulty: Difficulty | 'all') => void;
}

const categories: (Category | 'all')[] = [
  'all',
  'arrays',
  'strings',
  'trees',
  'graphs',
  'dp',
  'system_design',
];
const difficulties: (Difficulty | 'all')[] = ['all', 'easy', 'medium', 'hard'];

function formatLabel(value: string): string {
  if (value === 'all') return 'All';
  if (value === 'dp') return 'DP';
  if (value === 'system_design') return 'System Design';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ProblemFilters({
  selectedCategory,
  selectedDifficulty,
  onCategoryChange,
  onDifficultyChange,
}: ProblemFiltersProps) {
  return (
    <div className="flex flex-wrap" style={{ gap: 24 }}>
      <div className="flex items-center" style={{ gap: 10 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-tertiary)',
          }}
        >
          Category
        </span>
        <div className="flex" style={{ gap: 4 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: `all var(--duration-fast) var(--ease-default)`,
                background:
                  selectedCategory === cat
                    ? 'var(--accent)'
                    : 'var(--bg-surface)',
                color:
                  selectedCategory === cat
                    ? 'var(--text-inverse)'
                    : 'var(--text-secondary)',
                backdropFilter:
                  selectedCategory !== cat
                    ? 'blur(12px) saturate(150%)'
                    : undefined,
              }}
            >
              {formatLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center" style={{ gap: 10 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-tertiary)',
          }}
        >
          Difficulty
        </span>
        <div className="flex" style={{ gap: 4 }}>
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => onDifficultyChange(diff)}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: `all var(--duration-fast) var(--ease-default)`,
                background:
                  selectedDifficulty === diff
                    ? 'var(--accent)'
                    : 'var(--bg-surface)',
                color:
                  selectedDifficulty === diff
                    ? 'var(--text-inverse)'
                    : 'var(--text-secondary)',
                backdropFilter:
                  selectedDifficulty !== diff
                    ? 'blur(12px) saturate(150%)'
                    : undefined,
              }}
            >
              {formatLabel(diff)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
