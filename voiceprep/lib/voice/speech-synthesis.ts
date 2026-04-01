// Production-grade Web Speech API wrapper with sentence-level queuing,
// Chrome TTS workaround, streaming append support, and interrupt handling.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TTSConfig {
  /** Preferred voice name, or null to auto-select. */
  voice: string | null;
  /** Speech rate (0.1 - 10). Default: 0.9 */
  rate: number;
  /** Speech pitch (0 - 2). Default: 1.0 */
  pitch: number;
  /** Volume (0 - 1). Default: 1.0 */
  volume: number;
  /** BCP-47 language code. Default: 'en-US' */
  language: string;
}

export interface TTSEvents {
  onSpeakingStart: () => void;
  onSpeakingEnd: () => void;
  onSentenceStart: (sentenceIndex: number) => void;
  onInterrupted: () => void;
  onError: (error: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Voice names ordered by quality preference. */
const PREFERRED_VOICES: string[] = [
  "Google US English",        // Chrome — best quality
  "Samantha",                 // Safari / macOS
  "Microsoft Zira Online",    // Edge
  "Alex",                     // macOS fallback
];

/** Maximum characters per utterance (Chrome reliability limit). */
const MAX_SENTENCE_LENGTH = 200;

/** Interval (ms) for the Chrome pause/resume keepalive workaround. */
const CHROME_KEEPALIVE_INTERVAL_MS = 10_000;

/** Regex to split text into sentences. */
const SENTENCE_SPLIT_RE = /[^.!?]*[.!?]+[\s]*/g;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isChrome(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Chrome/i.test(navigator.userAgent) && !/Edg/i.test(navigator.userAgent);
}

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

/**
 * Split a long chunk on commas or semicolons so that each piece is at most
 * `maxLen` characters. If no natural break exists the string is hard-cut.
 */
function splitOnPunctuation(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    // Look for the last comma or semicolon within the allowed window.
    let splitIdx = -1;
    for (let i = maxLen - 1; i >= 0; i--) {
      if (remaining[i] === "," || remaining[i] === ";") {
        splitIdx = i + 1; // include the punctuation in the first part
        break;
      }
    }
    if (splitIdx <= 0) {
      // No natural break — hard-cut at maxLen.
      splitIdx = maxLen;
    }
    parts.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx).trim();
  }

  if (remaining.length > 0) {
    parts.push(remaining);
  }
  return parts;
}

/**
 * Break `text` into sentence-sized chunks, each at most `MAX_SENTENCE_LENGTH`
 * characters. Sentences are identified by terminating punctuation; oversized
 * sentences are further split on commas / semicolons.
 */
function splitIntoSentences(text: string): string[] {
  const raw: string[] = [];
  let match: RegExpExecArray | null;

  // Reset lastIndex in case the regex was used elsewhere.
  SENTENCE_SPLIT_RE.lastIndex = 0;

  while ((match = SENTENCE_SPLIT_RE.exec(text)) !== null) {
    const s = match[0].trim();
    if (s.length > 0) raw.push(s);
  }

  // If the regex left a trailing fragment (text without terminal punctuation),
  // include it so nothing is silently dropped.
  const captured = raw.join("");
  const remainder = text.slice(captured.length).trim();
  if (remainder.length > 0) {
    raw.push(remainder);
  }

  // Enforce per-sentence length cap.
  const sentences: string[] = [];
  for (const s of raw) {
    sentences.push(...splitOnPunctuation(s, MAX_SENTENCE_LENGTH));
  }
  return sentences;
}

// ---------------------------------------------------------------------------
// SpeechSynthesisManager
// ---------------------------------------------------------------------------

export class SpeechSynthesisManager {
  private config: TTSConfig;
  private events: TTSEvents;

  /** Ordered queue of sentences still to be spoken. */
  private queue: string[] = [];

  /** Index of the sentence currently being spoken (cumulative across all calls). */
  private currentSentenceIndex = 0;

  /** Total number of sentences queued so far (used to compute absolute indices). */
  private totalSentencesQueued = 0;

  private _speaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  /** Chrome keepalive interval handle. */
  private keepaliveTimer: ReturnType<typeof setInterval> | null = null;

  /** Resolved voice cached after voice list loads. */
  private resolvedVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded = false;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(config: Partial<TTSConfig> & { voice?: string | null } = {}, events: Partial<TTSEvents> = {}) {
    this.config = {
      voice: config.voice ?? null,
      rate: config.rate ?? 0.9,
      pitch: config.pitch ?? 1.0,
      volume: config.volume ?? 1.0,
      language: config.language ?? "en-US",
    };

    this.events = {
      onSpeakingStart: events.onSpeakingStart ?? (() => {}),
      onSpeakingEnd: events.onSpeakingEnd ?? (() => {}),
      onSentenceStart: events.onSentenceStart ?? (() => {}),
      onInterrupted: events.onInterrupted ?? (() => {}),
      onError: events.onError ?? (() => {}),
    };

    this.loadVoices();
  }

  // -------------------------------------------------------------------------
  // Static
  // -------------------------------------------------------------------------

