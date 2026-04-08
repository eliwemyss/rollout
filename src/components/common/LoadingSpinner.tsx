import { COLORS } from '../../lib/colors';

export const LoadingSpinner = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 20px',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: `3px solid ${COLORS.border}`,
          borderTop: `3px solid ${COLORS.accent}`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  );
};
