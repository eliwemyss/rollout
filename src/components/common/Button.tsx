import { ButtonHTMLAttributes } from 'react';
import { COLORS } from '../../lib/colors';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export const Button = ({
  variant = 'primary',
  fullWidth = false,
  style,
  children,
  ...props
}: ButtonProps) => {
  const baseStyles: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    width: fullWidth ? '100%' : undefined,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: COLORS.accent,
      color: COLORS.black,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: COLORS.textSecondary,
      border: `1px solid ${COLORS.border}`,
    },
    danger: {
      backgroundColor: COLORS.dangerGlow,
      color: COLORS.danger,
      border: `1px solid ${COLORS.danger}`,
    },
  };

  return (
    <button
      style={{ ...baseStyles, ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
};
