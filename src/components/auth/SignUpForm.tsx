import { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ErrorMessage } from '../common/ErrorMessage';

export const SignUpForm = () => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signUp(email, password, fullName);
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '15px',
          color: '#a0a0a0',
          lineHeight: 1.6,
        }}
      >
        Check your email for a confirmation link to complete your sign up.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}
      <Input
        type="text"
        label="Full Name"
        placeholder="Your name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <Input
        type="email"
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        label="Password"
        placeholder="Choose a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};
