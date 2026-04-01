// Web Speech API wrapper for speech-to-text with adaptive silence detection
//
// The Web Speech Recognition API types are not included in all TypeScript DOM
// libs, so we declare the subset we need here.

// ---------------------------------------------------------------------------
// Local Speech Recognition type declarations (no @types/dom dependency)
// ---------------------------------------------------------------------------

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface STTConfig {
  /** BCP-47 language code (e.g. "en-US") */
  language: string;
  /** Keep recognizing continuously rather than stopping after one utterance */
  continuous: boolean;
  /** Deliver interim (partial) results in addition to final results */
  interimResults: boolean;
  /** Maximum number of alternative transcriptions per result. Default: 1 */
  maxAlternatives?: number;
  /** Base silence timeout in milliseconds. Default: 1200 */
  silenceTimeout?: number;
  /** Maximum total speech duration in milliseconds. Default: 120000 */
  maxSpeechDuration?: number;
}

export interface STTEvents {
  /** Called with interim (partial) transcript text as the user speaks */
  onInterimTranscript: (text: string) => void;
  /** Called with the full accumulated transcript when a final result arrives */
  onFinalTranscript: (text: string) => void;
  /** Called when adaptive silence detection triggers */
  onSilenceDetected: () => void;
  /** Called when speech audio is first detected */
  onSpeechStart: () => void;
  /** Called when a real (non-recoverable) error occurs */
  onError: (error: STTError) => void;
  /** Called when no speech is detected within the no-speech timeout (10s) */
  onNoSpeechTimeout: () => void;
}

export type STTErrorCode =
  | "not-allowed"
  | "no-speech"
  | "audio-capture"
  | "network"
  | "aborted"
  | "not-supported";

export interface STTError {
  code: STTErrorCode;
  message: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MAX_ALTERNATIVES = 1;
const DEFAULT_SILENCE_TIMEOUT_MS = 1200;
const DEFAULT_MAX_SPEECH_DURATION_MS = 120_000;

/** How long to wait for any speech before firing onNoSpeechTimeout */
const NO_SPEECH_TIMEOUT_MS = 10_000;

/** Delay before retrying a failed auto-restart (Chrome quirk) */
const RESTART_RETRY_DELAY_MS = 100;

/** Silence timeout for short utterances (1-3 words like "um", "let me think") */
const SHORT_UTTERANCE_SILENCE_MS = 2500;

/** Silence timeout for long explanations (>10s of speaking) */
const LONG_SPEECH_SILENCE_MS = 1800;

/** Threshold in seconds after which speech is considered "long" */
const LONG_SPEECH_THRESHOLD_S = 10;

/** Word count range considered a "short utterance" (filler/thinking) */
const SHORT_UTTERANCE_MIN_WORDS = 1;
const SHORT_UTTERANCE_MAX_WORDS = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapBrowserError(browserError: string): STTErrorCode {
  switch (browserError) {
    case "not-allowed":
      return "not-allowed";
    case "no-speech":
      return "no-speech";
    case "audio-capture":
      return "audio-capture";
    case "network":
      return "network";
    case "aborted":
      return "aborted";
    default:
      // service-not-allowed, language-not-supported, etc.
      return "not-supported";
  }
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

// ---------------------------------------------------------------------------
// SpeechRecognitionManager
// ---------------------------------------------------------------------------

export class SpeechRecognitionManager {
  // Config (with defaults resolved)
  private readonly config: Required<STTConfig>;
  private readonly events: STTEvents;

  // Recognition instance
  private recognition: SpeechRecognitionInstance | null = null;

  // State
  private isListening = false;
  private accumulatedTranscript = "";

  // Adaptive silence detection state
  private lastSpeechTime = 0;
  private speechStartTime = 0;
  private currentUtteranceWordCount = 0;

  // Timers
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private noSpeechTimer: ReturnType<typeof setTimeout> | null = null;
  private maxDurationTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: STTConfig, events: STTEvents) {
    this.config = {
      language: config.language,
      continuous: config.continuous,
      interimResults: config.interimResults,
      maxAlternatives: config.maxAlternatives ?? DEFAULT_MAX_ALTERNATIVES,
      silenceTimeout: config.silenceTimeout ?? DEFAULT_SILENCE_TIMEOUT_MS,
      maxSpeechDuration: config.maxSpeechDuration ?? DEFAULT_MAX_SPEECH_DURATION_MS,
    };
    this.events = events;
  }

  // -------------------------------------------------------------------------
  // Static
  // -------------------------------------------------------------------------

  /** Check whether the browser supports the Web Speech Recognition API. */
  static isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Create the underlying SpeechRecognition instance and wire up event
   * handlers. Returns false if the API is not supported.
   */
  init(): boolean {
    const Ctor =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (!Ctor) {
      return false;
    }

    const recognition = new Ctor();
    recognition.continuous = this.config.continuous;
    recognition.interimResults = this.config.interimResults;
    recognition.maxAlternatives = this.config.maxAlternatives;
    recognition.lang = this.config.language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleResult(event);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.handleError(event);
    };

    recognition.onend = () => {
      this.handleEnd();
    };

    recognition.onspeechstart = () => {
      this.handleSpeechStart();
    };

    this.recognition = recognition;
    return true;
  }

