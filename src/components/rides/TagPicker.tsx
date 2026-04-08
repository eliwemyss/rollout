import { RIDE_TAGS } from '../../lib/rideTags';
import { COLORS } from '../../lib/colors';

interface TagPickerProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export const TagPicker = ({ selected, onChange }: TagPickerProps) => {
  const toggle = (tagId: string) => {
    if (selected.includes(tagId)) {
      onChange(selected.filter((t) => t !== tagId));
    } else {
      onChange([...selected, tagId]);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          color: COLORS.textMuted,
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Ride Type
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {RIDE_TAGS.map((tag) => {
          const isSelected = selected.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                color: isSelected ? tag.color : COLORS.textMuted,
                backgroundColor: isSelected ? tag.color + '18' : 'transparent',
                border: `1px solid ${isSelected ? tag.color + '50' : COLORS.border}`,
              }}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
      <p
        style={{
          fontSize: '12px',
          color: COLORS.textMuted,
          fontFamily: 'DM Sans, sans-serif',
          marginTop: '6px',
        }}
      >
        Select one or more tags
      </p>
    </div>
  );
};
