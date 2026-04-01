'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useInterviewStore } from '@/store/interview-store';
import { useSettingsStore } from '@/store/settings-store';
import { SpeechRecognitionManager } from '@/lib/voice/speech-recognition';
import { SpeechSynthesisManager } from '@/lib/voice/speech-synthesis';
import { VoiceSessionOrchestrator } from '@/lib/voice/voice-session';
import { EchoGuard } from '@/lib/voice/echo-guard';
import { AudioLevelMonitor } from '@/lib/voice/audio-level';
import type { STTAdapter, TTSAdapter } from '@/lib/voice/voice-session';

/**
 * Adapter wrapping SpeechRecognitionManager for the orchestrator's STTAdapter interface.
 */
function createSTTAdapter(
  config: { silenceTimeout: number },
  orchestratorRef: React.MutableRefObject<VoiceSessionOrchestrator | null>,
): { adapter: STTAdapter; manager: SpeechRecognitionManager } {
  const manager = new SpeechRecognitionManager(
    {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 1,
      silenceTimeout: config.silenceTimeout,
      maxSpeechDuration: 120000,
    },
    {
      onInterimTranscript: (text) => {
        useInterviewStore.getState().setInterimTranscript(text);
      },
      onFinalTranscript: () => {
        // Accumulated internally, flushed on silence detection
      },
      onSilenceDetected: () => {
        const transcript = manager.flush();
        if (transcript) {
          orchestratorRef.current?.dispatch({
            type: 'SILENCE_DETECTED',
            transcript,
          });
        }
      },
      onSpeechStart: () => {
        const state = useInterviewStore.getState().state;
        if (state === 'speaking') {
          orchestratorRef.current?.dispatch({ type: 'USER_INTERRUPT' });
        }
      },
      onError: (error) => {
        console.error('STT error:', error.code, error.message);
      },
      onNoSpeechTimeout: () => {},
    },
  );

  manager.init();

  const adapter: STTAdapter = {
    init: () => manager.init(),
    start: () => manager.start(),
    stop: () => manager.stop(),
    flush: () => manager.flush(),
  };

  return { adapter, manager };
}

/**
 * Adapter wrapping SpeechSynthesisManager for the orchestrator's TTSAdapter interface.
 */
function createTTSAdapter(
  config: { rate: number },
  orchestratorRef: React.MutableRefObject<VoiceSessionOrchestrator | null>,
): { adapter: TTSAdapter } {
  const manager = new SpeechSynthesisManager(
    {
      voice: null,
      rate: config.rate,
      pitch: 1.0,
      volume: 1.0,
      language: 'en-US',
    },
    {
      onSpeakingStart: () => {},
      onSpeakingEnd: () => {
        orchestratorRef.current?.dispatch({ type: 'TTS_FINISHED' });
      },
      onSentenceStart: () => {},
      onInterrupted: () => {},
      onError: (error) => {
        console.error('TTS error:', error);
      },
    },
  );

  const adapter: TTSAdapter = {
    speak: (text) => manager.speak(text),
    appendSentence: (sentence) => manager.appendSentence(sentence),
    interrupt: () => manager.interrupt(),
    get speaking() {
      return manager.speaking;
    },
  };

  return { adapter };
}

export function useVoiceController() {
  const settings = useSettingsStore();
  const [audioLevel, setAudioLevel] = useState(0);

  const orchestratorRef = useRef<VoiceSessionOrchestrator | null>(null);
  const audioMonitorRef = useRef<AudioLevelMonitor | null>(null);

  useEffect(() => {
    return () => {
      orchestratorRef.current?.destroy();
      audioMonitorRef.current?.stop();
    };
  }, []);

  const startInterview = useCallback(() => {
    const { problem, company, candidateLevel } = useInterviewStore.getState();
    if (!problem) return;

    const echoGuard = new EchoGuard();

    const { adapter: sttAdapter } = createSTTAdapter(
      { silenceTimeout: settings.silenceTimeout },
      orchestratorRef,
    );

    const { adapter: ttsAdapter } = createTTSAdapter(
      { rate: settings.speechRate },
      orchestratorRef,
    );

    const orchestrator = new VoiceSessionOrchestrator(
      sttAdapter,
      ttsAdapter,
      echoGuard,
      {
        onStateChange: (state) => {
          useInterviewStore.getState().setState(state);
        },
        onTranscriptUpdate: (turn) => {
          useInterviewStore.getState().addTurn(turn);
        },
        onInterimTranscript: (text) => {
          useInterviewStore.getState().setInterimTranscript(text);
        },
        onAudioLevel: setAudioLevel,
        onError: (error) => {
          console.error('Session error:', error);
        },
      },
      problem,
      company,
      candidateLevel,
    );

    orchestratorRef.current = orchestrator;

    // Start audio level monitoring (optional, for voice orb)
    if (AudioLevelMonitor.isSupported()) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const monitor = new AudioLevelMonitor();
          monitor.start(stream, setAudioLevel);
          audioMonitorRef.current = monitor;
        })
        .catch(() => {
          // Audio level is optional — voice still works without it
        });
    }

    orchestrator.dispatch({ type: 'START' });
  }, [settings.silenceTimeout, settings.speechRate]);

  const endInterview = useCallback(() => {
    orchestratorRef.current?.dispatch({ type: 'END' });
    audioMonitorRef.current?.stop();
  }, []);

  const interrupt = useCallback(() => {
    orchestratorRef.current?.dispatch({ type: 'USER_INTERRUPT' });
  }, []);

  const pause = useCallback(() => {
    orchestratorRef.current?.dispatch({ type: 'PAUSE' });
  }, []);

  const resume = useCallback(() => {
    orchestratorRef.current?.dispatch({ type: 'RESUME' });
  }, []);

  const updateCode = useCallback((code: string) => {
    orchestratorRef.current?.updateCode(code);
  }, []);

  return {
    startInterview,
    endInterview,
    interrupt,
    pause,
    resume,
    updateCode,
    audioLevel,
    isSupported:
      SpeechRecognitionManager.isSupported() && SpeechSynthesisManager.isSupported(),
  };
}
