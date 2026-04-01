'use client';

import { PRESSURE_LEVELS } from '@/lib/ai/pressure-levels';

interface PressureSelectorProps {
  selectedLevel: number;
  onChange: (level: number) => void;
}

export function PressureSelector({ selectedLevel, onChange }: PressureSelectorProps) {
  return (
    <div
      className="grid grid-cols-2"
      style={{ gap: 12 }}
    >
      {PRESSURE_LEVELS.map((pl) => {
        const isSelected = pl.level === selectedLevel;

        return (
          <button
            key={pl.level}
            className="frost-panel frost-panel-hover"
            onClick={() => onChange(pl.level)}
            style={{
              padding: 20,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--duration-fast) var(--ease-default)',
              border: isSelected
                ? '2px solid var(--accent)'
                : '1px solid var(--border-default)',
              boxShadow: isSelected ? '0 0 0 2px var(--accent-ring)' : undefined,
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 6 }}
            >
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {pl.name}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isSelected ? 'var(--accent)' : 'var(--text-tertiary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                L{pl.level}
              </span>
            </div>

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                margin: '0 0 8px',
                lineHeight: 1.5,
              }}
            >
              {pl.description}
            </p>

            <span
              style={{
                fontSize: 12,
                color: 'var(--text-tertiary)',
              }}
            >
              {pl.unlockRequirement}
            </span>
          </button>
        );
      })}
    </div>
  );
}
