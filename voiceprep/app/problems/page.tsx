'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getAllProblems, getLeetCodeProblemsByCompany, selectProblem } from '@/lib/problems/bank';
import { getTopCompanies } from '@/lib/problems/companies';
import { useInterviewStore } from '@/store/interview-store';
import { ProblemCard } from '@/components/problems/ProblemCard';
import { ProblemFilters } from '@/components/problems/ProblemFilters';
import { CompanySelector } from '@/components/interview/CompanySelector';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Category, Difficulty, Problem, LeetCodeProblem } from '@/lib/types';

function normalizeDifficulty(d: string): Difficulty {
  return d.toLowerCase() as Difficulty;
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  fontSize: 13,
  fontWeight: 500,
  borderRadius: 'var(--radius-md)',
  border: 'none',
  cursor: 'pointer',
  transition: 'all var(--duration-fast) var(--ease-default)',
  background: active ? 'var(--bg-surface)' : 'transparent',
  color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
  backdropFilter: active ? 'blur(12px)' : undefined,
  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.04)' : undefined,
});

export default function ProblemsPage() {
  const router = useRouter();
  const { setProblem, setCompany, reset } = useInterviewStore();
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [tab, setTab] = useState<'handcrafted' | 'company'>('handcrafted');

  const topCompanies = useMemo(() => getTopCompanies(20), []);

  const handcraftedProblems = useMemo(() => {
    let problems = getAllProblems();
    if (category !== 'all') problems = problems.filter((p) => p.category === category);
    if (difficulty !== 'all') problems = problems.filter((p) => p.difficulty === difficulty);
    return problems;
  }, [category, difficulty]);

  const companyProblems = useMemo(() => {
    if (!selectedCompany) return [];
    let problems = getLeetCodeProblemsByCompany(selectedCompany);
    if (difficulty !== 'all')
      problems = problems.filter((p) => normalizeDifficulty(p.difficulty) === difficulty);
    problems.sort(
      (a, b) =>
        (b.company_frequency[selectedCompany] ?? 0) -
        (a.company_frequency[selectedCompany] ?? 0)
    );
    return problems.slice(0, 50);
  }, [selectedCompany, difficulty]);

  const handleSelectHandcrafted = (problem: Problem) => {
    reset();
    setProblem(problem);
    router.push('/interview');
  };

  const handleSelectLeetCode = (problem: LeetCodeProblem) => {
    reset();
    setProblem(problem);
    if (selectedCompany) {
      setTimeout(() => useInterviewStore.getState().setCompany(selectedCompany), 0);
    }
    router.push('/interview');
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 1024, padding: '32px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Problem Bank
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
          Select a problem to start a voice interview session
        </p>
      </div>

      {/* Tab switcher */}
      <div
        className="flex w-fit"
        style={{
          gap: 4,
          padding: 4,
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(0,0,0,0.03)',
          marginBottom: 24,
        }}
      >
        <button style={tabStyle(tab === 'handcrafted')} onClick={() => setTab('handcrafted')}>
          Curated Problems (10)
        </button>
        <button style={tabStyle(tab === 'company')} onClick={() => setTab('company')}>
          Company Problems (1,917)
        </button>
      </div>

      {tab === 'handcrafted' ? (
        <>
          <div style={{ marginBottom: 24 }}>
            <ProblemFilters
              selectedCategory={category}
              selectedDifficulty={difficulty}
              onCategoryChange={setCategory}
              onDifficultyChange={setDifficulty}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {handcraftedProblems.map((p) => (
              <ProblemCard key={p.id} problem={p} onSelect={handleSelectHandcrafted} />
            ))}
          </div>

          {handcraftedProblems.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '48px 0' }}>
              No problems match the current filters.
            </p>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center" style={{ gap: 16, marginBottom: 24 }}>
            <CompanySelector selectedCompany={selectedCompany} onSelect={setSelectedCompany} />

            <div className="flex items-center" style={{ gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-tertiary)',
                }}
              >
                Difficulty
              </span>
              <div className="flex" style={{ gap: 4 }}>
                {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    style={{
                      borderRadius: 'var(--radius-full)',
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      background: difficulty === d ? 'var(--accent)' : 'var(--bg-surface)',
                      color: difficulty === d ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    }}
                  >
                    {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {selectedCompany && (
              <Button
                size="sm"
                onClick={() => {
                  const p = selectProblem({ company: selectedCompany });
                  if (p) handleSelectLeetCode(p);
                }}
              >
                Random {selectedCompany} Problem
              </Button>
            )}
          </div>

          {!selectedCompany ? (
            <div>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: 16,
                }}
              >
                Top companies by problem count
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {topCompanies.map((profile) => (
                  <button
                    key={profile.slug}
                    onClick={() => setSelectedCompany(profile.name)}
                    className="frost-panel frost-panel-hover text-left"
                    style={{ padding: 16, cursor: 'pointer', transition: 'all var(--duration-normal) var(--ease-default)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {profile.name}
                      </span>
                      {profile.recent_problems_30d > 0 && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 11,
                            fontWeight: 500,
                            color: 'var(--success)',
                            background: 'var(--success-soft)',
                          }}
                        >
                          {profile.recent_problems_30d} hot
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {profile.total_problems} problems &middot;{' '}
                      {profile.top_topics.slice(0, 3).map((t) => t.topic).join(', ')}
                    </div>
                    {/* Difficulty bar */}
                    <div className="flex" style={{ gap: 2, marginTop: 8, height: 4, borderRadius: 2, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${profile.difficulty_distribution.easy * 100}%`,
                          background: 'var(--success)',
                          borderRadius: 2,
                        }}
                      />
                      <div
                        style={{
                          width: `${profile.difficulty_distribution.medium * 100}%`,
                          background: 'var(--warning)',
                          borderRadius: 2,
                        }}
                      />
                      <div
                        style={{
                          width: `${profile.difficulty_distribution.hard * 100}%`,
                          background: 'var(--danger)',
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                Top {companyProblems.length} problems for {selectedCompany}, sorted by frequency
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {companyProblems.map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => handleSelectLeetCode(p)}
                    className="frost-panel frost-panel-hover w-full text-left"
                    style={{ padding: 16, cursor: 'pointer', transition: 'all var(--duration-normal) var(--ease-default)' }}
                  >
                    <div className="flex items-start justify-between">
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {p.title}
                      </h3>
                      <Badge variant={normalizeDifficulty(p.difficulty)}>
                        {p.difficulty.toLowerCase()}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap" style={{ gap: 4, marginTop: 8 }}>
                      {p.topics.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 11,
                            color: 'var(--text-tertiary)',
                            background: 'rgba(0,0,0,0.03)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '2px 6px',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)' }}
                    >
                      <span>Frequency: {(p.company_frequency[selectedCompany] ?? 0).toFixed(0)}%</span>
                      <span>Acceptance: {p.acceptance_rate.toFixed(0)}%</span>
                    </div>
                  </button>
                ))}
              </div>

              {companyProblems.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '48px 0' }}>
                  No problems found for {selectedCompany} with the current filters.
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
