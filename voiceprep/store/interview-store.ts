import { create } from 'zustand';
import type { ConversationTurn, Problem, LeetCodeProblem, SessionState, CandidateLevel } from '@/lib/types';

type AnyProblem = Problem | LeetCodeProblem;

interface InterviewState {
  state: SessionState;
  transcript: ConversationTurn[];
  currentCode: string;
  problem: AnyProblem | null;
  company: string | null;
  candidateLevel: CandidateLevel;
  startTime: number | null;
  hintLevel: number;
  isAISpeaking: boolean;
  isMicActive: boolean;
  interimTranscript: string;
}

interface InterviewActions {
  setState: (state: SessionState) => void;
  addTurn: (turn: ConversationTurn) => void;
  setCode: (code: string) => void;
  setProblem: (problem: AnyProblem) => void;
  setCompany: (company: string | null) => void;
  setCandidateLevel: (level: CandidateLevel) => void;
  setInterimTranscript: (text: string) => void;
  incrementHintLevel: () => void;
  startSession: (problem: AnyProblem) => void;
  endSession: () => void;
  reset: () => void;
}

const initialState: InterviewState = {
  state: 'idle',
  transcript: [],
  currentCode: '',
  problem: null,
  company: null,
  candidateLevel: 'mid',
  startTime: null,
  hintLevel: 0,
  isAISpeaking: false,
  isMicActive: false,
  interimTranscript: '',
};

export const useInterviewStore = create<InterviewState & InterviewActions>()(
  (set) => ({
    ...initialState,

    setState: (state) => set({ state }),

    addTurn: (turn) =>
      set((prev) => ({ transcript: [...prev.transcript, turn] })),

    setCode: (code) => set({ currentCode: code }),

    setProblem: (problem) => set({ problem }),

    setCompany: (company) => set({ company }),

    setCandidateLevel: (level) => set({ candidateLevel: level }),

    setInterimTranscript: (text) => set({ interimTranscript: text }),

    incrementHintLevel: () =>
      set((prev) => ({ hintLevel: prev.hintLevel + 1 })),

    startSession: (problem) =>
      set({ problem, state: 'speaking', startTime: Date.now() }),

    endSession: () => set({ state: 'ended' }),

    reset: () => set(initialState),
  }),
);
