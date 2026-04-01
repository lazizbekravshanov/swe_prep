export interface RoundConfig {
  type: 'phone_screen' | 'coding_onsite' | 'system_design' | 'behavioral';
  duration: number; // minutes
  problemCount: number;
  difficulty: 'auto' | 'easy' | 'medium' | 'hard';
}

export interface MultiRoundConfig {
  company: string;
  candidateLevel: 'junior' | 'mid' | 'senior';
  rounds: RoundConfig[];
}

export interface RoundResult {
  type: string;
  score: number;
  hireDecision: string;
  summary: string;
  duration: number;
}

export interface MultiRoundFeedback {
  rounds: RoundResult[];
  composite: {
    overallScore: number;
    hireDecision: string;
    staminaScore: number;
    consistencyScore: number;
    strongestRound: string;
    weakestRound: string;
    readinessLevel: 'Ready to interview' | 'Needs more practice' | 'Not ready';
  };
  narrative: string;
}

// ─── Presets ───

export const PRESET_CONFIGS: Record<string, MultiRoundConfig> = {
  full_onsite: {
    company: '',
    candidateLevel: 'mid',
    rounds: [
      { type: 'phone_screen', duration: 45, problemCount: 1, difficulty: 'auto' },
      { type: 'coding_onsite', duration: 45, problemCount: 2, difficulty: 'auto' },
      { type: 'system_design', duration: 45, problemCount: 1, difficulty: 'auto' },
      { type: 'behavioral', duration: 30, problemCount: 1, difficulty: 'auto' },
    ],
  },
  quick_practice: {
    company: '',
    candidateLevel: 'mid',
    rounds: [
      { type: 'phone_screen', duration: 25, problemCount: 1, difficulty: 'medium' },
    ],
  },
  coding_focus: {
    company: '',
    candidateLevel: 'mid',
    rounds: [
      { type: 'phone_screen', duration: 45, problemCount: 1, difficulty: 'auto' },
      { type: 'coding_onsite', duration: 45, problemCount: 2, difficulty: 'auto' },
    ],
  },
  senior_loop: {
    company: '',
    candidateLevel: 'senior',
    rounds: [
      { type: 'phone_screen', duration: 45, problemCount: 1, difficulty: 'hard' },
      { type: 'coding_onsite', duration: 45, problemCount: 2, difficulty: 'hard' },
      { type: 'system_design', duration: 45, problemCount: 1, difficulty: 'hard' },
      { type: 'behavioral', duration: 30, problemCount: 1, difficulty: 'hard' },
    ],
  },
};

// ─── Difficulty Adaptation ───

export function adaptDifficulty(
  previousScore: number,
  currentDifficulty: string
): string {
  const levels = ['easy', 'medium', 'hard'];
  const currentIdx = levels.indexOf(currentDifficulty);

  if (previousScore >= 3.5) {
    // Increase difficulty
    return currentIdx < levels.length - 1 ? levels[currentIdx + 1] : 'hard';
  }

  if (previousScore <= 2.0) {
    // Decrease difficulty
    return currentIdx > 0 ? levels[currentIdx - 1] : 'easy';
  }

  // Stay the same
  return currentDifficulty;
}

// ─── Composite Feedback ───

export function calculateCompositeFeedback(
  rounds: RoundResult[]
): MultiRoundFeedback['composite'] {
  if (rounds.length === 0) {
    return {
      overallScore: 0,
      hireDecision: 'no_hire',
      staminaScore: 0,
      consistencyScore: 0,
      strongestRound: '',
      weakestRound: '',
      readinessLevel: 'Not ready',
    };
  }

  // Weighted average: coding and system design rounds weigh more
  const weights: Record<string, number> = {
    phone_screen: 1.0,
    coding_onsite: 1.5,
    system_design: 1.5,
    behavioral: 0.8,
  };

  let totalWeight = 0;
  let weightedSum = 0;

  for (const round of rounds) {
    const w = weights[round.type] ?? 1.0;
    weightedSum += round.score * w;
    totalWeight += w;
  }

  const overallScore =
    totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;

  // Stamina: compare first round vs last round score
  const firstScore = rounds[0].score;
  const lastScore = rounds[rounds.length - 1].score;
  const staminaDelta = lastScore - firstScore;
  // Normalize stamina: +1 means improved, -1 means dropped, 0 means same
  // Scale to 0-4 where 2 is "held steady"
  const staminaScore = Math.max(0, Math.min(4, 2 + staminaDelta));

  // Consistency: based on standard deviation (lower is better)
  const scores = rounds.map((r) => r.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  // Convert stdDev to a 0-4 score (0 stdDev = 4, 2 stdDev = 0)
  const consistencyScore = Math.max(0, Math.min(4, 4 - stdDev * 2));

  // Strongest and weakest rounds
  let strongestIdx = 0;
  let weakestIdx = 0;
  for (let i = 1; i < rounds.length; i++) {
    if (rounds[i].score > rounds[strongestIdx].score) strongestIdx = i;
    if (rounds[i].score < rounds[weakestIdx].score) weakestIdx = i;
  }

  const strongestRound = getRoundLabel(rounds[strongestIdx].type);
  const weakestRound = getRoundLabel(rounds[weakestIdx].type);

  // Hire decision
  let hireDecision: string;
  if (overallScore >= 3.5) hireDecision = 'strong_hire';
  else if (overallScore >= 2.8) hireDecision = 'hire';
  else if (overallScore >= 2.0) hireDecision = 'lean_no';
  else hireDecision = 'no_hire';

  // Readiness level
  let readinessLevel: MultiRoundFeedback['composite']['readinessLevel'];
  if (overallScore >= 3.0 && consistencyScore >= 2.5) {
    readinessLevel = 'Ready to interview';
  } else if (overallScore >= 2.0) {
    readinessLevel = 'Needs more practice';
  } else {
    readinessLevel = 'Not ready';
  }

  return {
    overallScore,
    hireDecision,
    staminaScore: Math.round(staminaScore * 100) / 100,
    consistencyScore: Math.round(consistencyScore * 100) / 100,
    strongestRound,
    weakestRound,
    readinessLevel,
  };
}

// ─── Labels ───

export function getRoundLabel(type: string): string {
  const labels: Record<string, string> = {
    phone_screen: 'Phone Screen',
    coding_onsite: 'Coding (Onsite)',
    system_design: 'System Design',
    behavioral: 'Behavioral',
  };

  return labels[type] ?? type;
}
