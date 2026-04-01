/**
 * Peer benchmarking — anonymous percentile rankings.
 *
 * For MVP (no server-side aggregation), we compute benchmarks from
 * the user's own session history. In production, this would query
 * aggregated anonymous data from all users.
 *
 * When DB is connected, a nightly cron computes real percentiles
 * across all users, grouped by company + difficulty.
 */

import type { SessionRecord } from './weakness-detector';

export interface Benchmark {
  metric: string;
  userValue: number;
  percentile: number;       // 0-100 (mocked for MVP)
  cohort: string;           // "Google candidates" | "Medium difficulty"
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * Compute benchmark metrics from session records.
 * MVP: percentiles are estimated based on score ranges.
 * Production: query real aggregate data.
 */
export function computeBenchmarks(records: SessionRecord[]): Benchmark[] {
  if (records.length < 3) return [];

  const benchmarks: Benchmark[] = [];

  // Overall score percentile
  const overallScores = records
    .filter((r) => r.feedback?.overall_score)
    .map((r) => r.feedback!.overall_score);

  if (overallScores.length >= 3) {
    const avg = overallScores.reduce((a, b) => a + b, 0) / overallScores.length;
    benchmarks.push({
      metric: 'Overall Score',
      userValue: Math.round(avg * 10) / 10,
      percentile: estimatePercentile(avg, 4),
      cohort: 'All VoicePrep users',
      trend: computeTrend(overallScores),
    });
  }

  // Communication percentile
  const commScores = records
    .filter((r) => r.feedback?.categories?.communication?.score)
    .map((r) => r.feedback!.categories.communication.score);

  if (commScores.length >= 3) {
    const avg = commScores.reduce((a, b) => a + b, 0) / commScores.length;
    benchmarks.push({
      metric: 'Communication',
      userValue: Math.round(avg * 10) / 10,
      percentile: estimatePercentile(avg, 4),
      cohort: 'All candidates',
      trend: computeTrend(commScores),
    });
  }

  // Problem solving percentile
  const psScores = records
    .filter((r) => r.feedback?.categories?.problem_solving?.score)
    .map((r) => r.feedback!.categories.problem_solving.score);

  if (psScores.length >= 3) {
    const avg = psScores.reduce((a, b) => a + b, 0) / psScores.length;
    benchmarks.push({
      metric: 'Problem Solving',
      userValue: Math.round(avg * 10) / 10,
      percentile: estimatePercentile(avg, 4),
      cohort: 'All candidates',
      trend: computeTrend(psScores),
    });
  }

  // Coding speed (sessions per week)
  const now = Date.now();
  const recentSessions = records.filter(
    (r) => now - new Date(r.completedAt).getTime() < 7 * 24 * 60 * 60 * 1000
  );
  if (records.length >= 5) {
    benchmarks.push({
      metric: 'Weekly Practice',
      userValue: recentSessions.length,
      percentile: Math.min(recentSessions.length * 15, 95),
      cohort: 'Active users',
      trend: recentSessions.length >= 3 ? 'improving' : 'stable',
    });
  }

  return benchmarks;
}

/**
 * Estimate percentile from a score on a 1-max scale.
 * Uses a rough bell curve approximation.
 * Production: replace with real percentile lookup.
 */
function estimatePercentile(score: number, max: number): number {
  const normalized = score / max; // 0-1

  // Rough mapping: most users cluster around 2.5-3.0 on a 4-point scale
  if (normalized >= 0.9) return 95;
  if (normalized >= 0.8) return 85;
  if (normalized >= 0.7) return 70;
  if (normalized >= 0.6) return 50;
  if (normalized >= 0.5) return 35;
  if (normalized >= 0.4) return 20;
  return 10;
}

function computeTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
  if (scores.length < 3) return 'stable';
  const recent = scores.slice(-3);
  const older = scores.slice(-6, -3);
  if (older.length === 0) return 'stable';

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  const diff = recentAvg - olderAvg;

  if (diff > 0.3) return 'improving';
  if (diff < -0.3) return 'declining';
  return 'stable';
}
