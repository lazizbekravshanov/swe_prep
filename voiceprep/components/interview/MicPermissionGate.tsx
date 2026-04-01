'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

type GateState = 'checking' | 'ready' | 'needs_permission' | 'denied' | 'unsupported';

interface MicPermissionGateProps {
  children: React.ReactNode;
}

export function MicPermissionGate({ children }: MicPermissionGateProps) {
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    // Check speech recognition support
    const hasSpeech =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    if (!hasSpeech) {
      setState('unsupported');
      return;
    }

    // Try to check mic permission without prompting
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        // If we can see device labels, permission was already granted
        const hasAudioInput = devices.some(
          (d) => d.kind === 'audioinput' && d.label !== ''
        );
        setState(hasAudioInput ? 'ready' : 'needs_permission');
      })
      .catch(() => {
        setState('needs_permission');
      });
  }, []);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setState('ready');
    } catch (err) {
      console.error('Mic permission error:', err);
      setState('denied');
    }
  };

  if (state === 'checking') {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          style={{
            width: 24,
            height: 24,
            border: '2px solid var(--border-default)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state === 'ready') {
    return <>{children}</>;
  }

  if (state === 'unsupported') {
    return (
      <div className="flex h-full items-center justify-center" style={{ padding: 48 }}>
        <div className="frost-panel" style={{ maxWidth: 480, padding: 32, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Browser not supported
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Voice interviews require <strong>Chrome</strong> or <strong>Edge</strong>. Please switch browsers for the best experience.
          </p>
        </div>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="flex h-full items-center justify-center" style={{ padding: 48 }}>
        <div className="frost-panel" style={{ maxWidth: 480, padding: 32, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Microphone access denied
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
            Click the lock/camera icon in your address bar, set Microphone to &quot;Allow&quot;, then refresh.
          </p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // needs_permission
  return (
    <div className="flex h-full items-center justify-center" style={{ padding: 48 }}>
      <div className="frost-panel" style={{ maxWidth: 480, padding: 32, textAlign: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Enable your microphone
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
          VoicePrep needs microphone access for voice interviews. Your audio is processed in real-time and never stored.
        </p>
        <Button onClick={requestPermission}>
          Allow Microphone Access
        </Button>
      </div>
    </div>
  );
}
