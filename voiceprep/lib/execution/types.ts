export interface ExecutionRequest {
  code: string;
  language: 'python' | 'javascript' | 'typescript' | 'java' | 'cpp' | 'go';
  testCases: TestCase[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  edgeCaseType?: string;
}

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
  executionTimeMs: number;
}

export interface ExecutionResult {
  success: boolean;
  results: TestResult[];
  totalPassed: number;
  totalTests: number;
  compilationError?: string;
}
