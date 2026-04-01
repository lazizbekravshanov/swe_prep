/**
 * Echo cancellation guard.
 *
 * Prevents the AI's own speech from being captured by the mic and
 * sent back to Claude as "user input". Uses timing and text similarity.
 *
 * Three layers of protection:
 * 1. State machine: mic is OFF while TTS is active (primary)
 * 2. Timing guard: discard transcripts captured within 500ms of TTS end
 *    if they resemble the AI's last response
 * 3. Similarity check: discard if >80% word overlap with last AI response
 */

export class EchoGuard {
  private lastAIResponse = '';
  private aiFinishedSpeakingAt = 0;

  /** Store the AI's last response for comparison. */
  setLastAIResponse(text: string): void {
    this.lastAIResponse = text.toLowerCase().trim();
  }

  /** Mark the moment TTS finishes speaking. */
  markAISpeakingDone(): void {
    this.aiFinishedSpeakingAt = Date.now();
  }

  /**
   * Check if a user transcript is actually an echo of the AI's speech.
   * Returns true if the transcript should be discarded.
   */
  isEcho(userTranscript: string): boolean {
    const transcript = userTranscript.toLowerCase().trim();

    if (!transcript || !this.lastAIResponse) return false;

    // Guard 1: Too soon after AI finished (within 500ms) + partial match
    if (Date.now() - this.aiFinishedSpeakingAt < 500) {
      if (this.wordSimilarity(transcript, this.lastAIResponse) > 0.6) {
        return true;
      }
    }

    // Guard 2: High overlap with last AI response regardless of timing
    if (this.wordSimilarity(transcript, this.lastAIResponse) > 0.8) {
      return true;
    }

    return false;
  }

  /** Reset state (e.g., on session start). */
  reset(): void {
    this.lastAIResponse = '';
    this.aiFinishedSpeakingAt = 0;
  }

  /**
   * Jaccard similarity based on word overlap.
   * Returns 0.0 (no overlap) to 1.0 (identical).
   */
  private wordSimilarity(a: string, b: string): number {
    if (a.length === 0 || b.length === 0) return 0;

    const aWords = new Set(a.split(/\s+/));
    const bWords = new Set(b.split(/\s+/));
    const intersection = [...aWords].filter((w) => bWords.has(w));

    return intersection.length / Math.max(aWords.size, bWords.size);
  }
}
