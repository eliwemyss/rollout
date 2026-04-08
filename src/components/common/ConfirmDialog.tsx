import { COLORS } from '../../lib/colors';
import { Button } from './Button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  };

  const dialogStyles: React.CSSProperties = {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '100%',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textPrimary,
    marginBottom: '12px',
  };

  const messageStyles: React.CSSProperties = {
    fontSize: '15px',
    fontFamily: 'DM Sans, sans-serif',
    color: COLORS.textSecondary,
    lineHeight: 1.6,
    marginBottom: '24px',
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  };

  return (
    <div style={overlayStyles} onClick={onCancel}>
      <div style={dialogStyles} onClick={(e) => e.stopPropagation()}>
        <h3 style={titleStyles}>{title}</h3>
        <p style={messageStyles}>{message}</p>
        <div style={actionsStyles}>
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
