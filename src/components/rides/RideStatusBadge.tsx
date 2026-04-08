import { RideStatus } from '../../types';
import { COLORS } from '../../lib/colors';

interface RideStatusBadgeProps {
  status: RideStatus;
}

const statusConfig: Record<RideStatus, { label: string; color: string; bg: string }> = {
  upcoming: {
    label: 'Upcoming',
    color: COLORS.accent,
    bg: COLORS.accentGlow,
  },
  ongoing: {
    label: 'Live',
    color: COLORS.warning,
    bg: 'rgba(255, 184, 0, 0.08)',
  },
  completed: {
    label: 'Completed',
    color: COLORS.textMuted,
    bg: 'rgba(102, 102, 102, 0.08)',
  },
};

export const RideStatusBadge = ({ status }: RideStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '8px',
        backgroundColor: config.bg,
        color: config.color,
        fontSize: '12px',
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {status === 'ongoing' && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: config.color,
          }}
        />
      )}
      {config.label}
    </span>
  );
};
