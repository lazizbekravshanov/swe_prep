/**
 * Code execution via the Piston API.
 * https://github.com/engineer-man/piston
 *
 * Piston runs code in isolated containers with resource limits.
 * We use the public instance for MVP; self-host for production.
 */

import type { ExecutionRequest, ExecutionResult, TestResult } from './types';

const PISTON_URL = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston';

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.12' },
  javascript: { language: 'javascript', version: '18.15' },
  typescript: { language: 'typescript', version: '5.0' },
  java: { language: 'java', version: '15.0' },
  cpp: { language: 'c++', version: '10.2' },
  go: { language: 'go', version: '1.16' },
};

/**
 * Execute code against a set of test cases using Piston.
 */
export async function executeCode(req: ExecutionRequest): Promise<ExecutionResult> {
  const langConfig = LANGUAGE_MAP[req.language];
  if (!langConfig) {
    return {
      success: false,
      results: [],
      totalPassed: 0,
      totalTests: req.testCases.length,
      compilationError: `Unsupported language: ${req.language}`,
    };
  }

  const results: TestResult[] = [];

  for (const testCase of req.testCases) {
    const wrappedCode = wrapCode(req.code, req.language, testCase.input);

    try {
      const response = await fetch(`${PISTON_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: langConfig.language,
          version: langConfig.version,
          files: [{ content: wrappedCode }],
          run_timeout: 5000,
          compile_timeout: 10000,
          memory_limit: 256_000_000,
        }),
      });

      if (!response.ok) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: `Execution service error: ${response.status}`,
          passed: false,
          error: `HTTP ${response.status}`,
          executionTimeMs: 0,
        });
        continue;
      }

      const data = await response.json();
      const stdout = (data.run?.stdout || '').trim();
      const stderr = data.run?.stderr || '';
      const compileErr = data.compile?.stderr || '';
      const error = compileErr || stderr || null;

      const actualOutput = error ? '' : stdout;
      const passed = !error && normalizeOutput(actualOutput) === normalizeOutput(testCase.expectedOutput);

      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: error ? `Error: ${(error as string).split('\n')[0]}` : actualOutput,
        passed,
        error: error || undefined,
        executionTimeMs: data.run?.wall_time ? Math.round(data.run.wall_time * 1000) : 0,
      });
    } catch (err) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: `Network error`,
        passed: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        executionTimeMs: 0,
      });
    }
  }

  return {
    success: results.every((r) => r.passed),
    results,
    totalPassed: results.filter((r) => r.passed).length,
    totalTests: results.length,
  };
}

/**
 * Normalize output for comparison — trim whitespace, normalize JSON formatting.
 */
function normalizeOutput(output: string): string {
  const trimmed = output.trim();
  // Try parsing as JSON for consistent formatting
  try {
    return JSON.stringify(JSON.parse(trimmed));
  } catch {
    return trimmed;
  }
}

/**
 * Wrap user code with test case input/output handling per language.
 */
function wrapCode(code: string, language: string, input: string): string {
  // Escape single quotes in input for string embedding
  const safeInput = input.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  switch (language) {
    case 'python':
      return `${code}

# --- Test runner ---
import json, sys
try:
    input_data = json.loads('${safeInput}')
    if not isinstance(input_data, list):
        input_data = [input_data]
    sol = Solution()
    methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
    if methods:
        result = getattr(sol, methods[0])(*input_data)
        print(json.dumps(result))
    else:
        print("Error: No method found in Solution class")
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
`;

    case 'javascript':
      return `${code}

// --- Test runner ---
try {
  const input = JSON.parse('${safeInput}');
  const args = Array.isArray(input) ? input : [input];
  // Look for exported function or global function
  const fnName = Object.keys(this || {}).find(k => typeof this[k] === 'function') || 'solution';
  if (typeof eval(fnName) === 'function') {
    const result = eval(fnName)(...args);
    console.log(JSON.stringify(result));
  } else {
    console.error("Error: No solution function found");
    process.exit(1);
  }
} catch(e) {
  console.error("Error: " + e.message);
  process.exit(1);
}
`;

    case 'typescript':
      return `${code}

// --- Test runner ---
try {
  const input = JSON.parse('${safeInput}');
  const args = Array.isArray(input) ? input : [input];
  const result = (solution as Function)(...args);
  console.log(JSON.stringify(result));
} catch(e: any) {
  console.error("Error: " + e.message);
  process.exit(1);
}
`;

    default:
      return code;
  }
}
