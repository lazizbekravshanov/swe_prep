'use client';

interface StarStory {
  situation: string;
  task: string;
  action: string;
  result: string;
  quality: number;
}

interface StarBreakdownProps {
  story: StarStory;
}

interface SectionConfig {
  key: keyof Pick<StarStory, 'situation' | 'task' | 'action' | 'result'>;
  label: string;
  letter: string;
  borderColor: string;
}

const sections: SectionConfig[] = [
  { key: 'situation', label: 'SITUATION', letter: 'S', borderColor: '#3b82f6' },
  { key: 'task', label: 'TASK', letter: 'T', borderColor: 'var(--accent)' },
  { key: 'action', label: 'ACTION', letter: 'A', borderColor: 'var(--success)' },
  { key: 'result', label: 'RESULT', letter: 'R', borderColor: 'var(--warning)' },
];

function QualityDot({ filled }: { filled: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: 'var(--radius-full)',
        background: filled ? 'var(--accent)' : 'transparent',
        border: filled ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
        flexShrink: 0,
      }}
    />
  );
}

function isWeakSection(content: string): boolean {
  return !content || content.trim().length === 0;
}

export function StarBreakdown({ story }: StarBreakdownProps) {
  // Determine per-section quality: if quality is 0-4,
  // distribute dots based on overall quality
  const sectionQuality = (index: number): boolean => {
    return index < story.quality;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sections.map((section, index) => {
        const content = story[section.key];
        const weak = isWeakSection(content);

        return (
          <div
            key={section.key}
            className="frost-panel"
            style={{
              padding: '16px 20px',
              borderLeft: weak
                ? `3px dashed ${section.borderColor}`
                : `3px solid ${section.borderColor}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
            }}
          >
            {/* Left: label + quality dot */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                minWidth: 64,
                flexShrink: 0,
                paddingTop: 2,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: weak ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                }}
              >
                {section.label}
              </span>
              <QualityDot filled={sectionQuality(index)} />
            </div>

            {/* Right: content */}
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.7,
                color: weak ? 'var(--text-tertiary)' : 'var(--text-primary)',
                fontStyle: weak ? 'italic' : 'normal',
                flex: 1,
              }}
            >
              {weak ? 'This section needs more detail' : content}
            </p>
          </div>
        );
      })}

      {/* Overall quality score */}
      <div
        className="frost-panel"
        style={{
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Overall STAR Quality
        </span>
        <div className="flex items-center" style={{ gap: 6 }}>
          {[0, 1, 2, 3].map((i) => (
            <QualityDot key={i} filled={i < story.quality} />
          ))}
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginLeft: 8,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {story.quality}/4
          </span>
        </div>
      </div>
    </div>
  );
}
