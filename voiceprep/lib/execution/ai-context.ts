import type { ExecutionResult } from './types';

/**
 * Build a context string from code execution results to inject into the
 * Claude conversation. The AI reacts to these results as an interviewer
 * who just watched the candidate run their code.
 */
export function buildExecutionContext(result: ExecutionResult): string {
  if (result.compilationError) {
    return `[SYSTEM: The candidate ran their code but it failed to compile: "${result.compilationError}". React as an interviewer — ask what they think the error means, don't fix it for them.]`;
  }

  if (result.success) {
    return `[SYSTEM: The candidate ran their code. All ${result.totalTests} test cases passed. Acknowledge briefly ("Looks like it passes the test cases"), then ask a follow-up: time complexity, edge cases they might have missed, or optimization.]`;
  }

  // Partial or complete failure
  const failures = result.results.filter((r) => !r.passed);
  const firstFailure = failures[0];

  // Only show the most informative failure — don't dump all of them
  const failureDetail = firstFailure
    ? `Input: ${firstFailure.input}, Expected: ${firstFailure.expectedOutput}, Got: ${firstFailure.actualOutput}`
    : 'Unknown failure';

  return `[SYSTEM: The candidate ran their code. ${result.totalPassed}/${result.totalTests} tests passed.
Most informative failure: ${failureDetail}

React naturally as an interviewer who just saw these results. Don't list all failures. Pick the most informative one and ask a leading question about it. For example: "Hmm, looks like there's an issue with one of the test cases. What happens when the input is ${firstFailure?.input ?? 'empty'}?"]`;
}
