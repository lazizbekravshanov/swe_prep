'use client';

import { Button } from '@/components/ui/Button';

type PaywallReason = 'session_limit' | 'company_locked' | 'difficulty_locked';

interface PaywallModalProps {
  reason: PaywallReason;
  onDismiss: () => void;
  onUpgrade: () => void;
}

const titles: Record<PaywallReason, string> = {
  session_limit: "You've used your free sessions",
  company_locked: 'Unlock company-specific prep',
  difficulty_locked: 'Unlock all difficulty levels',
};

const proFeatures = [
  'Unlimited mock interview sessions',
  'All company-specific question banks',
  'All difficulty levels',
  'Priority support',
];

export function PaywallModal({ reason, onDismiss, onUpgrade }: PaywallModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div
        className="frost-panel"
        style={{
          maxWidth: '28rem',
          width: '100%',
          padding: '32px',
          margin: '16px',
          animation: 'fade-in-up var(--duration-normal) var(--ease-default)',
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          {titles[reason]}
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: 1.5,
          }}
        >
          Upgrade to VoicePrep Pro for the full interview prep experience.
        </p>

        {/* Pro tier card */}
        <div
          style={{
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent-ring)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--accent)',
              }}
            >
              VoicePrep Pro
            </span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {proFeatures.map((feature) => (
              <li
                key={feature}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    color: 'var(--success)',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  &#10003;
                </span>
                {feature}
              </li>
            ))}
          </ul>

          {/* Pricing */}
          <div style={{ marginTop: '16px' }}>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              $19
            </span>
            <span
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginLeft: '4px',
              }}
            >
              /month
            </span>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-tertiary)',
                marginTop: '4px',
              }}
            >
              $149/year (save 35%)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button variant="primary" size="lg" onClick={onUpgrade} style={{ width: '100%' }}>
            Start 7-day free trial
          </Button>
          <Button variant="ghost" size="md" onClick={onDismiss} style={{ width: '100%' }}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
