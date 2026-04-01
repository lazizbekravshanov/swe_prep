/**
 * VoiceSessionOrchestrator
 *
 * The central coordinator for the voice interview pipeline:
 *   Mic → STT → Silence detect → Claude API (streaming) → Sentence buffer → TTS → Speaker
 *
 * Manages the state machine, turn-taking, echo cancellation, sentence-by-sentence
 * TTS streaming, and nudges for extended silence.
 */

import type { ConversationTurn, Problem, LeetCodeProblem, CandidateLevel } from '@/lib/types';

// ── State types ──

export type SessionState = 'idle' | 'listening' | 'processing' | 'speaking' | 'paused' | 'ended';

export type SessionEvent =
  | { type: 'START' }
  | { type: 'SILENCE_DETECTED'; transcript: string }
  | { type: 'ECHO_DETECTED' }
  | { type: 'AI_FIRST_SENTENCE'; sentence: string }
  | { type: 'AI_SENTENCE'; sentence: string }
  | { type: 'AI_RESPONSE_COMPLETE'; fullText: string }
  | { type: 'TTS_FINISHED' }
  | { type: 'USER_INTERRUPT' }
  | { type: 'CODE_UPDATED'; code: string }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'END' }
  | { type: 'EXTENDED_SILENCE' }
  | { type: 'ERROR'; error: string };

// ── STT/TTS interfaces (decoupled from implementations) ──

export interface STTAdapter {
  init(): boolean;
  start(): void;
  stop(): void;
  flush(): string;
}

export interface TTSAdapter {
  speak(text: string): void;
  appendSentence(sentence: string): void;
  interrupt(): void;
  readonly speaking: boolean;
}

export interface EchoGuardAdapter {
  setLastAIResponse(text: string): void;
  markAISpeakingDone(): void;
  isEcho(transcript: string): boolean;
}

// ── Orchestrator callbacks ──

export interface OrchestratorCallbacks {
  onStateChange: (state: SessionState) => void;
  onTranscriptUpdate: (turn: ConversationTurn) => void;
  onInterimTranscript: (text: string) => void;
  onAudioLevel: (level: number) => void;
  onError: (error: string) => void;
}

// ── Orchestrator ──

export class VoiceSessionOrchestrator {
  private state: SessionState = 'idle';
  private transcript: ConversationTurn[] = [];
  private currentCode = '';
  private hintLevel = 0;
  private turnCount = 0;
  private claudeAbort: AbortController | null = null;
  private silenceTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private sentenceBuffer = '';

  constructor(
    private stt: STTAdapter,
    private tts: TTSAdapter,
    private echoGuard: EchoGuardAdapter,
    private callbacks: OrchestratorCallbacks,
    private problem: Problem | LeetCodeProblem,
    private company: string | null,
    private candidateLevel: CandidateLevel,
  ) {}

  // ── Public API ──

  getState(): SessionState {
    return this.state;
  }

  getTranscript(): ConversationTurn[] {
    return this.transcript;
  }

  dispatch(event: SessionEvent): void {
    switch (this.state) {
      case 'idle':
        this.handleIdle(event);
        break;
      case 'listening':
        this.handleListening(event);
        break;
      case 'processing':
        this.handleProcessing(event);
        break;
      case 'speaking':
        this.handleSpeaking(event);
        break;
      case 'paused':
        this.handlePaused(event);
        break;
      case 'ended':
        break; // terminal
    }
  }

  updateCode(code: string): void {
    this.currentCode = code;
  }

  destroy(): void {
    this.stt.stop();
    this.tts.interrupt();
    this.claudeAbort?.abort();
    this.clearSilenceTimeout();
  }

  // ── State handlers ──

  private handleIdle(event: SessionEvent): void {
    if (event.type === 'START') {
      this.transitionTo('processing');
      this.callClaude();
    }
  }

