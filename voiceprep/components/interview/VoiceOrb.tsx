'use client';

import type { SessionState } from '@/lib/types';

interface VoiceOrbProps {
  state: SessionState;
  size?: number;
  audioLevel?: number; // 0.0 to 1.0, drives listening animation scale
}

const stateLabels: Record<SessionState, string> = {
  idle: 'Ready to start',
  listening: 'Listening',
  processing: 'Thinking',
  speaking: 'Alex is speaking',
  paused: 'Paused',
  ended: 'Session ended',
};

export function VoiceOrb({ state, size = 120, audioLevel = 0 }: VoiceOrbProps) {
  const isActive = state === 'listening' || state === 'speaking';
  const isDimmed = state === 'paused' || state === 'ended';

  const orbStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all var(--duration-slow) var(--ease-default)',
    opacity: isDimmed ? 0.4 : 1,
    background:
      state === 'speaking'
        ? 'radial-gradient(circle at 35% 35%, rgba(22, 100, 214, 0.25) 0%, rgba(22, 100, 214, 0.12) 50%, rgba(22, 100, 214, 0.04) 100%)'
        : state === 'listening'
          ? 'radial-gradient(circle at 35% 35%, rgba(22, 100, 214, 0.20) 0%, rgba(22, 100, 214, 0.10) 50%, rgba(22, 100, 214, 0.03) 100%)'
          : 'radial-gradient(circle at 35% 35%, rgba(22, 100, 214, 0.15) 0%, rgba(22, 100, 214, 0.08) 50%, rgba(22, 100, 214, 0.03) 100%)',
    border: `1.5px solid rgba(22, 100, 214, ${isActive ? '0.4' : '0.15'})`,
  };

  // Animation config per state — using non-shorthand properties only
  const animConfig: Record<string, { name: string; duration: string }> = {
    idle: { name: 'voice-breathe', duration: '3s' },
    listening: { name: 'voice-listen', duration: '0.8s' },
    processing: { name: 'voice-think', duration: '2s' },
    speaking: { name: 'voice-speak', duration: '1.5s' },
    paused: { name: 'none', duration: '0s' },
    ended: { name: 'none', duration: '0s' },
  };

  const anim = animConfig[state] ?? { name: 'none', duration: '0s' };

  // When listening, drive ring scale from audio level instead of CSS animation
  const listeningScale = state === 'listening' ? 1 + audioLevel * 0.2 : undefined;

  const ringStyle: React.CSSProperties = {
    position: 'absolute',
    inset: -8,
    borderRadius: '50%',
    border: `1px solid rgba(22, 100, 214, ${isActive ? '0.15' : '0.08'})`,
    animationName: state === 'listening' ? 'none' : anim.name,
    animationDuration: anim.duration,
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    transform: listeningScale ? `scale(${listeningScale})` : undefined,
    transition: state === 'listening' ? 'transform 100ms ease-out' : undefined,
    pointerEvents: 'none',
  };

  const outerRingStyle: React.CSSProperties = {
    position: 'absolute',
    inset: -16,
    borderRadius: '50%',
    border: `1px solid rgba(22, 100, 214, ${isActive ? '0.08' : '0.04'})`,
    animationName: isActive ? anim.name : 'none',
    animationDuration: anim.duration,
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationDelay: '0.3s',
    pointerEvents: 'none',
  };

  // Mic icon for idle/listening, speaker for speaking, pause for paused
  const iconColor = isActive ? 'rgba(22, 100, 214, 0.7)' : 'rgba(22, 100, 214, 0.4)';

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        style={orbStyle}
        data-state={state}
        role="status"
        aria-live="polite"
        aria-label={stateLabels[state]}
      >
        <div style={ringStyle} />
        <div style={outerRingStyle} />

        {/* Center icon */}
        {(state === 'idle' || state === 'listening') && (
          <svg width={size * 0.28} height={size * 0.28} viewBox="0 0 20 20" fill="none">
            <path
              d="M10 1.5a2.5 2.5 0 00-2.5 2.5v4a2.5 2.5 0 005 0V4A2.5 2.5 0 0010 1.5z"
              fill={iconColor}
            />
            <path
              d="M5 8a1 1 0 00-2 0 7 7 0 006 6.93V17H6.5a1 1 0 000 2h7a1 1 0 000-2H11v-2.07A7 7 0 0017 8a1 1 0 00-2 0 5 5 0 01-10 0z"
              fill={iconColor}
            />
          </svg>
        )}
        {state === 'speaking' && (
          <svg width={size * 0.28} height={size * 0.28} viewBox="0 0 20 20" fill="none">
            <path
              d="M9.383 3.076A1 1 0 0111 4v12a1 1 0 01-1.617.786L5.07 13H3a1 1 0 01-1-1V8a1 1 0 011-1h2.07l4.313-3.924z"
              fill={iconColor}
            />
            <path
              d="M14.657 5.343a1 1 0 011.414 0A7.948 7.948 0 0118 10a7.948 7.948 0 01-1.929 4.657 1 1 0 01-1.49-1.334A5.948 5.948 0 0016 10a5.948 5.948 0 00-1.419-3.323 1 1 0 010-1.334z"
              fill={iconColor}
            />
            <path
              d="M12.828 7.172a1 1 0 011.414 0A3.978 3.978 0 0115.5 10a3.978 3.978 0 01-1.258 2.828 1 1 0 11-1.414-1.414A1.978 1.978 0 0013.5 10c0-.536-.214-1.05-.672-1.414a1 1 0 010-1.414z"
              fill={iconColor}
            />
          </svg>
        )}
        {state === 'processing' && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: iconColor,
                  animation: `voice-think 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
        {state === 'paused' && (
          <svg width={size * 0.22} height={size * 0.22} viewBox="0 0 20 20" fill="none">
            <rect x="5" y="4" width="3.5" height="12" rx="1" fill={iconColor} />
            <rect x="11.5" y="4" width="3.5" height="12" rx="1" fill={iconColor} />
          </svg>
        )}
      </div>

      {/* State label */}
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
          transition: 'color var(--duration-normal) var(--ease-default)',
        }}
      >
        {stateLabels[state]}
      </span>
    </div>
  );
}
