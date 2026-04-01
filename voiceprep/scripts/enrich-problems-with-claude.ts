#!/usr/bin/env npx tsx
/**
 * scripts/enrich-problems-with-claude.ts
 *
 * Runs Claude enrichment on problems to generate:
 * - voice_intro: how to verbally present the problem
 * - key_insight: the one thing a candidate needs to realize
 * - patterns: algorithmic patterns used
 * - common_mistakes: what candidates typically get wrong
 * - follow_up_questions: what to ask after they solve it
 * - time_complexity / space_complexity
 *
 * Usage:
 *   npx tsx scripts/enrich-problems-with-claude.ts --input data/problems/enriched_problems.json --output data/problems/claude_enriched.json --limit 200
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

const client = new Anthropic();

interface EnrichedProblem {
  slug: string;
  title: string;
  difficulty: string;
  topics: string[];
  description_text?: string;
  has_description: boolean;
  [key: string]: unknown;
}

interface ClaudeEnrichment {
  voice_intro: string;
  key_insight: string;
  patterns: string[];
  common_mistakes: string[];
  follow_up_questions: string[];
  time_complexity: string;
  space_complexity: string;
  difficulty_justification: string;
}

async function enrichProblem(problem: EnrichedProblem): Promise<ClaudeEnrichment | null> {
  const descContext = problem.description_text
    ? `Description: ${problem.description_text}`
    : `You know this LeetCode problem. Generate metadata from your knowledge.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: `You are a senior SWE interview coach. Given a LeetCode problem, generate structured interview metadata. Respond with ONLY a JSON object, no markdown fences.`,
      messages: [{
        role: 'user',
        content: `Problem: ${problem.title}
Difficulty: ${problem.difficulty}
Topics: ${problem.topics.join(', ')}
${descContext}

Generate this exact JSON structure:
{
  "voice_intro": "A natural 30-40 second verbal introduction to this problem, as if you're an interviewer reading it aloud. Don't say 'the problem is called X'. Just describe it conversationally.",
  "key_insight": "The one key insight or 'aha moment' needed to solve this optimally",
  "patterns": ["pattern-name-1", "pattern-name-2"],
  "common_mistakes": ["Mistake 1", "Mistake 2", "Mistake 3"],
  "follow_up_questions": ["Follow-up 1?", "Follow-up 2?", "Follow-up 3?"],
  "time_complexity": "O(...)",
  "space_complexity": "O(...)",
  "difficulty_justification": "Why this is [easy/medium/hard] — one sentence"
}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as ClaudeEnrichment;
  } catch (error) {
    console.error(`  Error enriching ${problem.slug}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  let inputPath = 'data/problems/enriched_problems.json';
  let outputPath = 'data/problems/claude_enriched.json';
  let limit = 200;
  let offset = 0;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) inputPath = args[++i];
    else if (args[i] === '--output' && args[i + 1]) outputPath = args[++i];
    else if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[++i], 10);
    else if (args[i] === '--offset' && args[i + 1]) offset = parseInt(args[++i], 10);
  }

  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputPath}`);
  console.log(`Limit: ${limit}, Offset: ${offset}`);

  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const allProblems: EnrichedProblem[] = raw.problems || raw;

  // Load existing enrichments to skip already-done problems
  let existing: Record<string, ClaudeEnrichment> = {};
  if (fs.existsSync(outputPath)) {
    const existingData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    if (existingData.enrichments) {
      existing = existingData.enrichments;
    }
  }

  // Select problems to enrich (skip already enriched)
  const toEnrich = allProblems
    .slice(offset)
    .filter(p => !existing[p.slug])
    .slice(0, limit);

  console.log(`\n${Object.keys(existing).length} already enriched`);
  console.log(`${toEnrich.length} problems to enrich\n`);

  const enrichments: Record<string, ClaudeEnrichment> = { ...existing };
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < toEnrich.length; i++) {
    const problem = toEnrich[i];
    process.stdout.write(`[${i + 1}/${toEnrich.length}] ${problem.title}... `);

    const result = await enrichProblem(problem);
    if (result) {
      enrichments[problem.slug] = result;
      successCount++;
      console.log('OK');
    } else {
      errorCount++;
      console.log('FAILED');
    }

    // Save periodically (every 10 problems)
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(outputPath, JSON.stringify({
        total_enriched: Object.keys(enrichments).length,
        enrichments,
      }, null, 2));
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Final save
  fs.writeFileSync(outputPath, JSON.stringify({
    total_enriched: Object.keys(enrichments).length,
    enrichments,
  }, null, 2));

  console.log(`\nDone: ${successCount} enriched, ${errorCount} failed`);
  console.log(`Total enrichments: ${Object.keys(enrichments).length}`);
  console.log(`Saved to ${outputPath}`);
}

main().catch(console.error);
