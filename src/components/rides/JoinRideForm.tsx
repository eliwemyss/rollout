import { useState, FormEvent } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ErrorMessage } from '../common/ErrorMessage';

interface JoinRideFormProps {
  onJoin: (guestName?: string) => Promise<void>;
  isAuthenticated: boolean;
  userFullName?: string;
}

export const JoinRideForm = ({
  onJoin,
  isAuthenticated,
  userFullName,
}: JoinRideFormProps) => {
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated && !guestName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await onJoin(isAuthenticated ? undefined : guestName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join ride');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}
      {isAuthenticated ? (
        <p
          style={{
            fontSize: '15px',
            fontFamily: 'DM Sans, sans-serif',
            color: '#a0a0a0',
            marginBottom: '16px',
          }}
        >
          Joining as <strong style={{ color: '#fff' }}>{userFullName}</strong>
        </p>
      ) : (
        <Input
          type="text"
          label="Your Name"
          placeholder="Enter your name to join as a guest"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          required
        />
      )}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Joining...' : 'Confirm'}
      </Button>
    </form>
  );
};
