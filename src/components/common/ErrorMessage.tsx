import { COLORS } from '../../lib/colors';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '10px',
        backgroundColor: COLORS.dangerGlow,
        border: `1px solid ${COLORS.danger}`,
        marginBottom: '20px',
      }}
    >
      <p
        style={{
          fontSize: '14px',
          fontFamily: 'DM Sans, sans-serif',
          color: COLORS.danger,
          margin: 0,
        }}
      >
        {message}
      </p>
    </div>
  );
};
