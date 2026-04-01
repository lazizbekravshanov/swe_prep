'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col items-center px-4" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ maxWidth: 640, textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Practice interviews
          <br />
          <span style={{ color: 'var(--accent)' }}>by voice</span>
        </h1>

        <p
          style={{
            fontSize: 17,
            color: 'var(--text-secondary)',
            maxWidth: 480,
            margin: '20px auto 0',
            lineHeight: 1.6,
          }}
        >
          Talk through problems with an AI interviewer. Get real-time feedback
          on your problem-solving, coding, and communication skills.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center"
          style={{ gap: 12, marginTop: 36 }}
        >
          <Button size="lg" onClick={() => router.push('/problems')}>
            Browse Problems
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push('/interview')}
          >
            Quick Interview
          </Button>
        </div>

        <div
          className="grid grid-cols-3"
          style={{
            gap: 32,
            paddingTop: 32,
            marginTop: 40,
            borderTop: '1px dashed var(--border-default)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: 'var(--accent)',
              }}
            >
              3,173
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-tertiary)',
                marginTop: 4,
              }}
            >
              Interview problems
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: 'var(--accent)',
              }}
            >
              469
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-tertiary)',
                marginTop: 4,
              }}
            >
              Companies
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: 'var(--accent)',
              }}
            >
              Voice
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-tertiary)',
                marginTop: 4,
              }}
            >
              AI interviewer
            </div>
          </div>
        </div>

        {/* Blog section */}
        <div style={{ marginTop: 64, textAlign: 'left', width: '100%' }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: 20,
            }}
          >
            From the blog
          </h2>

          <a
            href="/blog/ai-interview-prep-market-2026"
            className="frost-panel frost-panel-hover"
            style={{
              display: 'block',
              padding: 24,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--accent)',
                marginBottom: 8,
              }}
            >
              Market Analysis
            </div>
            <h3
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 8px',
                letterSpacing: '-0.01em',
              }}
            >
              The AI Interview Prep Market in 2026: A $450M Opportunity
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              The coding interview platform market is growing at 15% annually.
              LeetCode has 26M monthly users, yet none of them practice the actual
              format of the interview &mdash; talking through problems out loud. Here&apos;s
              where VoicePrep fits.
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>March 2026</span>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>&middot;</span>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>6 min read</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
