'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewStore } from '@/store/interview-store';
import { useSettingsStore } from '@/store/settings-store';
import { selectProblem, getAllProblems, getTopicsForCompany } from '@/lib/problems/bank';
import { CompanySelector } from '@/components/interview/CompanySelector';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { CandidateLevel, Difficulty } from '@/lib/types';

const difficulties: { value: Difficulty | 'any'; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const languages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
];

const levels: { value: CandidateLevel; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
];

type PrepMode = 'hot_seat' | 'deep_prep';

const pillStyle = (active: boolean): React.CSSProperties => ({
  padding: '7px 16px',
  fontSize: 13,
  fontWeight: 500,
  borderRadius: 'var(--radius-full)',
  border: 'none',
  cursor: 'pointer',
  transition: 'all var(--duration-fast) var(--ease-default)',
  background: active ? 'var(--accent)' : 'var(--bg-surface)',
  color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
});

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--text-tertiary)',
  marginBottom: 10,
};

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  padding: '8px 12px',
  fontSize: 14,
  color: 'var(--text-primary)',
  fontWeight: 500,
  width: '100%',
  maxWidth: 320,
};

export default function SetupPage() {
  const router = useRouter();
  const { setProblem, setCompany, setCandidateLevel } = useInterviewStore();
  const { language, setLanguage } = useSettingsStore();

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | 'any'>('any');
  const [topic, setTopic] = useState<string>('');
  const [mode, setMode] = useState<PrepMode>('hot_seat');
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [candidateLevel, setCandidateLevelLocal] = useState<CandidateLevel>('mid');

  const topics = useMemo(() => {
    if (!selectedCompany) return [];
    return getTopicsForCompany(selectedCompany);
  }, [selectedCompany]);

  const handleBeginInterview = () => {
    // Store selections
    setCompany(selectedCompany);
    setCandidateLevel(candidateLevel);
    setLanguage(selectedLanguage);

    // Pick a weighted random problem
    if (selectedCompany) {
      const problem = selectProblem({
        company: selectedCompany,
        difficulty: difficulty !== 'any' ? difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD' : undefined,
        topic: topic || undefined,
      });
      if (problem) {
        setProblem(problem);
      } else {
        // Fallback to random handcrafted problem
        const all = getAllProblems();
        const filtered = difficulty !== 'any'
          ? all.filter((p) => p.difficulty === difficulty)
          : all;
        const pool = filtered.length > 0 ? filtered : all;
        setProblem(pool[Math.floor(Math.random() * pool.length)]);
      }
    } else {
      // No company selected — pick from handcrafted bank
      const all = getAllProblems();
      const filtered = difficulty !== 'any'
        ? all.filter((p) => p.difficulty === difficulty)
        : all;
      const pool = filtered.length > 0 ? filtered : all;
      setProblem(pool[Math.floor(Math.random() * pool.length)]);
    }

    router.push('/interview');
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 640, padding: '32px 24px' }}>
      {/* Back link */}
      <a
        href="/"
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          transition: 'color var(--duration-fast) var(--ease-default)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        &larr; Back
      </a>

      {/* Page title */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          margin: '20px 0 0',
        }}
      >
        Set up your interview
      </h1>

      {/* Company */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabelStyle}>Company</div>
        <CompanySelector selectedCompany={selectedCompany} onSelect={setSelectedCompany} />
      </div>

      {/* Difficulty */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabelStyle}>Difficulty</div>
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          {difficulties.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              style={pillStyle(difficulty === d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic (optional, shows when company selected) */}
      {selectedCompany && topics.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={sectionLabelStyle}>Topic (optional)</div>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={selectStyle}
          >
            <option value="">Any topic</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {/* Mode */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabelStyle}>Mode</div>
        <div className="grid grid-cols-2" style={{ gap: 12 }}>
          <button
            className="frost-panel frost-panel-hover"
            onClick={() => setMode('hot_seat')}
            style={{
              padding: 20,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--duration-fast) var(--ease-default)',
              borderColor: mode === 'hot_seat' ? 'var(--accent)' : undefined,
              boxShadow: mode === 'hot_seat' ? '0 0 0 2px var(--accent-ring)' : undefined,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Hot Seat
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Last 30 days
            </div>
          </button>

          <button
            className="frost-panel frost-panel-hover"
            onClick={() => setMode('deep_prep')}
            style={{
              padding: 20,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--duration-fast) var(--ease-default)',
              borderColor: mode === 'deep_prep' ? 'var(--accent)' : undefined,
              boxShadow: mode === 'deep_prep' ? '0 0 0 2px var(--accent-ring)' : undefined,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Deep Prep
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              All-time
            </div>
          </button>
        </div>
      </div>

      {/* Language */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabelStyle}>Language</div>
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setSelectedLanguage(lang.value)}
              style={pillStyle(selectedLanguage === lang.value)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Level */}
      <div style={{ marginTop: 32 }}>
        <div style={sectionLabelStyle}>Candidate Level</div>
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          {levels.map((l) => (
            <button
              key={l.value}
              onClick={() => setCandidateLevelLocal(l.value)}
              style={pillStyle(candidateLevel === l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Begin Interview button */}
      <div style={{ marginTop: 40 }}>
        <Button size="lg" onClick={handleBeginInterview} style={{ width: '100%' }}>
          Begin Interview
        </Button>
      </div>
    </div>
  );
}
