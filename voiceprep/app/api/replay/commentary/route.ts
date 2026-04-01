import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { ConversationTurn } from '@/lib/types';

const client = new Anthropic();

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 2000;

const SYSTEM_PROMPT = `You are a senior SWE interview coach reviewing a recorded mock interview. Generate timestamped commentary. Output a JSON array.

Each element must have:
- timestamp (number): seconds from session start
- type: one of "positive", "negative", "tip", "insight"
- text (string): your commentary
- category: one of "communication", "problem_solving", "coding", "edge_cases", "timing"

Return ONLY the JSON array, no other text.`;

interface CommentaryAnnotation {
  timestamp: number;
  type: 'positive' | 'negative' | 'tip' | 'insight';
  text: string;
  category: 'communication' | 'problem_solving' | 'coding' | 'edge_cases' | 'timing';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript, codeSnapshot, feedback } = body as {
      transcript: ConversationTurn[];
      codeSnapshot: string;
      feedback: object;
    };

    const formattedTranscript = transcript
      .map(
        (turn) =>
          `[${Math.floor(turn.timestamp)}s] [${turn.role.toUpperCase()}]: ${turn.text}`
      )
      .join('\n');

    const userMessage = `## Interview Transcript
${formattedTranscript}

## Final Code Snapshot
\`\`\`
${codeSnapshot}
\`\`\`

## Session Feedback Summary
${JSON.stringify(feedback, null, 2)}

Generate timestamped commentary for this interview session.`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    const annotations: CommentaryAnnotation[] = JSON.parse(text);

    return NextResponse.json(annotations);
  } catch (error) {
    console.error('Commentary generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate commentary' },
      { status: 500 }
    );
  }
}
