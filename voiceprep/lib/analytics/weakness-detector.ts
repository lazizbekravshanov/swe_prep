// Weakness detection from client-side session data (localStorage for MVP)

export interface WeaknessSignal {
  topic: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string;
  sessionCount: number;
  lastScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface SessionRecord {
  id: string;
  problemTitle: string;
  topics: string[];
  difficulty: string;
  feedback: {
    overall_score: number;
    categories: {
      problem_solving: { score: number };
      coding: { score: number };
      communication: { score: number };
      edge_cases: { score: number };
    };
  } | null;
  hintLevelReached: number;
  completedAt: string;
}

const STORAGE_KEY = 'voiceprep_sessions';

/** Save a session record to localStorage. */
export function saveSessionRecord(record: SessionRecord): void {
  const records = getSessionRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/** Read all session records from localStorage. */
export function getSessionRecords(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

/**
 * Simple linear regression on an array of scores to determine trend direction.
 * Returns 'improving' if slope > threshold, 'declining' if slope < -threshold, else 'stable'.
 */
export function calculateTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
  if (scores.length < 2) return 'stable';

  const n = scores.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += scores[i];
    sumXY += i * scores[i];
    sumX2 += i * i;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return 'stable';

  const slope = (n * sumXY - sumX * sumY) / denominator;

  // Threshold: a slope of 0.1 per session is meaningful on a 1-4 scale
  if (slope > 0.1) return 'improving';
  if (slope < -0.1) return 'declining';
  return 'stable';
}

/**
 * Analyze session records to detect weakness patterns.
 *
 * Patterns detected:
 * 1. Topic weakness: scored below 2.5 overall in 3+ sessions on the same topic
 * 2. Communication weakness: consistently low communication scores
 * 3. Code implementation gap: approach score significantly exceeds coding score
 * 4. Edge case blindness: average edge_cases score < 2.0
 * 5. Hint dependency: needed hints level 3+ in >50% of sessions
 */
export function detectWeaknesses(records: SessionRecord[]): WeaknessSignal[] {
  const signals: WeaknessSignal[] = [];
  const scored = records.filter((r) => r.feedback !== null);

  if (scored.length === 0) return signals;

  // 1. Topic weakness: scored below 2.5 in 3+ sessions on same topic
  const topicScores = new Map<string, number[]>();
  for (const r of scored) {
    for (const topic of r.topics) {
      if (!topicScores.has(topic)) topicScores.set(topic, []);
      topicScores.get(topic)!.push(r.feedback!.overall_score);
    }
  }

  for (const [topic, scores] of topicScores) {
    const lowScores = scores.filter((s) => s < 2.5);
    if (lowScores.length >= 3) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const severity: WeaknessSignal['severity'] =
        avg < 1.5 ? 'high' : avg < 2.0 ? 'medium' : 'low';

      signals.push({
        topic,
        severity,
        evidence: `Scored below 2.5 in ${lowScores.length} of ${scores.length} sessions on ${topic}`,
        sessionCount: scores.length,
        lastScore: scores[scores.length - 1],
        trend: calculateTrend(scores),
      });
    }
  }

  // 2. Communication weakness: consistently low communication scores
  const commScores = scored.map((r) => r.feedback!.categories.communication.score);
  const commAvg = commScores.reduce((a, b) => a + b, 0) / commScores.length;

  if (commAvg < 2.5 && scored.length >= 2) {
    const severity: WeaknessSignal['severity'] =
      commAvg < 1.5 ? 'high' : commAvg < 2.0 ? 'medium' : 'low';

    signals.push({
      topic: 'Communication',
      severity,
      evidence: `Average communication score is ${commAvg.toFixed(1)}/4 across ${scored.length} sessions`,
      sessionCount: scored.length,
      lastScore: commScores[commScores.length - 1],
      trend: calculateTrend(commScores),
    });
  }

  // 3. Code implementation gap: approach score >> coding score
  const psScores = scored.map((r) => r.feedback!.categories.problem_solving.score);
  const codingScores = scored.map((r) => r.feedback!.categories.coding.score);
  const psAvg = psScores.reduce((a, b) => a + b, 0) / psScores.length;
  const codingAvg = codingScores.reduce((a, b) => a + b, 0) / codingScores.length;

  if (psAvg - codingAvg >= 1.0 && scored.length >= 2) {
    const severity: WeaknessSignal['severity'] =
      psAvg - codingAvg >= 2.0 ? 'high' : psAvg - codingAvg >= 1.5 ? 'medium' : 'low';

    signals.push({
      topic: 'Code Implementation',
      severity,
      evidence: `Problem-solving avg (${psAvg.toFixed(1)}) is significantly higher than coding avg (${codingAvg.toFixed(1)})`,
      sessionCount: scored.length,
      lastScore: codingScores[codingScores.length - 1],
      trend: calculateTrend(codingScores),
    });
  }

  // 4. Edge case blindness: average edge_cases score < 2.0
  const edgeScores = scored.map((r) => r.feedback!.categories.edge_cases.score);
  const edgeAvg = edgeScores.reduce((a, b) => a + b, 0) / edgeScores.length;

  if (edgeAvg < 2.0 && scored.length >= 2) {
    const severity: WeaknessSignal['severity'] =
      edgeAvg < 1.0 ? 'high' : edgeAvg < 1.5 ? 'medium' : 'low';

    signals.push({
      topic: 'Edge Cases',
      severity,
      evidence: `Average edge case score is ${edgeAvg.toFixed(1)}/4 across ${scored.length} sessions`,
      sessionCount: scored.length,
      lastScore: edgeScores[edgeScores.length - 1],
      trend: calculateTrend(edgeScores),
    });
  }

  // 5. Hint dependency: needing hints level 3+ in >50% of sessions
  const totalSessions = records.length;
  const heavyHintSessions = records.filter((r) => r.hintLevelReached >= 3).length;
  const hintRatio = heavyHintSessions / totalSessions;

  if (hintRatio > 0.5 && totalSessions >= 3) {
    const severity: WeaknessSignal['severity'] =
      hintRatio > 0.8 ? 'high' : hintRatio > 0.65 ? 'medium' : 'low';

    // Use overall scores as proxy for trend on hint dependency
    const overallScores = scored.map((r) => r.feedback!.overall_score);

    signals.push({
      topic: 'Hint Dependency',
      severity,
      evidence: `Needed level 3+ hints in ${heavyHintSessions} of ${totalSessions} sessions (${Math.round(hintRatio * 100)}%)`,
      sessionCount: totalSessions,
      lastScore: overallScores.length > 0 ? overallScores[overallScores.length - 1] : 0,
      trend: calculateTrend(overallScores),
    });
  }

  // Sort by severity: high first, then medium, then low
  const severityOrder: Record<WeaknessSignal['severity'], number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  signals.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return signals;
}
