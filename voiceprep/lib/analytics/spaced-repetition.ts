// SM-2 based spaced repetition for interview problems

export interface ReviewItem {
  problemSlug: string;
  problemTitle: string;
  topics: string[];
  dueDate: string; // ISO string
  interval: number; // days
  easeFactor: number; // starts at 2.5
  repetitions: number;
  lastScore: number; // 1-4
}

const STORAGE_KEY = 'voiceprep_review_queue';

/**
 * SM-2 algorithm implementation.
 *
 * Maps the 1-4 interview score to SM-2 quality (0-5):
 *   1 -> 0 (complete blackout)
 *   2 -> 2 (serious difficulty)
 *   3 -> 4 (correct with hesitation)
 *   4 -> 5 (perfect response)
 *
 * Updates ease factor and interval according to SM-2:
 * - If quality < 3: reset repetitions and interval
 * - If quality >= 3: advance repetitions, compute new interval
 * - Ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * - Ease factor minimum: 1.3
 */
export function updateReviewItem(item: ReviewItem, score: number): ReviewItem {
  // Map 1-4 score to SM-2 quality 0-5
  const qualityMap: Record<number, number> = { 1: 0, 2: 2, 3: 4, 4: 5 };
  const quality = qualityMap[Math.max(1, Math.min(4, Math.round(score)))] ?? 2;

  let { easeFactor, repetitions, interval } = item;

  if (quality < 3) {
    // Failed: reset repetitions, short interval for re-review
    repetitions = 0;
    interval = 1;
  } else {
    // Passed: advance through the schedule
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor using SM-2 formula
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Enforce minimum ease factor
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Calculate next due date
  const now = new Date();
  const dueDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    ...item,
    easeFactor,
    repetitions,
    interval,
    lastScore: score,
    dueDate: dueDate.toISOString(),
  };
}

/** Return items whose dueDate is at or before now. */
export function getDueProblems(queue: ReviewItem[]): ReviewItem[] {
  const now = new Date().toISOString();
  return queue
    .filter((item) => item.dueDate <= now)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/** Add or update a problem in the review queue (localStorage). */
export function addToReviewQueue(
  problemSlug: string,
  problemTitle: string,
  topics: string[],
  score: number,
): void {
  const queue = getReviewQueue();
  const existingIndex = queue.findIndex((item) => item.problemSlug === problemSlug);

  if (existingIndex >= 0) {
    // Update existing item with new score
    queue[existingIndex] = updateReviewItem(queue[existingIndex], score);
  } else {
    // Create new item with SM-2 defaults
    const newItem: ReviewItem = {
      problemSlug,
      problemTitle,
      topics,
      dueDate: new Date().toISOString(), // due immediately for first review
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      lastScore: score,
    };
    queue.push(updateReviewItem(newItem, score));
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/** Read the full review queue from localStorage. */
export function getReviewQueue(): ReviewItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReviewItem[];
  } catch {
    return [];
  }
}

/** Remove a problem from the review queue. */
export function removeFromQueue(problemSlug: string): void {
  const queue = getReviewQueue().filter(
    (item) => item.problemSlug !== problemSlug,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}
