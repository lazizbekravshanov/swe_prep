import { Badge } from '@/components/ui/Badge';

const checkIcon = (
  <svg
    style={{ width: 16, height: 16, color: 'var(--success)', flexShrink: 0, marginTop: 2 }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const featureRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  fontSize: 14,
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
  marginBottom: 12,
};

const faqSummaryStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 500,
  color: 'var(--text-primary)',
  cursor: 'pointer',
  padding: '16px 0',
  listStyle: 'none',
};

const faqAnswerStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  lineHeight: 1.7,
  paddingBottom: 16,
  margin: 0,
};

const faqDividerStyle: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid var(--border-default)',
  margin: 0,
};

export default function PricingPage() {
  return (
    <div className="mx-auto" style={{ maxWidth: 768, padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Simple pricing
        </h1>
        <p
          style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            marginTop: 8,
            margin: '8px 0 0',
          }}
        >
          Start free, upgrade when you&apos;re ready.
        </p>
      </div>

      {/* Pricing cards */}
      <div
        className="grid md:grid-cols-2"
        style={{ gap: 20, maxWidth: 672, margin: '0 auto' }}
      >
        {/* Free plan */}
        <div
          className="frost-panel"
          style={{ padding: 28, display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Free
            </div>
            <div className="flex items-baseline" style={{ gap: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                $0
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
                /forever
              </span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={featureRowStyle}>{checkIcon}<span>3 sessions/month</span></div>
            <div style={featureRowStyle}>{checkIcon}<span>10 curated problems</span></div>
            <div style={featureRowStyle}>{checkIcon}<span>Basic feedback</span></div>
            <div style={featureRowStyle}>{checkIcon}<span>Browser voice</span></div>
          </div>

          <a
            href="/setup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '10px 20px',
              fontSize: 15,
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              background: 'transparent',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              marginTop: 20,
            }}
          >
            Current plan
          </a>
        </div>

        {/* Pro plan */}
        <div
          className="frost-panel"
          style={{
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            borderColor: 'var(--accent)',
            boxShadow: '0 0 0 1px var(--accent-ring), 0 4px 16px rgba(0, 0, 0, 0.04)',
            position: 'relative',
          }}
        >
          {/* Badge */}
          <div style={{ position: 'absolute', top: -10, right: 16 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent)',
                color: 'var(--text-inverse)',
                letterSpacing: '0.01em',
              }}
            >
              Most popular
            </span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Pro
            </div>
            <div className="flex items-baseline" style={{ gap: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                $19
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
                /month
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '6px 0 0' }}>
              or $149/year (save 35%)
            </p>
          </div>

          <div style={{ flex: 1 }}>
            <div style={featureRowStyle}>{checkIcon}<span>Unlimited sessions</span></div>
            <div style={featureRowStyle}>{checkIcon}<span>1,917+ company problems</span></div>
            <div style={featureRowStyle}>{checkIcon}<span>Company-calibrated AI</span></div>
            <div style={featureRowStyle}>{checkIcon}<span>Detailed feedback &amp; transcript</span></div>
            <div style={featureRowStyle}>{checkIcon}<span>Priority support</span></div>
          </div>

          <a
            href="/api/billing/checkout"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '10px 20px',
              fontSize: 15,
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--accent)',
              color: 'var(--text-inverse)',
              textDecoration: 'none',
              marginTop: 20,
            }}
          >
            Start 7-day free trial
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 560, margin: '64px auto 0' }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 8px',
          }}
        >
          Frequently asked questions
        </h2>

        <hr style={faqDividerStyle} />

        <details>
          <summary style={faqSummaryStyle}>Can I cancel anytime?</summary>
          <p style={faqAnswerStyle}>
            Yes. You can cancel your subscription at any time from your account settings. You&apos;ll keep access to Pro features until the end of your current billing period.
          </p>
        </details>

        <hr style={faqDividerStyle} />

        <details>
          <summary style={faqSummaryStyle}>What happens after my trial?</summary>
          <p style={faqAnswerStyle}>
            After your 7-day free trial, you&apos;ll be charged the plan price you selected. If you cancel during the trial, you won&apos;t be charged anything.
          </p>
        </details>

        <hr style={faqDividerStyle} />

        <details>
          <summary style={faqSummaryStyle}>Do you store my code?</summary>
          <p style={faqAnswerStyle}>
            Your code and transcripts are stored securely and are only accessible to you. You can delete your session data at any time from your dashboard.
          </p>
        </details>

        <hr style={faqDividerStyle} />

        <details>
          <summary style={faqSummaryStyle}>Which companies are available?</summary>
          <p style={faqAnswerStyle}>
            We have interview problems from 469+ companies including Google, Meta, Amazon, Apple, Microsoft, and many more. Problems are sourced from real interview reports and updated regularly.
          </p>
        </details>

        <hr style={faqDividerStyle} />

        <details>
          <summary style={faqSummaryStyle}>What browsers work?</summary>
          <p style={faqAnswerStyle}>
            VoicePrep works best in Chrome and Edge, which have the strongest support for the Web Speech API. Safari and Firefox have partial support. A microphone is required for voice interviews.
          </p>
        </details>

        <hr style={faqDividerStyle} />
      </div>
    </div>
  );
}