  static isSupported(): boolean {
    return getSynth() !== null;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Speak the given text. The text is split into sentences, queued, and
   * spoken one sentence at a time. Any speech currently in progress is
   * interrupted first.
   */
  speak(text: string): void {
    const synth = getSynth();
    if (!synth) return;

    // Interrupt anything already playing.
    this.interruptInternal(false);

    // Reset counters for a fresh speak() call.
    this.currentSentenceIndex = 0;
    this.totalSentencesQueued = 0;

    const sentences = splitIntoSentences(text);
    if (sentences.length === 0) return;

    this.queue = sentences;
    this.totalSentencesQueued = sentences.length;
    this._speaking = true;
    this.events.onSpeakingStart();
    this.speakNext();
  }

  /**
   * Append a single sentence to the queue (used during Claude streaming).
   * If the manager is not currently speaking, it starts speaking immediately.
   */
  appendSentence(sentence: string): void {
    const synth = getSynth();
    if (!synth) return;

    const chunks = splitOnPunctuation(sentence.trim(), MAX_SENTENCE_LENGTH);
    if (chunks.length === 0) return;

    this.queue.push(...chunks);
    this.totalSentencesQueued += chunks.length;

    if (!this._speaking) {
      this._speaking = true;
      this.currentSentenceIndex = 0;
      this.events.onSpeakingStart();
      this.speakNext();
    }
  }

  /**
   * Immediately stop all speech, clear the queue, and fire onInterrupted.
   */
  interrupt(): void {
    this.interruptInternal(true);
  }

  /** Whether the manager is currently speaking. */
  get speaking(): boolean {
    return this._speaking;
  }

  /** Return available English voices. */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    const synth = getSynth();
    if (!synth) return [];
    return synth.getVoices().filter((v) => v.lang.startsWith("en"));
  }

  // -------------------------------------------------------------------------
  // Voice loading & resolution
  // -------------------------------------------------------------------------

  private loadVoices(): void {
    const synth = getSynth();
    if (!synth) return;

    const tryResolve = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        this.voicesLoaded = true;
        this.resolvedVoice = this.pickVoice(voices);
      }
    };

    // Some browsers (Chrome) populate voices asynchronously.
    tryResolve();
    if (!this.voicesLoaded) {
      synth.addEventListener("voiceschanged", () => {
        tryResolve();
      });
    }
  }

  /**
   * Pick the best voice using the priority list from the spec.
   */
  private pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    // 1. Explicit config override.
    if (this.config.voice) {
      const exact = voices.find((v) => v.name === this.config.voice);
      if (exact) return exact;
    }

    // 2. Walk the preferred-voices list.
    for (const name of PREFERRED_VOICES) {
      const match = voices.find((v) => v.name === name);
      if (match) return match;
    }

    // 3. Any en-US voice.
    const enUS = voices.find((v) => v.lang === "en-US");
    if (enUS) return enUS;

    // 4. Any voice matching the configured language prefix.
    const langMatch = voices.find((v) => v.lang.startsWith(this.config.language));
    if (langMatch) return langMatch;

    // 5. Default (null lets the browser decide).
    return null;
  }

  // -------------------------------------------------------------------------
  // Internal speaking pipeline
  // -------------------------------------------------------------------------

  private speakNext(): void {
    const synth = getSynth();
    if (!synth) return;

    if (this.queue.length === 0) {
      this.finishSpeaking();
      return;
    }

    const sentence = this.queue.shift()!;
    const index = this.currentSentenceIndex;
    this.currentSentenceIndex++;

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = this.config.rate;
    utterance.pitch = this.config.pitch;
    utterance.volume = this.config.volume;
    utterance.lang = this.config.language;

    // Re-resolve voice in case voices loaded asynchronously since construction.
    if (!this.voicesLoaded) {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        this.voicesLoaded = true;
        this.resolvedVoice = this.pickVoice(voices);
      }
    }
    if (this.resolvedVoice) {
      utterance.voice = this.resolvedVoice;
    }

    utterance.onstart = () => {
      this.events.onSentenceStart(index);
      this.startKeepalive();
    };

    utterance.onend = () => {
      this.stopKeepalive();
      this.currentUtterance = null;
      this.speakNext();
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      this.stopKeepalive();
      this.currentUtterance = null;

      // 'interrupted' and 'canceled' are expected during interrupt().
      if (event.error === "interrupted" || event.error === "canceled") {
        // Do nothing — interruptInternal() already handled cleanup.
        return;
      }

      this.events.onError(event.error ?? "Unknown TTS error");

      // Try to continue with the next sentence despite the error.
      this.speakNext();
    };

    this.currentUtterance = utterance;
    synth.speak(utterance);
  }

  private finishSpeaking(): void {
    this._speaking = false;
    this.currentUtterance = null;
    this.stopKeepalive();
    this.events.onSpeakingEnd();
  }

  private interruptInternal(fireEvent: boolean): void {
    const synth = getSynth();

    this.queue = [];
    this._speaking = false;
    this.currentUtterance = null;
    this.stopKeepalive();

    if (synth) {
      synth.cancel();
    }

    if (fireEvent) {
      this.events.onInterrupted();
    }
  }

  // -------------------------------------------------------------------------
  // Chrome keepalive workaround
  // -------------------------------------------------------------------------

  private startKeepalive(): void {
    if (!isChrome()) return;
    if (this.keepaliveTimer !== null) return;

    const synth = getSynth();
    if (!synth) return;

    this.keepaliveTimer = setInterval(() => {
      if (synth.speaking) {
        synth.pause();
        synth.resume();
      }
    }, CHROME_KEEPALIVE_INTERVAL_MS);
  }

  private stopKeepalive(): void {
    if (this.keepaliveTimer !== null) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
    }
  }
}
