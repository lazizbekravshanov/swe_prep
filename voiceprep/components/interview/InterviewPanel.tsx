'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useInterviewStore } from '@/store/interview-store';
import { useSettingsStore } from '@/store/settings-store';
import { useVoiceController } from './VoiceController';
import { TranscriptDisplay } from './TranscriptDisplay';
import { ProblemDisplay } from './ProblemDisplay';
import { VoiceOrb } from './VoiceOrb';
import { TimerBar } from './TimerBar';
import { ExecutionResults } from './ExecutionResults';
import { Scorecard } from '@/components/feedback/Scorecard';
import { Button } from '@/components/ui/Button';
import { buildExecutionContext } from '@/lib/execution/ai-context';
import type { ExecutionResult } from '@/lib/execution/types';
import type { SessionFeedback } from '@/lib/types';

// Monaco editor must be lazy-loaded — it uses browser APIs not available during SSR
const CodeEditor = dynamic(
  () => import('./CodeEditor').then((mod) => mod.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
        Loading editor...
      </div>
    ),
  }
);

export function InterviewPanel() {
  const {
    state,
    transcript,
    currentCode,
    problem,
    startTime,
    interimTranscript,
    setCode,
  } = useInterviewStore();

  const { language } = useSettingsStore();
  const { startInterview, endInterview, interrupt, pause, resume, updateCode: voiceUpdateCode, audioLevel, isSupported } =
    useVoiceController();

  const [feedback, setFeedback] = useState<SessionFeedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showProblem, setShowProblem] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Run code against test cases
  const handleRunCode = useCallback(async () => {
    if (!problem || isExecuting) return;

    // Build test cases from problem examples
    const testCases = 'examples' in problem
      ? problem.examples.map((ex) => ({
          input: ex.input,
          expectedOutput: ex.output,
        }))
      : [];

    if (testCases.length === 0) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          language,
          testCases,
        }),
      });

      const result: ExecutionResult = await response.json();
      setExecutionResult(result);

      // Inject results into the AI conversation as a system message
      if (state !== 'idle' && state !== 'ended') {
        const context = buildExecutionContext(result);
        const turn = {
          role: 'candidate' as const,
          text: context,
          timestamp: Date.now(),
        };
        useInterviewStore.getState().addTurn(turn);
      }
    } catch (error) {
      console.error('Code execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [problem, currentCode, language, state, isExecuting]);

  // Fetch feedback when session ends
  useEffect(() => {
    if (state !== 'ended' || feedback || loadingFeedback) return;
    if (transcript.length < 2) return;

    setLoadingFeedback(true);
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, problem, code: currentCode }),
    })
      .then((res) => res.json())
      .then((data) => setFeedback(data))
      .catch(console.error)
      .finally(() => setLoadingFeedback(false));
  }, [state, transcript, problem, currentCode, feedback, loadingFeedback]);

  if (!problem) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: 'var(--text-tertiary)', fontSize: 15 }}>
          Select a problem to begin.
        </p>
      </div>
    );
  }

  if (state === 'ended' && feedback) {
    return <Scorecard feedback={feedback} />;
  }

  const isActive = state !== 'idle' && state !== 'ended';

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <TimerBar startTime={startTime} isRunning={isActive} />

        <div className="flex items-center gap-2">
          {!isSupported && (
            <span style={{ fontSize: 12, color: 'var(--danger)' }}>
              Speech not supported in this browser
            </span>
          )}

          {state === 'idle' && (
            <Button onClick={startInterview} disabled={!isSupported}>
              Start Interview
            </Button>
          )}

          {state === 'speaking' && (
            <Button variant="ghost" size="sm" onClick={interrupt}>
              Interrupt
            </Button>
          )}

          {state === 'paused' ? (
            <Button variant="secondary" size="sm" onClick={resume}>
              Resume
            </Button>
          ) : (
            isActive && (
              <Button variant="ghost" size="sm" onClick={pause}>
                Pause
              </Button>
            )
          )}

          {isActive && (
            <Button variant="danger" size="sm" onClick={endInterview}>
              End Interview
            </Button>
          )}

          {state === 'ended' && loadingFeedback && (
            <span
              style={{
                fontSize: 13,
                color: 'var(--text-tertiary)',
                animation: 'voice-think 2s ease-in-out infinite',
              }}
            >
              Generating feedback...
            </span>
          )}
        </div>
      </div>

      {/* Main content: 55/45 split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: voice orb + transcript */}
        <div
          className="flex flex-col"
          style={{ width: '55%', borderRight: '1px solid var(--border-default)' }}
        >
          {/* Problem toggle + voice orb */}
          <div className="flex flex-col items-center py-6 px-6 gap-2">
            {/* Collapsible problem card */}
            <button
              onClick={() => setShowProblem(!showProblem)}
              className="w-full text-left transition-colors"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                background: showProblem ? 'var(--bg-active)' : 'transparent',
              }}
            >
              {showProblem ? 'Hide problem' : 'Show problem'}
              <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>
                {problem.title}
              </span>
            </button>

            {showProblem && (
              <div
                className="w-full frost-panel overflow-y-auto"
                style={{ maxHeight: 240, animation: 'fade-in-up var(--duration-normal) var(--ease-default)' }}
              >
                <ProblemDisplay problem={problem} />
              </div>
            )}

            {/* Voice orb */}
            <div className="py-4">
              <VoiceOrb state={state} size={state === 'idle' ? 100 : 120} audioLevel={audioLevel} />
            </div>
          </div>

          {/* Transcript feed */}
          <div
            className="flex-1 overflow-hidden"
            style={{ borderTop: '1px dashed var(--border-default)' }}
          >
            <TranscriptDisplay
              transcript={transcript}
              interimTranscript={interimTranscript}
            />
          </div>
        </div>

        {/* Right panel: code editor */}
        <div className="flex flex-col" style={{ width: '45%' }}>
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              Code Editor
            </span>
            <div className="flex items-center" style={{ gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{language}</span>
              {'examples' in (problem || {}) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRunCode}
                  disabled={isExecuting || !currentCode.trim()}
                  style={{ fontSize: 12, padding: '4px 10px' }}
                >
                  {isExecuting ? 'Running...' : 'Run'}
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <CodeEditor
                code={currentCode}
                language={language}
                onChange={(code) => { setCode(code); voiceUpdateCode(code); }}
                readOnly={state === 'ended'}
              />
            </div>
            <ExecutionResults result={executionResult} isRunning={isExecuting} />
          </div>
        </div>
      </div>
    </div>
  );
}
