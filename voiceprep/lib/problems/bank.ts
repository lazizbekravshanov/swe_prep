import handcraftedData from '@/data/problems/problems.json';
import allProblemsData from '@/data/problems/all_problems.json';
import enrichedData from '@/data/problems/enriched_problems.json';
import type { Problem, LeetCodeProblem, EnrichedProblem, Category, Difficulty } from '@/lib/types';

const handcraftedProblems: Problem[] = handcraftedData as unknown as Problem[];

// Company-wise problems (from liquidslr parser)
const allProblemsWrapper = allProblemsData as unknown as {
  total_unique_problems: number;
  problems: LeetCodeProblem[];
};
const leetcodeProblems: LeetCodeProblem[] = allProblemsWrapper.problems;

// Enriched problems (descriptions joined from neenza dataset)
const enrichedWrapper = enrichedData as unknown as {
  total: number;
  problems: EnrichedProblem[];
};
const enrichedProblems: EnrichedProblem[] = enrichedWrapper.problems;
const enrichedBySlug = new Map<string, EnrichedProblem>();
for (const p of enrichedProblems) {
  enrichedBySlug.set(p.slug, p);
}

// --- Handcrafted problems (full voice scripts + rubrics) ---

export function getAllProblems(): Problem[] {
  return handcraftedProblems;
}

export function getProblemById(id: string): Problem | undefined {
  return handcraftedProblems.find((p) => p.id === id);
}

export function getProblemsByCategory(category: Category): Problem[] {
  return handcraftedProblems.filter((p) => p.category === category);
}

export function getProblemsByDifficulty(difficulty: Difficulty): Problem[] {
  return handcraftedProblems.filter((p) => p.difficulty === difficulty);
}

// --- LeetCode problems (company-wise data) ---

export function getAllLeetCodeProblems(): LeetCodeProblem[] {
  return leetcodeProblems;
}

export function getLeetCodeProblemBySlug(slug: string): LeetCodeProblem | undefined {
  return leetcodeProblems.find((p) => p.slug === slug);
}

export function getLeetCodeProblemsByCompany(company: string): LeetCodeProblem[] {
  return leetcodeProblems.filter((p) => p.companies.includes(company));
}

export function getLeetCodeProblemsByTopic(topic: string): LeetCodeProblem[] {
  return leetcodeProblems.filter((p) => p.topics.includes(topic));
}

/**
 * Select a problem for an interview session, weighted by company frequency.
 */
export function selectProblem(params: {
  company: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  topic?: string;
  excludeSlugs?: string[];
}): LeetCodeProblem | null {
  let candidates = leetcodeProblems.filter((p) =>
    p.companies.includes(params.company)
  );

  if (params.excludeSlugs?.length) {
    const excluded = new Set(params.excludeSlugs);
    candidates = candidates.filter((p) => !excluded.has(p.slug));
  }

  if (params.difficulty) {
    candidates = candidates.filter((p) => p.difficulty === params.difficulty);
  }

  if (params.topic) {
    const topic = params.topic;
    candidates = candidates.filter((p) => p.topics.includes(topic));
  }

  if (candidates.length === 0) return null;

  // Sort by company-specific frequency (most asked first)
  candidates.sort(
    (a, b) =>
      (b.company_frequency[params.company] ?? 0) -
      (a.company_frequency[params.company] ?? 0)
  );

  // Pick randomly from top 10 to add variety
  const topN = candidates.slice(0, Math.min(10, candidates.length));
  return topN[Math.floor(Math.random() * topN.length)];
}

/**
 * Get unique topics across all LeetCode problems for a company.
 */
export function getTopicsForCompany(company: string): string[] {
  const topics = new Set<string>();
  for (const p of leetcodeProblems) {
    if (p.companies.includes(company)) {
      for (const t of p.topics) {
        topics.add(t);
      }
    }
  }
  return Array.from(topics).sort();
}

// --- Enriched problems (descriptions + company data joined) ---

export function getEnrichedProblemBySlug(slug: string): EnrichedProblem | undefined {
  return enrichedBySlug.get(slug);
}

export function getEnrichedProblemsWithDescriptions(): EnrichedProblem[] {
  return enrichedProblems.filter((p) => p.has_description);
}

export function getEnrichedProblemsByCompany(company: string): EnrichedProblem[] {
  return enrichedProblems.filter((p) => p.companies.includes(company));
}

export function getTotalEnrichedCount(): number {
  return enrichedProblems.length;
}

export function getEnrichedWithDescriptionCount(): number {
  return enrichedProblems.filter((p) => p.has_description).length;
}
