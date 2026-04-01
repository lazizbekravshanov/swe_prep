import Anthropic from '@anthropic-ai/sdk';
import { Problem, ConversationTurn, SessionFeedback } from '@/lib/types';
import { FEEDBACK_SYSTEM_PROMPT } from '@/lib/ai/prompts';

const client = new Anthropic();

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1500;

/**
 * Generate a post-interview feedback scorecard.
 * Calls Claude (non-streaming) and parses the JSON response into SessionFeedback.
 */
export async function generateFeedback(
  transcript: ConversationTurn[],
  problem: Problem,
  code: string,
): Promise<SessionFeedback> {
  const formattedTranscript = transcript
    .map((turn) => `[${turn.role.toUpperCase()}]: ${turn.text}`)
    .join('\n');

  const userMessage = `## Problem
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}

## Candidate's Final Code
\`\`\`
${code}
\`\`\`

## Full Transcript
${formattedTranscript}

## Evaluation Rubric
Approach: ${problem.rubric.approach}
Edge cases: ${problem.rubric.edge_cases.join(', ')}
Optimization: ${problem.rubric.optimization}
Optimal time complexity: ${problem.time_complexity}
Optimal space complexity: ${problem.space_complexity}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: FEEDBACK_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  const parsed = JSON.parse(text) as Omit<SessionFeedback, 'transcript'>;

  return {
    ...parsed,
    transcript,
  };
}
