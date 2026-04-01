import Anthropic from '@anthropic-ai/sdk';
import { buildInterviewerPrompt } from '@/lib/ai/prompts';
import { getCompanyByName } from '@/lib/problems/companies';
import type { ConversationTurn, Problem, LeetCodeProblem, CandidateLevel } from '@/lib/types';

export async function POST(req: Request) {
  const { transcript, problem, code, company, candidateLevel, hintLevel } = (await req.json()) as {
    transcript: ConversationTurn[];
    problem: Problem | LeetCodeProblem;
    code: string;
    company?: string;
    candidateLevel?: CandidateLevel;
    hintLevel?: number;
  };

  const client = new Anthropic();

  const companyProfile = company ? getCompanyByName(company) : undefined;
  const systemPrompt = buildInterviewerPrompt({
    problem,
    company,
    companyProfile,
    code,
    candidateLevel: candidateLevel ?? 'mid',
    hintLevel: hintLevel ?? 0,
  });

  const messages = transcript.map((turn) => ({
    role: (turn.role === 'candidate' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: turn.text,
  }));

  if (messages.length === 0) {
    messages.push({ role: 'user', content: '[Interview session started. Introduce yourself and present the problem.]' });
  }

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
