import Anthropic from '@anthropic-ai/sdk';
import { Problem, ConversationTurn } from '@/lib/types';
import { buildInterviewerPrompt } from '@/lib/ai/prompts';

const client = new Anthropic();

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 300;

/**
 * Stream an interviewer response given the conversation so far.
 * Returns an async iterable of text chunks for real-time TTS playback.
 */
export async function* streamInterviewResponse(
  transcript: ConversationTurn[],
  problem: Problem,
  code?: string,
  company?: string,
): AsyncIterable<string> {
  const systemPrompt = buildInterviewerPrompt({ problem, company, code });

  const messages = transcript.map((turn) => ({
    role: turn.role === 'candidate' ? ('user' as const) : ('assistant' as const),
    content: turn.text,
  }));

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}
