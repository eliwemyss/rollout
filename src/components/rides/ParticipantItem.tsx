import { Trash2 } from 'lucide-react';
import { ParticipantWithProfile } from '../../types';
import { COLORS } from '../../lib/colors';
import { formatJoinedTime } from '../../utils/dateHelpers';

interface ParticipantItemProps {
  participant: ParticipantWithProfile;
  canRemove: boolean;
  isCreator: boolean;
  onRemove: () => void;
}

export const ParticipantItem = ({
  participant,
  canRemove,
  isCreator,
  onRemove,
}: ParticipantItemProps) => {
  const isGuest = !participant.user_id;
  const name = isGuest ? participant.guest_name : (participant.profile?.full_name || 'Unknown');
  const initial = name?.charAt(0).toUpperCase() || '?';

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: isCreator ? 'rgba(0, 255, 135, 0.05)' : COLORS.dark,
    border: `1px solid ${isCreator ? COLORS.accent : COLORS.border}`,
    borderRadius: '12px',
    marginBottom: '8px',
  };

  const avatarStyles: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: COLORS.card,
    border: `2px solid ${isGuest && !isCreator ? COLORS.borderLight : COLORS.accent}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: isGuest && !isCreator ? COLORS.textMuted : COLORS.accent,
    flexShrink: 0,
  };

  const infoStyles: React.CSSProperties = {
    flex: 1,
  };

  const nameStyles: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: isGuest && !isCreator ? 400 : 600,
    fontFamily: 'DM Sans, sans-serif',
    color: COLORS.textPrimary,
  };

  const metaStyles: React.CSSProperties = {
    fontSize: '13px',
    color: COLORS.textMuted,
    fontFamily: 'DM Sans, sans-serif',
  };

  const removeButtonStyles: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: COLORS.danger,
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  return (
    <div style={itemStyles}>
      <div style={avatarStyles}>{initial}</div>
      <div style={infoStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={nameStyles}>{name}</span>
          {isCreator && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: COLORS.accentGlow,
                color: COLORS.accent,
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.04em',
                textTransform: 'uppercase' as const,
                flexShrink: 0,
              }}
            >
              Ride Leader
            </span>
          )}
        </div>
        <div style={metaStyles}>
          {formatJoinedTime(participant.joined_at)}
          {isGuest && !isCreator && ' • Guest'}
        </div>
      </div>
      {canRemove && (
        <button
          style={removeButtonStyles}
          onClick={onRemove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title="Remove participant"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};
