import { Coffee } from 'lucide-react';
import { COLORS } from '../../lib/colors';

interface TipLeaderButtonProps {
  creatorName: string;
}

export const TipLeaderButton = ({ creatorName }: TipLeaderButtonProps) => {
  const buttonStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '12px',
    border: `1px solid ${COLORS.border}`,
    backgroundColor: 'transparent',
    color: COLORS.textSecondary,
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <button
      style={buttonStyles}
      onClick={() => {
        // Stripe tipping integration placeholder
        alert(`Tipping for ${creatorName} coming soon!`);
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.accent;
        e.currentTarget.style.color = COLORS.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.color = COLORS.textSecondary;
      }}
    >
      <Coffee size={16} />
      Buy {creatorName} a coffee
    </button>
  );
};
