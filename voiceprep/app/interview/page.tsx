'use client';

import { useCallback, useEffect, useState } from 'react';
import { useInterviewStore } from '@/store/interview-store';
import { useSettingsStore } from '@/store/settings-store';
import { InterviewPanel } from '@/components/interview/InterviewPanel';
import { CompanySelector } from '@/components/interview/CompanySelector';
import { MicPermissionGate } from '@/components/interview/MicPermissionGate';
import { SessionRecoveryPrompt } from '@/components/interview/SessionRecoveryPrompt';
import { startSessionAutosave } from '@/lib/voice/session-recovery';
import { getAllProblems, selectProblem } from '@/lib/problems/bank';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { CandidateLevel, Difficulty } from '@/lib/types';

const languages = ['python', 'javascript', 'typescript', 'java', 'cpp', 'go'];
const levels: { value: CandidateLevel; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
];

function normalizeDifficulty(d: string): Difficulty {
  return d.toLowerCase() as Difficulty;
}

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  padding: '5px 10px',
  fontSize: 13,
  color: 'var(--text-primary)',
  fontWeight: 500,
};

export default function InterviewPage() {
  const { problem, company, candidateLevel, setProblem, setCompany, setCandidateLevel, reset } =
    useInterviewStore();
  const { language, setLanguage } = useSettingsStore();
  const [showRecovery, setShowRecovery] = useState(true);

  // Session autosave
  useEffect(() => {
    const cleanup = startSessionAutosave(() => useInterviewStore.getState());
    return cleanup;
  }, []);

  const pickProblem = useCallback(() => {
    if (company) {
      const lc = selectProblem({ company });
      if (lc) {
        setProblem(lc);
        return;
      }
    }
    const problems = getAllProblems();
    const random = problems[Math.floor(Math.random() * problems.length)];
    setProblem(random);
  }, [company, setProblem]);

  useEffect(() => {
    const state = useInterviewStore.getState().state;
    if (state === 'idle') {
      pickProblem();
    }
  }, [company, pickProblem]);

  const handleNewProblem = () => {
    reset();
    if (company) {
      setTimeout(() => {
        useInterviewStore.getState().setCompany(company);
        pickProblem();
      }, 0);
    } else {
      pickProblem();
    }
  };

  const handleCompanyChange = (newCompany: string | null) => {
    setCompany(newCompany);
    const state = useInterviewStore.getState().state;
    if (state === 'idle') {
      if (newCompany) {
        const lc = selectProblem({ company: newCompany });
        if (lc) setProblem(lc);
      } else {
        const problems = getAllProblems();
        setProblem(problems[Math.floor(Math.random() * problems.length)]);
      }
    }
  };

  return (
    <MicPermissionGate>
    {showRecovery && (
      <SessionRecoveryPrompt
        onRecover={(session) => {
          // Restore transcript and code from recovered session
          session.transcript.forEach((t) => useInterviewStore.getState().addTurn(t));
          useInterviewStore.getState().setCode(session.code);
          if (session.company) useInterviewStore.getState().setCompany(session.company);
          setShowRecovery(false);
        }}
        onDismiss={() => setShowRecovery(false)}
      />
    )}
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Settings bar */}
      <div
        className="flex items-center justify-between px-6 py-2.5"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-3">
          <CompanySelector selectedCompany={company} onSelect={handleCompanyChange} />
          {problem && (
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                {problem.title}
              </span>
              <Badge variant={normalizeDifficulty(problem.difficulty)}>
                {problem.difficulty.toLowerCase()}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={candidateLevel}
            onChange={(e) => setCandidateLevel(e.target.value as CandidateLevel)}
            style={selectStyle}
          >
            {levels.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={selectStyle}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          <Button variant="ghost" size="sm" onClick={handleNewProblem}>
            New Problem
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <InterviewPanel />
      </div>
    </div>
    </MicPermissionGate>
  );
}
