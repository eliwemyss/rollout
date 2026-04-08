import { InputHTMLAttributes } from 'react';
import { COLORS } from '../../lib/colors';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const Input = ({ label, helperText, style, ...props }: InputProps) => {
  const containerStyles: React.CSSProperties = {
    marginBottom: '20px',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textMuted,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    fontFamily: 'DM Sans, sans-serif',
    backgroundColor: COLORS.dark,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    color: COLORS.textPrimary,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    ...style,
  };

  const helperStyles: React.CSSProperties = {
    fontSize: '12px',
    color: COLORS.textMuted,
    fontFamily: 'DM Sans, sans-serif',
    marginTop: '6px',
  };

  return (
    <div style={containerStyles}>
      {label && (
        <label style={labelStyles}>
          {label}
          {props.required && <span style={{ color: COLORS.accent, marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <input style={inputStyles} {...props} />
      {helperText && <p style={helperStyles}>{helperText}</p>}
    </div>
  );
};
