'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { getTopCompanies, searchCompanies } from '@/lib/problems/companies';
import type { CompanyProfile } from '@/lib/types';

interface CompanySelectorProps {
  selectedCompany: string | null;
  onSelect: (company: string | null) => void;
}

export function CompanySelector({ selectedCompany, onSelect }: CompanySelectorProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query) return getTopCompanies(30);
    return searchCompanies(query).slice(0, 30);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="frost-panel flex items-center"
        style={{
          gap: 8,
          padding: '8px 14px',
          fontSize: 14,
          color: selectedCompany ? 'var(--text-primary)' : 'var(--text-tertiary)',
          cursor: 'pointer',
          transition: `all var(--duration-fast) var(--ease-default)`,
        }}
      >
        {selectedCompany ? (
          <>
            <CompanyDot company={selectedCompany} />
            {selectedCompany}
          </>
        ) : (
          <span>Any Company</span>
        )}
        <svg
          style={{ width: 14, height: 14, color: 'var(--text-tertiary)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="frost-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 50,
            marginTop: 4,
            width: 288,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 8 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies..."
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 14,
                color: 'var(--text-primary)',
                background: 'var(--bg-code)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
            />
          </div>

          {selectedCompany && (
            <button
              onClick={() => {
                onSelect(null);
                setQuery('');
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                textAlign: 'left',
                fontSize: 14,
                color: 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-default)',
                cursor: 'pointer',
                transition: `background var(--duration-fast) var(--ease-default)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Clear selection
            </button>
          )}

          <div className="scrollbar-thin" style={{ maxHeight: 256, overflowY: 'auto' }}>
            {results.map((profile) => (
              <CompanyRow
                key={profile.slug}
                profile={profile}
                isSelected={profile.name === selectedCompany}
                onSelect={() => {
                  onSelect(profile.name);
                  setQuery('');
                  setIsOpen(false);
                }}
              />
            ))}
            {results.length === 0 && (
              <p
                style={{
                  padding: '16px 14px',
                  textAlign: 'center',
                  fontSize: 14,
                  color: 'var(--text-tertiary)',
                  margin: 0,
                }}
              >
                No companies found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyRow({
  profile,
  isSelected,
  onSelect,
}: {
  profile: CompanyProfile;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex items-center justify-between w-full"
      style={{
        padding: '10px 14px',
        textAlign: 'left',
        fontSize: 14,
        color: 'var(--text-primary)',
        background: isSelected ? 'var(--bg-active)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: `background var(--duration-fast) var(--ease-default)`,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isSelected ? 'var(--bg-active)' : 'transparent';
      }}
    >
      <div className="flex items-center" style={{ gap: 8 }}>
        <CompanyDot company={profile.name} />
        <span>{profile.name}</span>
      </div>
      <div className="flex items-center" style={{ gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {profile.total_problems} problems
        </span>
        {profile.recent_problems_30d > 0 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--success)',
              background: 'var(--success-soft)',
            }}
          >
            {profile.recent_problems_30d} hot
          </span>
        )}
      </div>
    </button>
  );
}

function CompanyDot({ company }: { company: string }) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;

  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: 'var(--radius-full)',
        flexShrink: 0,
        backgroundColor: `hsl(${hue}, 50%, 55%)`,
      }}
    />
  );
}
