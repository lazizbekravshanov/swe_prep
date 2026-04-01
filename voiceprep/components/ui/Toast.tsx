'use client';

import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const borderColors: Record<ToastType, string> = {
  success: 'var(--success)',
  error: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--accent)',
};

export function Toast({ message, type, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setVisible(false);
    }, 4500);

    const removeTimer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  return (
    <div
      className="frost-panel"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        minWidth: '280px',
        maxWidth: '420px',
        borderLeft: `3px solid ${borderColors[type]}`,
        borderRadius: 'var(--radius-md)',
        animation: visible
          ? 'toast-slide-up var(--duration-normal) var(--ease-default)'
          : 'toast-fade-out var(--duration-fast) var(--ease-default) forwards',
      }}
    >
      <span
        style={{
          flex: 1,
          fontSize: '14px',
          color: 'var(--text-primary)',
          lineHeight: 1.4,
        }}
      >
        {message}
      </span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 150);
        }}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: 'var(--text-tertiary)',
          fontSize: '16px',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        &#10005;
      </button>
      <style>{`
        @keyframes toast-slide-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes toast-fade-out {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(8px);
          }
        }
      `}</style>
    </div>
  );
}
