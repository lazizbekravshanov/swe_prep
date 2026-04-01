/**
 * Anxiety progression training — 4 pressure levels.
 * Each level modifies the interviewer's personality and timing.
 */

export interface PressureLevel {
  level: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  personality: string;
  silenceTimeoutMs: number;
  hintAvailability: boolean;
  interruptionRate: number; // 0-1 probability AI interrupts mid-answer
  followUpAggression: 'gentle' | 'moderate' | 'aggressive' | 'panel';
  unlockRequirement: string;
}

export const PRESSURE_LEVELS: PressureLevel[] = [
  {
    level: 1,
    name: 'Supportive',
    description: 'Patient and encouraging. Great for building confidence.',
    personality: `Very patient and encouraging. Give generous time to think. Offer hints proactively if the candidate seems stuck for more than 15 seconds. Say things like "take your time" and "you're on the right track." Never express time pressure. Celebrate small wins: "That's a good insight."`,
    silenceTimeoutMs: 30000,
    hintAvailability: true,
    interruptionRate: 0,
    followUpAggression: 'gentle',
    unlockRequirement: 'Available by default',
  },
  {
    level: 2,
    name: 'Neutral',
    description: 'Professional and balanced. Standard interview pace.',
    personality: `Professional and balanced. Standard interview pace. Give hints only when asked. Don't fill silence — let it hang. Neutral acknowledgments: "OK", "I see", "Go on". Don't provide encouragement beyond brief acknowledgments.`,
    silenceTimeoutMs: 15000,
    hintAvailability: true,
    interruptionRate: 0.1,
    followUpAggression: 'moderate',
    unlockRequirement: 'Score 3.0+ avg at Level 1 across 3 sessions',
  },
  {
    level: 3,
    name: 'Challenging',
    description: 'Pushes hard on every answer. No hints.',
    personality: `Push hard on every answer. Ask "are you sure about that?" frequently. Point out flaws immediately. Shorter time tolerance. Say things like "we're running low on time" even if we're not. After they give a solution, ask "can you do better?" Don't give hints. If they ask for help, say "what's your instinct?"`,
    silenceTimeoutMs: 10000,
    hintAvailability: false,
    interruptionRate: 0.3,
    followUpAggression: 'aggressive',
    unlockRequirement: 'Score 3.0+ avg at Level 2 across 3 sessions',
  },
  {
    level: 4,
    name: 'Stress Test',
    description: 'Panel interview simulation. Two interviewers, rapid-fire.',
    personality: `You are TWO interviewers: Alex (technical) and Jordan (behavioral). Alternate between them. Alex asks technical deep-dives. Jordan asks clarifying questions about what was just said. Interrupt politely but frequently: "Sorry, let me jump in here — when you say X, do you mean...?" Keep the pace fast. Questions should come in rapid succession. This is a panel interview — the candidate must handle multiple conversation threads.`,
    silenceTimeoutMs: 8000,
    hintAvailability: false,
    interruptionRate: 0.5,
    followUpAggression: 'panel',
    unlockRequirement: 'Score 3.0+ avg at Level 3 across 3 sessions',
  },
];

export function getPressureLevel(level: number): PressureLevel {
  return PRESSURE_LEVELS[Math.min(level - 1, PRESSURE_LEVELS.length - 1)];
}

export function buildPressurePromptModifier(level: PressureLevel): string {
  return `\n## INTERVIEWER PRESSURE LEVEL: ${level.name} (Level ${level.level}/4)

${level.personality}

${level.interruptionRate > 0 ? `Interruption probability: ${Math.round(level.interruptionRate * 100)}% — occasionally interrupt the candidate mid-answer with a follow-up or pushback. Be polite but firm.` : 'Do NOT interrupt the candidate while they are speaking.'}

${!level.hintAvailability ? 'HINTS ARE DISABLED. Do not offer hints proactively. If asked, deflect: "What\'s your instinct here?"' : 'Hints are available. Offer them when the candidate is clearly stuck.'}
`;
}
