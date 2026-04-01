// Core types for VoicePrep

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'arrays' | 'strings' | 'trees' | 'graphs' | 'dp' | 'system_design';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

// Handcrafted problems with full voice scripts and rubrics
export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: Category;
  companies: string[];
  description: string;
  examples: Example[];
  constraints: string[];
  hints: string[];
  optimal_solution: string;
  time_complexity: string;
  space_complexity: string;
  follow_ups: string[];
  rubric: {
    approach: string;
    edge_cases: string[];
    optimization: string;
  };
  voice_script: {
    intro: string;
    clarifications: Record<string, string>;
  };
}

// LeetCode problems from the company-wise repo (lighter weight)
export interface LeetCodeProblem {
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  acceptance_rate: number;  // 0-100 percentage
  link: string;
  topics: string[];
  companies: string[];
  company_frequency: Record<string, number>;
}

// Company profile from parsed data
export interface CompanyProfile {
  name: string;
  slug: string;
  total_problems: number;
  recent_problems_30d: number;
  difficulty_distribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  top_topics: { topic: string; count: number }[];
  recent_hot_topics: { topic: string; count: number }[];
  highest_frequency_problems: {
    title: string;
    difficulty: string;
    frequency: number;
    slug: string;
  }[];
  interview_focus: {
    primary_categories: string[];
    style_notes: string[];
  };
}

// Enriched problem: LeetCode problem joined with descriptions from neenza dataset
export interface EnrichedProblem {
  slug: string;
  title: string;
  difficulty: string;
  link: string;
  topics: string[];
  companies: string[];
  company_frequency: Record<string, number>;
  acceptance_rate: number;
  has_description: boolean;
  description: string;
  description_text: string;
  examples: { input: string; output: string; explanation: string }[];
  constraints: string[];
  hints: string[];
  follow_ups: string[];
  code_snippets: Record<string, string>;
  has_solution: boolean;
  frontend_id: number | null;
}

export type CandidateLevel = 'junior' | 'mid' | 'senior';
export type PrepMode = 'hot_seat' | 'deep_prep' | 'weak_areas' | 'random';

export interface ConversationTurn {
  role: 'candidate' | 'interviewer';
  text: string;
  timestamp: number;
}

export type SessionState = 'idle' | 'listening' | 'processing' | 'speaking' | 'paused' | 'ended';

export type SessionEvent =
  | { type: 'START_INTERVIEW'; problem: Problem }
  | { type: 'SPEECH_DETECTED'; text: string }
  | { type: 'SILENCE_TIMEOUT' }
  | { type: 'AI_RESPONSE_READY'; text: string }
  | { type: 'TTS_FINISHED' }
  | { type: 'USER_INTERRUPT' }
  | { type: 'CODE_UPDATED'; code: string }
  | { type: 'END_SESSION' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' };

export interface SessionFeedback {
  overall_score: number;
  categories: {
    problem_solving: { score: number; notes: string };
    coding: { score: number; notes: string };
    communication: { score: number; notes: string };
    edge_cases: { score: number; notes: string };
  };
  strengths: string[];
  improvements: string[];
  hire_decision: 'strong_hire' | 'hire' | 'lean_no' | 'no_hire';
  transcript: ConversationTurn[];
}
