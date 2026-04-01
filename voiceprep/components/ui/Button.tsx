'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, style, ...props }, ref) => {
    const sizeStyles: Record<Size, React.CSSProperties> = {
      sm: { padding: '6px 14px', fontSize: '13px' },
      md: { padding: '10px 20px', fontSize: '15px' },
      lg: { padding: '12px 28px', fontSize: '15px' },
    };

    const variantStyles: Record<Variant, React.CSSProperties> = {
      primary: {
        background: 'var(--accent)',
        color: 'var(--text-inverse)',
        border: 'none',
      },
      secondary: {
        background: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
        backdropFilter: 'blur(12px) saturate(150%)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--accent)',
        border: 'none',
      },
      danger: {
        background: 'var(--danger-soft)',
        color: 'var(--danger)',
        border: '1px solid rgba(197, 48, 48, 0.12)',
      },
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center transition-all ${className}`}
        disabled={disabled}
        style={{
          fontWeight: 500,
          borderRadius: 'var(--radius-md)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          ...sizeStyles[size],
          ...variantStyles[variant],
          ...style,
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          if (variant === 'primary') e.currentTarget.style.background = 'var(--accent-hover)';
          else if (variant === 'secondary') {
            e.currentTarget.style.background = 'var(--bg-surface-hover)';
            e.currentTarget.style.borderColor = 'var(--border-hover)';
          }
          else if (variant === 'ghost') e.currentTarget.style.background = 'var(--accent-soft)';
          else if (variant === 'danger') e.currentTarget.style.background = 'rgba(197, 48, 48, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = variantStyles[variant].background as string;
          if (variant === 'secondary') e.currentTarget.style.borderColor = 'var(--border-default)';
        }}
        onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