  private handleListening(event: SessionEvent): void {
    switch (event.type) {
      case 'SILENCE_DETECTED': {
        const transcript = event.transcript.trim();
        if (!transcript) return;

        // Echo check
        if (this.echoGuard.isEcho(transcript)) {
          this.stt.start(); // keep listening
          return;
        }

        this.clearSilenceTimeout();
        this.stt.stop();

        const turn: ConversationTurn = {
          role: 'candidate',
          text: transcript,
          timestamp: Date.now(),
        };
        this.transcript.push(turn);
        this.callbacks.onTranscriptUpdate(turn);
        this.callbacks.onInterimTranscript('');
        this.turnCount++;

        this.transitionTo('processing');
        this.callClaude();
        break;
      }
      case 'CODE_UPDATED':
        this.currentCode = event.code;
        break;
      case 'EXTENDED_SILENCE':
        this.nudgeUser();
        break;
      case 'PAUSE':
        this.stt.stop();
        this.clearSilenceTimeout();
        this.transitionTo('paused');
        break;
      case 'END':
        this.endSession();
        break;
    }
  }

  private handleProcessing(event: SessionEvent): void {
    switch (event.type) {
      case 'AI_FIRST_SENTENCE':
        this.transitionTo('speaking');
        this.tts.speak(event.sentence);
        break;
      case 'ERROR':
        this.transitionTo('speaking');
        this.tts.speak("Sorry, I had a brief connection issue. Could you repeat that?");
        break;
      case 'END':
        this.claudeAbort?.abort();
        this.endSession();
        break;
    }
  }

  private handleSpeaking(event: SessionEvent): void {
    switch (event.type) {
      case 'AI_SENTENCE':
        this.tts.appendSentence(event.sentence);
        break;
      case 'AI_RESPONSE_COMPLETE': {
        this.echoGuard.setLastAIResponse(event.fullText);

        const turn: ConversationTurn = {
          role: 'interviewer',
          text: event.fullText,
          timestamp: Date.now(),
        };
        this.transcript.push(turn);
        this.callbacks.onTranscriptUpdate(turn);
        break;
      }
      case 'TTS_FINISHED':
        this.echoGuard.markAISpeakingDone();
        // 200ms gap before mic activation to avoid echo capture
        setTimeout(() => {
          if (this.state === 'speaking') {
            this.transitionTo('listening');
            this.stt.start();
            this.startSilenceTimeout();
          }
        }, 200);
        break;
      case 'USER_INTERRUPT':
        this.tts.interrupt();
        this.echoGuard.markAISpeakingDone();
        this.transitionTo('listening');
        this.stt.start();
        this.startSilenceTimeout();
        break;
      case 'END':
        this.tts.interrupt();
        this.claudeAbort?.abort();
        this.endSession();
        break;
    }
  }

  private handlePaused(event: SessionEvent): void {
    if (event.type === 'RESUME') {
      this.transitionTo('listening');
      this.stt.start();
      this.startSilenceTimeout();
    } else if (event.type === 'END') {
      this.endSession();
    }
  }

  // ── Claude API streaming with sentence extraction ──

