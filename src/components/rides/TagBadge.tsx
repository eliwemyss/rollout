import { getTagById } from '../../lib/rideTags';

interface TagBadgeProps {
  tagId: string;
  size?: 'sm' | 'md';
}

export const TagBadge = ({ tagId, size = 'sm' }: TagBadgeProps) => {
  const tag = getTagById(tagId);
  if (!tag) return null;

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: isSmall ? '2px 8px' : '4px 12px',
        borderRadius: '20px',
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        color: tag.color,
        backgroundColor: tag.color + '15',
        border: `1px solid ${tag.color}30`,
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
      }}
    >
      {tag.label}
    </span>
  );
};
