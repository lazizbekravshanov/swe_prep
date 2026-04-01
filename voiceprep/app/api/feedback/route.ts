import Anthropic from '@anthropic-ai/sdk';
import { FEEDBACK_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import type { ConversationTurn, Problem } from '@/lib/types';

export async function POST(req: Request) {
  const { transcript, problem, code } = (await req.json()) as {
    transcript: ConversationTurn[];
    problem: Problem;
    code: string;
  };

  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: FEEDBACK_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Problem: ${JSON.stringify(problem)}\n\nTranscript: ${JSON.stringify(transcript)}\n\nFinal Code:\n${code}\n\nGenerate a detailed interview scorecard as JSON.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Extract JSON from the response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: 'Failed to parse feedback' }, { status: 500 });
  }

  try {
    const feedback = JSON.parse(jsonMatch[0]);
    return Response.json(feedback);
  } catch {
    return Response.json({ error: 'Invalid JSON in feedback response' }, { status: 500 });
  }
}