  private async callClaude(): Promise<void> {
    this.claudeAbort = new AbortController();
    this.sentenceBuffer = '';
    let isFirstSentence = true;
    let fullText = '';

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: this.transcript,
          problem: this.problem,
          code: this.currentCode,
          company: this.company ?? undefined,
          candidateLevel: this.candidateLevel,
          hintLevel: this.hintLevel,
        }),
        signal: this.claudeAbort.signal,
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              this.sentenceBuffer += parsed.text;
              fullText += parsed.text;

              // Extract complete sentences
              const sentences = this.extractSentences();
              for (const sentence of sentences) {
                if (isFirstSentence) {
                  isFirstSentence = false;
                  this.dispatch({ type: 'AI_FIRST_SENTENCE', sentence });
                } else {
                  this.dispatch({ type: 'AI_SENTENCE', sentence });
                }
              }
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      // Flush remaining buffer
      const remaining = this.sentenceBuffer.trim();
      this.sentenceBuffer = '';
      if (remaining) {
        if (isFirstSentence) {
          this.dispatch({ type: 'AI_FIRST_SENTENCE', sentence: remaining });
        } else {
          this.dispatch({ type: 'AI_SENTENCE', sentence: remaining });
        }
      }

      this.dispatch({ type: 'AI_RESPONSE_COMPLETE', fullText });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.callbacks.onError(message);
      this.dispatch({ type: 'ERROR', error: message });
    }
  }

  private extractSentences(): string[] {
    const sentences: string[] = [];
    const pattern = /[^.!?]*[.!?]+[\s]*/g;
    let match;
    let lastEnd = 0;

    while ((match = pattern.exec(this.sentenceBuffer)) !== null) {
      const sentence = match[0].trim();
      if (sentence.length > 0) {
        // Cap at 200 chars for Chrome TTS reliability
        if (sentence.length > 200) {
          const parts = sentence.split(/[,;]\s*/);
          sentences.push(...parts.filter((p) => p.trim().length > 0));
        } else {
          sentences.push(sentence);
        }
      }
      lastEnd = match.index + match[0].length;
    }

    if (sentences.length > 0) {
      this.sentenceBuffer = this.sentenceBuffer.slice(lastEnd);
    }

    return sentences;
  }

  // ── Silence / nudge system ──

  private startSilenceTimeout(): void {
    this.clearSilenceTimeout();
    // 15s for first few turns, 20s later (give coding time)
    const timeout = this.turnCount < 3 ? 15000 : 20000;
    this.silenceTimeoutId = setTimeout(() => {
      this.dispatch({ type: 'EXTENDED_SILENCE' });
    }, timeout);
  }

  private clearSilenceTimeout(): void {
    if (this.silenceTimeoutId) {
      clearTimeout(this.silenceTimeoutId);
      this.silenceTimeoutId = null;
    }
  }

  private nudgeUser(): void {
    const nudges = [
      "Take your time. What's your initial thought on this?",
      "No pressure. Would it help if I repeated the problem?",
      "I can see you're thinking. Feel free to think out loud.",
      "Would you like a hint to get started?",
    ];
    const nudge = nudges[Math.min(this.hintLevel, nudges.length - 1)];
    this.hintLevel++;

    this.transitionTo('speaking');
    this.tts.speak(nudge);

    const turn: ConversationTurn = {
      role: 'interviewer',
      text: nudge,
      timestamp: Date.now(),
    };
    this.transcript.push(turn);
    this.callbacks.onTranscriptUpdate(turn);
  }

  // ── Lifecycle helpers ──

  private transitionTo(newState: SessionState): void {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  private endSession(): void {
    this.stt.stop();
    this.tts.interrupt();
    this.claudeAbort?.abort();
    this.clearSilenceTimeout();
    this.transitionTo('ended');
  }
}

// Re-export the getNextState helper for backward compatibility
export function getNextState(
  current: SessionState,
  event: string,
): SessionState | null {
  const transitions: Record<SessionState, Partial<Record<string, SessionState>>> = {
    idle: { START_INTERVIEW: 'speaking' },
    listening: {
      SILENCE_TIMEOUT: 'processing',
      END_SESSION: 'ended',
      PAUSE: 'paused',
      CODE_UPDATED: 'listening',
    },
    processing: { AI_RESPONSE_READY: 'speaking' },
    speaking: {
      TTS_FINISHED: 'listening',
      USER_INTERRUPT: 'listening',
      END_SESSION: 'ended',
    },
    paused: { RESUME: 'listening', END_SESSION: 'ended' },
    ended: {},
  };
  return transitions[current]?.[event] ?? null;
}

export function canTransition(current: SessionState, event: string): boolean {
  return getNextState(current, event) !== null;
}
