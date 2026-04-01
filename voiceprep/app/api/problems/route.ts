import { getAllProblems, getProblemsByCategory, getProblemsByDifficulty } from '@/lib/problems/bank';
import type { Category, Difficulty } from '@/lib/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get('category') as Category | null;
  const difficulty = url.searchParams.get('difficulty') as Difficulty | null;

  let problems = getAllProblems();

  if (category) {
    problems = getProblemsByCategory(category);
  }

  if (difficulty) {
    const filtered = getProblemsByDifficulty(difficulty);
    if (category) {
      // Intersect with category filter
      const ids = new Set(problems.map((p) => p.id));
      problems = filtered.filter((p) => ids.has(p.id));
    } else {
      problems = filtered;
    }
  }

  return Response.json(problems);
}
