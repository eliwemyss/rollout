import { Users } from 'lucide-react';
import { ParticipantWithProfile } from '../../types';
import { COLORS } from '../../lib/colors';
import { ParticipantItem } from './ParticipantItem';

interface ParticipantListProps {
  participants: ParticipantWithProfile[];
  currentUserId?: string;
  creatorId: string;
  onRemoveParticipant: (participantId: string) => void;
}

export const ParticipantList = ({
  participants,
  currentUserId,
  creatorId,
  onRemoveParticipant,
}: ParticipantListProps) => {
  const containerStyles: React.CSSProperties = {
    marginTop: '24px',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textPrimary,
  };

  const countBadgeStyles: React.CSSProperties = {
    padding: '4px 10px',
    borderRadius: '8px',
    backgroundColor: COLORS.accentGlow,
    color: COLORS.accent,
    fontSize: '12px',
    fontWeight: 800,
    fontFamily: 'JetBrains Mono, monospace',
  };

  const emptyStyles: React.CSSProperties = {
    padding: '20px',
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
  };

  const canRemove = (participant: ParticipantWithProfile) => {
    const currentUserIsCreator = currentUserId === creatorId;
    const isOwnParticipation = currentUserId === participant.user_id;
    return currentUserIsCreator || isOwnParticipation;
  };

  const sorted = [...participants].sort((a, b) => {
    if (a.user_id === creatorId) return -1;
    if (b.user_id === creatorId) return 1;
    return 0;
  });

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <Users size={20} color={COLORS.accent} />
        <h3 style={titleStyles}>Riders</h3>
        <span style={countBadgeStyles}>{participants.length}</span>
      </div>
      {participants.length === 0 ? (
        <div style={emptyStyles}>No riders yet. Be the first to join!</div>
      ) : (
        <div>
          {sorted.map((participant) => (
            <ParticipantItem
              key={participant.id}
              participant={participant}
              canRemove={canRemove(participant)}
              isCreator={participant.user_id === creatorId}
              onRemove={() => onRemoveParticipant(participant.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