  /**
   * Start speech recognition. Resets the accumulated transcript and arms
   * the no-speech timeout (10s).
   */
  start(): void {
    if (!this.recognition) return;
    if (this.isListening) return;

    this.accumulatedTranscript = "";
    this.currentUtteranceWordCount = 0;
    this.speechStartTime = 0;
    this.lastSpeechTime = 0;
    this.isListening = true;

    this.recognition.start();

    // Arm the no-speech timeout
    this.startNoSpeechTimer();

    // Arm the max-duration safety timer
    this.startMaxDurationTimer();
  }

  /** Stop recognition and clear all timers. */
  stop(): void {
    this.isListening = false;
    this.clearAllTimers();

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Already stopped — ignore.
      }
    }
  }

  /** Return the accumulated transcript and reset the internal buffer. */
  flush(): string {
    const transcript = this.accumulatedTranscript;
    this.accumulatedTranscript = "";
    this.currentUtteranceWordCount = 0;
    return transcript;
  }

  /** Whether the manager is currently listening for speech. */
  get listening(): boolean {
    return this.isListening;
  }

  // -------------------------------------------------------------------------
  // Event handlers
  // -------------------------------------------------------------------------

  private handleResult(event: SpeechRecognitionEvent): void {
    // Any result means the user has spoken — cancel no-speech timeout.
    this.clearNoSpeechTimer();

    this.lastSpeechTime = Date.now();

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        // Append to the accumulated buffer (with a space separator if needed)
        const trimmed = transcript.trim();
        if (trimmed.length > 0) {
          if (this.accumulatedTranscript.length > 0) {
            this.accumulatedTranscript += " " + trimmed;
          } else {
            this.accumulatedTranscript = trimmed;
          }
          this.currentUtteranceWordCount = countWords(this.accumulatedTranscript);
        }

        this.events.onFinalTranscript(this.accumulatedTranscript);
      } else {
        this.events.onInterimTranscript(transcript);
      }
    }

    // Reset the adaptive silence timer after every result
    this.resetSilenceTimer();
  }

  private handleError(event: SpeechRecognitionErrorEvent): void {
    const code = mapBrowserError(event.error);

    // 'no-speech' is non-fatal — just restart recognition quietly.
    if (code === "no-speech") {
      if (this.isListening) {
        this.restartRecognition();
      }
      return;
    }

    // 'aborted' during active listening is typically from auto-restart;
    // don't surface it if we are still meant to be running.
    if (code === "aborted" && this.isListening) {
      return;
    }

    // Surface real errors
    this.events.onError({
      code,
      message: event.message || `Speech recognition error: ${event.error}`,
    });
  }

  /**
   * Handle the recognition engine stopping. Chrome randomly stops after ~60s
   * even in continuous mode, so we auto-restart if we are supposed to be
   * listening.
   */
  private handleEnd(): void {
    if (!this.isListening) return;

    this.restartRecognition();
  }

  private handleSpeechStart(): void {
    this.clearNoSpeechTimer();

    if (this.speechStartTime === 0) {
      this.speechStartTime = Date.now();
    }

    this.events.onSpeechStart();
  }

  // -------------------------------------------------------------------------
  // Adaptive silence detection
  // -------------------------------------------------------------------------

  /**
   * Calculate the adaptive silence timeout based on speech context.
   *
   * - Base timeout: config.silenceTimeout (default 1200ms)
   * - Short utterance (1-3 words): 2500ms — user might be thinking ("um",
   *   "let me think")
   * - Long speech (>10s): 1800ms — user is mid-explanation, give extra time
   */
  private getAdaptiveSilenceTimeout(): number {
    const base = this.config.silenceTimeout;

    // Short utterance: user said just a few words, likely thinking/pausing
    if (
      this.currentUtteranceWordCount >= SHORT_UTTERANCE_MIN_WORDS &&
      this.currentUtteranceWordCount <= SHORT_UTTERANCE_MAX_WORDS
    ) {
      return SHORT_UTTERANCE_SILENCE_MS;
    }

    // Long speech: user has been talking for >10 seconds
    if (this.speechStartTime > 0) {
      const speechDurationS = (Date.now() - this.speechStartTime) / 1000;
      if (speechDurationS > LONG_SPEECH_THRESHOLD_S) {
        return LONG_SPEECH_SILENCE_MS;
      }
    }

    return base;
  }

  private resetSilenceTimer(): void {
    this.clearSilenceTimer();

    const timeout = this.getAdaptiveSilenceTimeout();

    this.silenceTimer = setTimeout(() => {
      if (this.isListening) {
        this.events.onSilenceDetected();
      }
    }, timeout);
  }

  // -------------------------------------------------------------------------
  // No-speech timeout
  // -------------------------------------------------------------------------

  private startNoSpeechTimer(): void {
    this.clearNoSpeechTimer();

    this.noSpeechTimer = setTimeout(() => {
      if (this.isListening) {
        this.events.onNoSpeechTimeout();
      }
    }, NO_SPEECH_TIMEOUT_MS);
  }

  // -------------------------------------------------------------------------
  // Max duration timer
  // -------------------------------------------------------------------------

  private startMaxDurationTimer(): void {
    this.clearMaxDurationTimer();

    this.maxDurationTimer = setTimeout(() => {
      if (this.isListening) {
        this.stop();
      }
    }, this.config.maxSpeechDuration);
  }

  // -------------------------------------------------------------------------
  // Auto-restart (Chrome workaround)
  // -------------------------------------------------------------------------

  private restartRecognition(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.start();
    } catch {
      // First attempt failed (e.g. recognition not yet fully stopped).
      // Retry once after a short delay.
      setTimeout(() => {
        if (!this.recognition || !this.isListening) return;
        try {
          this.recognition.start();
        } catch {
          // Give up — surface as error
          this.events.onError({
            code: "aborted",
            message: "Failed to restart speech recognition after retry",
          });
        }
      }, RESTART_RETRY_DELAY_MS);
    }
  }

  // -------------------------------------------------------------------------
  // Timer cleanup
  // -------------------------------------------------------------------------

  private clearSilenceTimer(): void {
    if (this.silenceTimer !== null) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private clearNoSpeechTimer(): void {
    if (this.noSpeechTimer !== null) {
      clearTimeout(this.noSpeechTimer);
      this.noSpeechTimer = null;
    }
  }

  private clearMaxDurationTimer(): void {
    if (this.maxDurationTimer !== null) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }
  }

  private clearAllTimers(): void {
    this.clearSilenceTimer();
    this.clearNoSpeechTimer();
    this.clearMaxDurationTimer();
  }
}
