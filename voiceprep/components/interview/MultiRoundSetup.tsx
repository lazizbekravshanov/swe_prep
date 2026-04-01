'use client';

import { useState } from 'react';
import {
  PRESET_CONFIGS,
  getRoundLabel,
  type MultiRoundConfig,
  type RoundConfig,
} from '@/lib/interview/multi-round';
import { Button } from '@/components/ui/Button';

interface MultiRoundSetupProps {
  onStart: (config: MultiRoundConfig) => void;
}

const presetMeta: Record<
  string,
  { name: string; description: string }
> = {
  full_onsite: {
    name: 'Full Onsite',
    description: 'Complete interview loop with all round types. The real deal.',
  },
  quick_practice: {
    name: 'Quick Practice',
    description: 'Single phone screen round. Perfect for a quick warm-up.',
  },
  coding_focus: {
    name: 'Coding Focus',
    description: 'Phone screen followed by an onsite coding round.',
  },
  senior_loop: {
    name: 'Senior Loop',
    description: 'Full onsite at hard difficulty. For senior-level prep.',
  },
};

const ROUND_TYPE_OPTIONS: RoundConfig['type'][] = [
  'phone_screen',
  'coding_onsite',
  'system_design',
  'behavioral',
];

const DIFFICULTY_OPTIONS: RoundConfig['difficulty'][] = [
  'auto',
  'easy',
  'medium',
  'hard',
];

function getTotalTime(rounds: RoundConfig[]): number {
  return rounds.reduce((sum, r) => sum + r.duration, 0);
}

export function MultiRoundSetup({ onStart }: MultiRoundSetupProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>('full_onsite');
  const [useCustom, setUseCustom] = useState(false);
  const [customRounds, setCustomRounds] = useState<RoundConfig[]>([
    { type: 'phone_screen', duration: 45, problemCount: 1, difficulty: 'auto' },
  ]);

  const handleStart = () => {
    if (useCustom) {
      onStart({
        company: '',
        candidateLevel: 'mid',
        rounds: customRounds,
      });
    } else if (selectedPreset && PRESET_CONFIGS[selectedPreset]) {
      onStart(PRESET_CONFIGS[selectedPreset]);
    }
  };

  const addRound = () => {
    setCustomRounds((prev) => [
      ...prev,
      { type: 'phone_screen', duration: 45, problemCount: 1, difficulty: 'auto' },
    ]);
  };

  const removeRound = (idx: number) => {
    setCustomRounds((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRound = (idx: number, patch: Partial<RoundConfig>) => {
    setCustomRounds((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    );
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}
      >
        Multi-Round Interview
      </h2>
      <p
        style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          marginBottom: 32,
          lineHeight: 1.5,
        }}
      >
        Choose a preset interview loop or build your own custom configuration.
      </p>

      {/* Preset Cards */}
      {!useCustom && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {Object.entries(presetMeta).map(([key, meta]) => {
            const config = PRESET_CONFIGS[key];
            const isSelected = selectedPreset === key;

            return (
              <div
                key={key}
                className="frost-panel frost-panel-hover"
                onClick={() => setSelectedPreset(key)}
                style={{
                  padding: 20,
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--accent)' : undefined,
                  borderWidth: isSelected ? 2 : undefined,
                  transition:
                    'border-color var(--duration-fast) var(--ease-default)',
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                  }}
                >
                  {meta.name}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                    marginBottom: 12,
                  }}
                >
                  {meta.description}
                </p>

                {/* Round list */}
                <div style={{ marginBottom: 8 }}>
                  {config.rounds.map((round, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        padding: '3px 0',
                      }}
                    >
                      <span>{getRoundLabel(round.type)}</span>
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--text-tertiary)',
                          fontFamily: 'var(--font-mono), monospace',
                        }}
                      >
                        {round.duration}m
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total time */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text-tertiary)',
                    borderTop: '1px dashed var(--border-default)',
                    paddingTop: 8,
                  }}
                >
                  Total: {getTotalTime(config.rounds)} min
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom builder */}
      {useCustom && (
        <div
          className="frost-panel"
          style={{ padding: 24, marginBottom: 24 }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 16,
            }}
          >
            Custom Rounds
          </h3>

          {customRounds.map((round, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
                padding: 12,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  minWidth: 24,
                }}
              >
                {idx + 1}.
              </span>

              {/* Type */}
              <select
                value={round.type}
                onChange={(e) =>
                  updateRound(idx, {
                    type: e.target.value as RoundConfig['type'],
                  })
                }
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: 13,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                }}
              >
                {ROUND_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {getRoundLabel(t)}
                  </option>
                ))}
              </select>

              {/* Duration */}
              <input
                type="number"
                value={round.duration}
                onChange={(e) =>
                  updateRound(idx, { duration: Number(e.target.value) })
                }
                min={10}
                max={90}
                style={{
                  width: 64,
                  padding: '6px 10px',
                  fontSize: 13,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                min
              </span>

              {/* Difficulty */}
              <select
                value={round.difficulty}
                onChange={(e) =>
                  updateRound(idx, {
                    difficulty: e.target.value as RoundConfig['difficulty'],
                  })
                }
                style={{
                  width: 90,
                  padding: '6px 10px',
                  fontSize: 13,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                }}
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>

              {/* Remove */}
              {customRounds.length > 1 && (
                <button
                  onClick={() => removeRound(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 16,
                    color: 'var(--text-tertiary)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--danger)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }}
                  aria-label="Remove round"
                >
                  x
                </button>
              )}
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={addRound}
            style={{ marginTop: 4 }}
          >
            + Add Round
          </Button>

          <div
            style={{
              fontSize: 13,
              color: 'var(--text-tertiary)',
              marginTop: 12,
              borderTop: '1px dashed var(--border-default)',
              paddingTop: 10,
            }}
          >
            Total: {getTotalTime(customRounds)} min
          </div>
        </div>
      )}

      {/* Toggle + Start */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setUseCustom((prev) => !prev);
            setSelectedPreset(prev => prev ? null : 'full_onsite');
          }}
        >
          {useCustom ? 'Use presets' : 'Build custom'}
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleStart}
          disabled={!useCustom && !selectedPreset}
        >
          Start Multi-Round
        </Button>
      </div>
    </div>
  );
}
