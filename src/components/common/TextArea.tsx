import { TextareaHTMLAttributes } from 'react';
import { COLORS } from '../../lib/colors';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = ({ label, style, ...props }: TextAreaProps) => {
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

  const textareaStyles: React.CSSProperties = {
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
    resize: 'vertical',
    minHeight: '100px',
    boxSizing: 'border-box',
    ...style,
  };

  return (
    <div style={containerStyles}>
      {label && (
        <label style={labelStyles}>
          {label}
          {props.required && <span style={{ color: COLORS.accent, marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <textarea style={textareaStyles} {...props} />
    </div>
  );
};
