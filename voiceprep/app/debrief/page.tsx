'use client';

import { useState } from 'react';
import { VoiceOrb } from '@/components/interview/VoiceOrb';
import { TranscriptDisplay } from '@/components/interview/TranscriptDisplay';
import { Button } from '@/components/ui/Button';
import type { ConversationTurn } from '@/lib/types';

type DebriefState = 'idle' | 'active' | 'ended';

export default function DebriefPage() {
  const [debriefState, setDebriefState] = useState<DebriefState>('idle');
  const [transcript, setTranscript] = useState<ConversationTurn[]>([]);
  const [interimTranscript, setInterimTranscript] = useState('');

  const handleStart = () => {
    setDebriefState('active');
    // MVP: The actual debrief prompt integration (buildDebriefPrompt from '@/lib/ai/debrief-prompt')
    // happens at the API level when the voice session connects to the interview endpoint.
  };

  const handleEnd = () => {
    setDebriefState('ended');
  };

  return (
    <div
      className="mx-auto flex flex-col"
      style={{
        maxWidth: 672,
        padding: '32px 24px',
        minHeight: '100%',
      }}
    >
      {/* Back link */}
      <a
        href="/dashboard"
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          transition: 'color var(--duration-fast) var(--ease-default)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        &larr; Back to Dashboard
      </a>

      {/* Page title */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          margin: '20px 0 0',
        }}
      >
        Post-Interview Debrief
      </h1>
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          margin: '8px 0 0',
          lineHeight: 1.6,
        }}
      >
        Tell me about your interview and I&apos;ll help you analyze it.
      </p>

      {/* Idle state — start button */}
      {debriefState === 'idle' && (
        <div
          className="flex flex-col items-center"
          style={{ marginTop: 64, gap: 32 }}
        >
          <VoiceOrb state="idle" size={120} />
          <Button size="lg" onClick={handleStart}>
            Start Debrief
          </Button>
        </div>
      )}

      {/* Active state — orb + transcript feed */}
      {debriefState === 'active' && (
        <div
          className="flex flex-col items-center flex-1"
          style={{ marginTop: 40, gap: 24 }}
        >
          <VoiceOrb state="listening" size={120} />

          <div
            className="frost-panel"
            style={{
              width: '100%',
              flex: 1,
              minHeight: 200,
              marginTop: 8,
            }}
          >
            <TranscriptDisplay
              transcript={transcript}
              interimTranscript={interimTranscript}
            />
          </div>

          <Button variant="danger" size="md" onClick={handleEnd}>
            End Debrief
          </Button>
        </div>
      )}

      {/* Ended state — summary + action */}
      {debriefState === 'ended' && (
        <div
          className="flex flex-col items-center"
          style={{ marginTop: 48, gap: 24 }}
        >
          <VoiceOrb state="ended" size={120} />

          <div
            className="frost-panel"
            style={{
              width: '100%',
              padding: 32,
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 8px',
              }}
            >
              Debrief Complete
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                margin: '0 0 24px',
                lineHeight: 1.6,
              }}
            >
              Review your debrief notes and practice the topics that came up.
            </p>
            <div className="flex items-center justify-center" style={{ gap: 12 }}>
              <Button
                size="md"
                onClick={() => {
                  window.location.href = '/setup';
                }}
              >
                Practice a weak topic
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  setDebriefState('idle');
                  setTranscript([]);
                  setInterimTranscript('');
                }}
              >
                New Debrief
              </Button>
            </div>
          </div>

          {/* Show transcript if any turns were recorded */}
          {transcript.length > 0 && (
            <div className="frost-panel" style={{ width: '100%' }}>
              <TranscriptDisplay
                transcript={transcript}
                interimTranscript=""
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
