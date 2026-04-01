export default function MarketAnalysisPost() {
  return (
    <article className="mx-auto" style={{ maxWidth: 720, padding: '48px 24px' }}>
      <a
        href="/"
        style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
      >
        &larr; Back to home
      </a>

      <header style={{ marginTop: 24, marginBottom: 40 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--accent)',
            marginBottom: 12,
          }}
        >
          Market Analysis
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          The AI Interview Prep Market in 2026: A $450M Opportunity
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 12 }}>
          March 2026 &middot; 6 min read
        </p>
      </header>

      <div
        style={{
          fontSize: 15,
          lineHeight: 1.75,
          color: 'var(--text-primary)',
        }}
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.65, marginBottom: 32 }}>
          The coding interview platform market hit $450M in 2024 and is racing toward $1.8B
          by 2033. Software engineer job postings are up 11% year-over-year, companies are raising
          hiring bars, and AI tools are reshaping how candidates prepare. Here&apos;s where the
          market stands and where VoicePrep fits.
        </p>

        {/* Market size */}
        <h2 style={h2Style}>Market sizing</h2>

        <div className="frost-panel" style={{ padding: 24, marginBottom: 24 }}>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                <th style={thStyle}>Level</th>
                <th style={thStyle}>Market</th>
                <th style={thStyle}>Size</th>
                <th style={thStyle}>CAGR</th>
              </tr>
            </thead>
            <tbody>
              <tr style={trStyle}>
                <td style={tdStyle}><strong>TAM</strong></td>
                <td style={tdStyle}>Global EdTech</td>
                <td style={tdStyle}>$189B</td>
                <td style={tdStyle}>13.5%</td>
              </tr>
              <tr style={trStyle}>
                <td style={tdStyle}><strong>SAM</strong></td>
                <td style={tdStyle}>Coding Interview Platforms</td>
                <td style={tdStyle}>$450M</td>
                <td style={tdStyle}>14.9%</td>
              </tr>
              <tr style={trStyle}>
                <td style={tdStyle}><strong>SOM</strong></td>
                <td style={tdStyle}>AI Mock Interview Services</td>
                <td style={tdStyle}>~$150M</td>
                <td style={tdStyle}>~25%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The broader mock interview services market is valued at $2.06B (2024), while the
          EdTech market overall crossed $189B in 2025. Interview prep sits at the intersection
          of professional development, test preparation, and AI tooling &mdash; three of the
          fastest-growing segments in education technology.
        </p>

        {/* Demand */}
        <h2 style={h2Style}>The demand signal</h2>
        <p>
          LeetCode alone draws <strong>26.3 million monthly visitors</strong>. That&apos;s 26 million
          people practicing coding problems by typing in silence. Not one of them is practicing
          the actual format of the interview &mdash; talking through problems out loud.
        </p>
        <p>
          Meanwhile, hiring is tightening. Companies shifted from growth-at-all-costs to precision
          hiring: smaller teams, higher bars, structured scoring. The result is more interviews per
          candidate, more preparation needed, and a growing premium on communication skills &mdash;
          not just algorithmic ability.
        </p>
        <p>
          The data backs this up: <strong>candidates who practice mock interviews receive 40% more
          job offers</strong> than those who don&apos;t. And 78% of interview anxiety comes from
          speaking under pressure &mdash; the one thing traditional platforms don&apos;t address.
        </p>

        {/* Landscape */}
        <h2 style={h2Style}>Competitive landscape</h2>
        <p>The market splits into three tiers:</p>

        <h3 style={h3Style}>Human mock interviews ($150-225/session)</h3>
        <p>
          Platforms like <strong>interviewing.io</strong> ($149-215/session) and <strong>Exponent</strong> (which
          acquired Pramp) connect you with real FAANG interviewers. The quality is high, but the
          cost is prohibitive for most candidates, and scheduling friction limits usage to 1-2
          sessions before a real interview.
        </p>

        <h3 style={h3Style}>AI cheating tools ($96-200+/mo)</h3>
        <p>
          <strong>Final Round AI</strong> (10M+ users, $6.88M seed from Uncork Capital)
          and <strong>Cluely</strong> run invisibly during live interviews, feeding candidates
          real-time answers. They proved massive demand for AI interview help &mdash; but they&apos;re
          ethically fraught and increasingly detected by employers. Final Round AI charges $96/month.
        </p>

        <h3 style={h3Style}>Traditional prep platforms ($35-199/yr)</h3>
        <p>
          <strong>LeetCode Premium</strong> ($35/mo), <strong>AlgoExpert</strong> ($199/yr),
          and <strong>NeetCode</strong> ($99/yr) dominate this tier. They offer excellent
          problem banks and editorial content, but zero voice practice, no interview simulation,
          and no adaptive AI feedback. You type solutions alone.
        </p>

        {/* Gap */}
        <h2 style={h2Style}>The gap</h2>

        <div className="frost-panel" style={{ padding: 24, marginBottom: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                <th style={thStyle}></th>
                <th style={thStyle}>Voice</th>
                <th style={thStyle}>AI</th>
                <th style={thStyle}>Coding</th>
                <th style={thStyle}>Company-calibrated</th>
                <th style={thStyle}>&lt;$50/mo</th>
                <th style={thStyle}>24/7</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['interviewing.io', true, false, true, true, false, false],
                ['Final Round AI', true, true, true, false, false, true],
                ['LeetCode Premium', false, false, true, true, true, true],
                ['AlgoExpert', false, false, true, false, true, true],
                ['VoicePrep', true, true, true, true, true, true],
              ].map(([name, ...checks]) => (
                <tr key={name as string} style={{
                  ...trStyle,
                  fontWeight: name === 'VoicePrep' ? 600 : 400,
                  color: name === 'VoicePrep' ? 'var(--accent)' : 'var(--text-primary)',
                }}>
                  <td style={tdStyle}>{name as string}</td>
                  {(checks as boolean[]).map((c, i) => (
                    <td key={i} style={{ ...tdStyle, textAlign: 'center', color: c ? 'var(--success)' : 'var(--text-tertiary)' }}>
                      {c ? '\u2713' : '\u2013'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          No existing product checks all six boxes. VoicePrep is the only AI voice interview
          trainer with a live code editor, company-specific calibration across 469 companies,
          and a price point accessible to individual engineers.
        </p>

        {/* Why now */}
        <h2 style={h2Style}>Why now</h2>
        <ul style={{ paddingLeft: 20, marginBottom: 24 }}>
          <li style={liStyle}>
            <strong>AI costs dropped.</strong> Claude Sonnet at $3/M input tokens makes real-time
            voice AI viable at consumer pricing. A full 45-minute interview costs ~$0.10 in API calls.
          </li>
          <li style={liStyle}>
            <strong>Voice AI is normalized.</strong> People talk to AI daily. The behavioral
            barrier to speaking with an AI interviewer is gone.
          </li>
          <li style={liStyle}>
            <strong>Remote interviews are permanent.</strong> 80%+ of phone screens are virtual.
            The format matches our product exactly.
          </li>
          <li style={liStyle}>
            <strong>Cheating tools proved the demand.</strong> Final Round AI hit 10M users.
            The appetite for AI interview help is enormous &mdash; we offer the ethical version.
          </li>
          <li style={liStyle}>
            <strong>Hiring bars are rising.</strong> Structured scoring, panel interviews, and
            standardized evaluation mean communication matters more than ever.
          </li>
        </ul>

        {/* Economics */}
        <h2 style={h2Style}>Unit economics</h2>
        <p>
          At $19/month with Claude API costs of ~$0.60-1.20 per active user, VoicePrep
          operates at <strong>94-97% gross margins</strong>. Traditional prep platforms spend
          millions on content creation (video editors, curriculum designers, editorial writers).
          VoicePrep replaces that entire layer with AI generation at runtime &mdash; every dollar
          that would have gone to content goes to the voice experience instead.
        </p>

        {/* CTA */}
        <div
          className="frost-panel"
          style={{
            padding: 32,
            marginTop: 40,
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Try VoicePrep today
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
            3 free sessions. No credit card required.
          </p>
          <a
            href="/setup"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              borderRadius: 'var(--radius-md)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--text-inverse)',
              background: 'var(--accent)',
              textDecoration: 'none',
            }}
          >
            Start your first interview
          </a>
        </div>

        {/* Sources */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px dashed var(--border-default)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)', marginBottom: 12 }}>
            Sources
          </h3>
          <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 18 }}>
            <li><a href="https://www.verifiedmarketresearch.com/product/coding-interview-platform-market/" style={linkStyle}>Verified Market Research &mdash; Coding Interview Platform Market ($450M, 14.9% CAGR)</a></li>
            <li><a href="https://www.wiseguyreports.com/reports/mock-interview-service-market" style={linkStyle}>WiseGuy Reports &mdash; Mock Interview Service Market ($2.06B)</a></li>
            <li><a href="https://www.fortunebusinessinsights.com/edtech-market-111377" style={linkStyle}>Fortune Business Insights &mdash; EdTech Market ($189B in 2025)</a></li>
            <li><a href="https://www.myyl.tech/all-blog-posts/leetcode-growth-user-base-and-industry-impact" style={linkStyle}>LeetCode Growth &amp; User Base (26.3M monthly visitors)</a></li>
            <li><a href="https://www.prnewswire.com/news-releases/final-round-ai-secures-6-88m-in-oversubscribed-seed-funding-to-transform-the-job-search-journey-302363088.html" style={linkStyle}>Final Round AI $6.88M Seed Funding (PR Newswire)</a></li>
            <li><a href="https://finance.yahoo.com/news/data-shows-surprising-rebound-tech-141608296.html" style={linkStyle}>Yahoo Finance &mdash; SWE Job Postings Up 11% YoY</a></li>
            <li><a href="https://interviewsidekick.com/blog/ai-mock-interview-tools" style={linkStyle}>Interview Sidekick &mdash; AI Mock Interview Tools 2026</a></li>
          </ul>
        </div>
      </div>
    </article>
  );
}

// Shared styles
const h2Style: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  letterSpacing: '-0.02em',
  color: 'var(--text-primary)',
  marginTop: 40,
  marginBottom: 12,
};

const h3Style: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginTop: 24,
  marginBottom: 8,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--text-tertiary)',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
};

const trStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--border-default)',
};

const liStyle: React.CSSProperties = {
  marginBottom: 10,
};

const linkStyle: React.CSSProperties = {
  color: 'var(--accent)',
  textDecoration: 'none',
};
