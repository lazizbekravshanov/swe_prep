import { executeCode } from '@/lib/execution/piston';
import type { ExecutionRequest } from '@/lib/execution/types';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ExecutionRequest;

    if (!body.code || !body.language || !body.testCases?.length) {
      return Response.json(
        { error: 'Missing code, language, or testCases' },
        { status: 400 },
      );
    }

    // Cap test cases at 10 to prevent abuse
    const testCases = body.testCases.slice(0, 10);

    const result = await executeCode({
      code: body.code,
      language: body.language,
      testCases,
    });

    return Response.json(result);
  } catch (error) {
    console.error('[execute] Error:', error);
    return Response.json(
      { error: 'Code execution failed' },
      { status: 500 },
    );
  }
}
