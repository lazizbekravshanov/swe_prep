'use client';

import type { SessionState } from '@/lib/types';

interface VoiceIndicatorProps {
  state: SessionState;
  isMicActive: boolean;
}

const stateLabels: Record<SessionState, string> = {
  idle: 'Ready',
  listening: 'Listening...',
  processing: 'Thinking...',
  speaking: 'Interviewer speaking...',
  paused: 'Paused',
  ended: 'Session ended',
};

export function VoiceIndicator({ state, isMicActive }: VoiceIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Pulsing dot */}
      <div className="relative flex h-4 w-4 items-center justify-center">
        {(state === 'listening' || state === 'speaking') && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              state === 'listening' ? 'bg-green-400' : 'bg-blue-400'
            }`}
          />
        )}
        <span
          className={`relative inline-flex h-3 w-3 rounded-full ${
            state === 'idle'
              ? 'bg-zinc-500'
              : state === 'listening'
                ? 'bg-green-500'
                : state === 'processing'
                  ? 'bg-yellow-500 animate-pulse'
                  : state === 'speaking'
                    ? 'bg-blue-500'
                    : state === 'paused'
                      ? 'bg-zinc-400'
                      : 'bg-red-500'
          }`}
        />
      </div>

      {/* Status label */}
      <span className="text-sm font-medium text-zinc-400">{stateLabels[state]}</span>

      {/* Mic indicator */}
      {isMicActive && (
        <svg
          className="h-4 w-4 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
}
