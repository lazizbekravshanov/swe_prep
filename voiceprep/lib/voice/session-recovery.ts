/**
 * Session recovery via localStorage.
 *
 * Saves session state periodically so users can recover from:
 * - Accidental page refresh
 * - Browser crash
 * - Network loss
 *
 * Data saved: transcript, code, problem, company, candidateLevel, startTime
 * Data NOT saved: audio state (mic/speaker reinitialized on recovery)
 */

import type { ConversationTurn, Problem, LeetCodeProblem, CandidateLevel } from '@/lib/types';

const STORAGE_KEY = 'voiceprep_session_recovery';
const SAVE_INTERVAL = 30_000; // 30 seconds

export interface RecoverableSession {
  transcript: ConversationTurn[];
  code: string;
  problemTitle: string;
  problemSlug: string;
  company: string | null;
  candidateLevel: CandidateLevel;
  startTime: number;
  savedAt: number;
}

/**
 * Start periodic saving of session state.
 * Returns a cleanup function to stop saving.
 */
export function startSessionAutosave(
  getState: () => {
    transcript: ConversationTurn[];
    currentCode: string;
    problem: Problem | LeetCodeProblem | null;
    company: string | null;
    candidateLevel: CandidateLevel;
    startTime: number | null;
  },
): () => void {
  const save = () => {
    const state = getState();
    if (!state.problem || !state.startTime) return;
    if (state.transcript.length === 0) return;

    const session: RecoverableSession = {
      transcript: state.transcript,
      code: state.currentCode,
      problemTitle: state.problem.title,
      problemSlug: 'slug' in state.problem ? state.problem.slug : '',
      company: state.company,
      candidateLevel: state.candidateLevel,
      startTime: state.startTime,
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // localStorage full or unavailable — silent fail
    }
  };

  const intervalId = setInterval(save, SAVE_INTERVAL);

  // Also save on beforeunload
  const handleBeforeUnload = () => save();
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}

/**
 * Check if there's a recoverable session.
 * Returns null if no session or if it's too old (>2 hours).
 */
export function getRecoverableSession(): RecoverableSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session: RecoverableSession = JSON.parse(raw);

    // Discard sessions older than 2 hours
    const twoHours = 2 * 60 * 60 * 1000;
    if (Date.now() - session.savedAt > twoHours) {
      clearRecoverableSession();
      return null;
    }

    // Must have meaningful content
    if (session.transcript.length < 2) {
      clearRecoverableSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Clear the saved session (after successful recovery or dismissal).
 */
export function clearRecoverableSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}
