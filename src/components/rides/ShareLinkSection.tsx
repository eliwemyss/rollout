import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { COLORS } from '../../lib/colors';

interface ShareLinkSectionProps {
  rideId: string;
}

export const ShareLinkSection = ({ rideId }: ShareLinkSectionProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/ride/${rideId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          color: COLORS.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px',
        }}
      >
        Share Link
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: COLORS.dark,
            border: `1px solid ${COLORS.border}`,
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
            color: COLORS.textSecondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {shareUrl}
        </div>
        <button
          onClick={handleCopy}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            border: `1px solid ${copied ? COLORS.accent : COLORS.border}`,
            backgroundColor: copied ? COLORS.accentGlow : 'transparent',
            color: copied ? COLORS.accent : COLORS.textSecondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.2s ease',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
